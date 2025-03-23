import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;

class FriendService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final firebase_auth.FirebaseAuth _auth = firebase_auth.FirebaseAuth.instance;

  // Singleton pattern
  static final FriendService _instance = FriendService._internal();
  factory FriendService() => _instance;
  FriendService._internal();

  // Get friend requests for current user
  Stream<List<UserWithId>> getFriendRequests() {
    final currentUser = _auth.currentUser;
    if (currentUser == null) {
      return Stream.value([]);
    }

    return _firestore
        .collection('users')
        .where('uid', isEqualTo: currentUser.uid)
        .snapshots()
        .asyncMap((snapshot) async {
      if (snapshot.docs.isEmpty) return [];

      final userData = snapshot.docs.first.data();
      final friendRequests =
          List<String>.from(userData['friendRequests'] ?? []);

      if (friendRequests.isEmpty) return [];

      final requestsQuery = await _firestore
          .collection('users')
          .where('uid', whereIn: friendRequests)
          .get();

      return requestsQuery.docs
          .map((doc) => UserWithId(
                user: User.fromJson(doc.data()),
                id: doc.id,
              ))
          .toList();
    });
  }

  // Get friends list
  Stream<List<UserWithId>> getFriends() {
    final currentUser = _auth.currentUser;
    if (currentUser == null) {
      return Stream.value([]);
    }

    return _firestore
        .collection('users')
        .where('uid', isEqualTo: currentUser.uid)
        .snapshots()
        .asyncMap((snapshot) async {
      if (snapshot.docs.isEmpty) return [];

      final userData = snapshot.docs.first.data();
      final friends = List<String>.from(userData['friends'] ?? []);

      if (friends.isEmpty) return [];

      final friendsQuery = await _firestore
          .collection('users')
          .where('uid', whereIn: friends)
          .get();

      return friendsQuery.docs
          .map((doc) => UserWithId(
                user: User.fromJson(doc.data()),
                id: doc.id,
              ))
          .toList();
    });
  }

  // Search users for friend requests
  Stream<List<UserWithId>> searchUsers(String searchTerm) {
    if (searchTerm.trim().isEmpty) {
      return Stream.value([]);
    }

    final currentUser = _auth.currentUser;
    if (currentUser == null) {
      return Stream.value([]);
    }

    return _firestore
        .collection('users')
        .where('username', isGreaterThanOrEqualTo: searchTerm)
        .where('username', isLessThanOrEqualTo: searchTerm + '\uf8ff')
        .snapshots()
        .asyncMap((snapshot) async {
      if (snapshot.docs.isEmpty) return [];

      // Get current user data to check friends and pending requests
      final currentUserDoc = await _firestore
          .collection('users')
          .where('uid', isEqualTo: currentUser.uid)
          .get();

      if (currentUserDoc.docs.isEmpty) {
        return [];
      }

      final currentUserData = currentUserDoc.docs.first.data();
      final friends = List<String>.from(currentUserData['friends'] ?? []);

      // Get the list of users who have sent you friend requests
      final friendRequestsToMe =
          List<String>.from(currentUserData['friendRequests'] ?? []);

      // Filter results
      final filteredUsers = snapshot.docs
          .map((doc) => UserWithId(
                user: User.fromJson(doc.data()),
                id: doc.id,
              ))
          .where((userWithId) {
        final isNotCurrentUser = userWithId.user.uid != currentUser.uid;
        final isNotFriend = !friends.contains(userWithId.user.uid);

        // Check if this user has sent me a friend request
        final isNotRequestingMe =
            !friendRequestsToMe.contains(userWithId.user.uid);

        // Check if I haven't already sent a request to this user
        final friendRequests =
            List<String>.from(userWithId.user.friendRequests ?? []);
        final hasNoPendingRequest = !friendRequests.contains(currentUser.uid);

        return isNotCurrentUser &&
            isNotFriend &&
            hasNoPendingRequest &&
            isNotRequestingMe;
      }).toList();

      return filteredUsers;
    });
  }

  // Send friend request
  Future<void> sendFriendRequest(String friendUid) async {
    try {
      final currentUser = _auth.currentUser;
      if (currentUser == null) {
        throw Exception("No authenticated user found");
      }

      final idToken = await currentUser.getIdToken();

      // Get current user document
      final currentUserQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: currentUser.uid)
          .get();

      if (currentUserQuery.docs.isEmpty) {
        throw Exception("Current user document not found");
      }

      final currentUserDoc = currentUserQuery.docs.first;
      final currentUserData = currentUserDoc.data();

      // Get target user document
      final targetUserQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: friendUid)
          .get();

      if (targetUserQuery.docs.isEmpty) {
        throw Exception("Target user not found");
      }

      final targetUserDoc = targetUserQuery.docs.first;

      // Check if already friends
      final friends = List<String>.from(currentUserData['friends'] ?? []);
      if (friends.contains(friendUid)) {
        throw Exception("Already friends with this user");
      }

      // Add to friend requests of target user
      await _firestore.runTransaction((transaction) async {
        // Add to the target user's friendRequests array
        final targetFriendRequests =
            List<String>.from(targetUserDoc.data()['friendRequests'] ?? []);
        if (!targetFriendRequests.contains(currentUser.uid)) {
          targetFriendRequests.add(currentUser.uid);
          transaction.update(targetUserDoc.reference,
              {'friendRequests': targetFriendRequests});
        }
      });
    } catch (e) {
      AppLogger.e("Error sending friend request: $e");
      throw Exception(getCustomError(e));
    }
  }

  // Accept friend request
  Future<void> acceptFriendRequest(String friendUid) async {
    try {
      final currentUser = _auth.currentUser;
      if (currentUser == null) {
        throw Exception("No authenticated user found");
      }

      final idToken = await currentUser.getIdToken();

      // Get current user document
      final currentUserQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: currentUser.uid)
          .get();

      if (currentUserQuery.docs.isEmpty) {
        throw Exception("Current user document not found");
      }

      final currentUserDoc = currentUserQuery.docs.first;

      // Get friend user document
      final friendUserQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: friendUid)
          .get();

      if (friendUserQuery.docs.isEmpty) {
        throw Exception("Friend user not found");
      }

      final friendUserDoc = friendUserQuery.docs.first;

      await _firestore.runTransaction((transaction) async {
        // Get fresh data within transaction
        final currentUserSnapshot =
            await transaction.get(currentUserDoc.reference);
        final friendUserSnapshot =
            await transaction.get(friendUserDoc.reference);

        final currentUserData = currentUserSnapshot.data()!;
        final friendUserData = friendUserSnapshot.data()!;

        // Update current user: remove from friendRequests, add to friends
        final friendRequests =
            List<String>.from(currentUserData['friendRequests'] ?? []);
        if (friendRequests.contains(friendUid)) {
          friendRequests.remove(friendUid);
        }

        final currentUserFriends =
            List<String>.from(currentUserData['friends'] ?? []);
        if (!currentUserFriends.contains(friendUid)) {
          currentUserFriends.add(friendUid);
        }

        transaction.update(currentUserDoc.reference,
            {'friendRequests': friendRequests, 'friends': currentUserFriends});

        final friendUserFriends =
            List<String>.from(friendUserData['friends'] ?? []);
        if (!friendUserFriends.contains(currentUser.uid)) {
          friendUserFriends.add(currentUser.uid);
        }

        transaction
            .update(friendUserDoc.reference, {'friends': friendUserFriends});
      });
    } catch (e) {
      AppLogger.e("Error accepting friend request: $e");
      throw Exception(getCustomError(e));
    }
  }

  // Reject friend request
  Future<void> rejectFriendRequest(String friendUid) async {
    try {
      final currentUser = _auth.currentUser;
      if (currentUser == null) {
        throw Exception("No authenticated user found");
      }

      // Get current user document
      final currentUserQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: currentUser.uid)
          .get();

      if (currentUserQuery.docs.isEmpty) {
        throw Exception("Current user document not found");
      }

      final currentUserDoc = currentUserQuery.docs.first;

      // Get friend user document
      final friendUserQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: friendUid)
          .get();

      if (friendUserQuery.docs.isEmpty) {
        throw Exception("Friend user not found");
      }

      final friendUserDoc = friendUserQuery.docs.first;

      await _firestore.runTransaction((transaction) async {
        // Get fresh data within transaction
        final currentUserSnapshot =
            await transaction.get(currentUserDoc.reference);
        final friendUserSnapshot =
            await transaction.get(friendUserDoc.reference);

        final currentUserData = currentUserSnapshot.data()!;
        final friendUserData = friendUserSnapshot.data()!;

        // Update current user: remove from friendRequests
        final friendRequests =
            List<String>.from(currentUserData['friendRequests'] ?? []);
        if (friendRequests.contains(friendUid)) {
          friendRequests.remove(friendUid);
          transaction.update(
              currentUserDoc.reference, {'friendRequests': friendRequests});
        }
      });
    } catch (e) {
      AppLogger.e("Error rejecting friend request: $e");
      throw Exception(getCustomError(e));
    }
  }

  // Remove friend
  Future<void> removeFriend(String friendUid) async {
    try {
      final currentUser = _auth.currentUser;
      if (currentUser == null) {
        throw Exception("No authenticated user found");
      }

      // Get current user document
      final currentUserQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: currentUser.uid)
          .get();

      if (currentUserQuery.docs.isEmpty) {
        throw Exception("Current user document not found");
      }

      final currentUserDoc = currentUserQuery.docs.first;

      // Get friend user document
      final friendUserQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: friendUid)
          .get();

      if (friendUserQuery.docs.isEmpty) {
        throw Exception("Friend user not found");
      }

      final friendUserDoc = friendUserQuery.docs.first;

      await _firestore.runTransaction((transaction) async {
        // Get fresh data within transaction
        final currentUserSnapshot =
            await transaction.get(currentUserDoc.reference);
        final friendUserSnapshot =
            await transaction.get(friendUserDoc.reference);

        final currentUserData = currentUserSnapshot.data()!;
        final friendUserData = friendUserSnapshot.data()!;

        // Update current user: remove from friends
        final currentUserFriends =
            List<String>.from(currentUserData['friends'] ?? []);
        if (currentUserFriends.contains(friendUid)) {
          currentUserFriends.remove(friendUid);
          transaction.update(
              currentUserDoc.reference, {'friends': currentUserFriends});
        }

        // Update friend user: remove from friends
        final friendUserFriends =
            List<String>.from(friendUserData['friends'] ?? []);
        if (friendUserFriends.contains(currentUser.uid)) {
          friendUserFriends.remove(currentUser.uid);
          transaction
              .update(friendUserDoc.reference, {'friends': friendUserFriends});
        }
      });
    } catch (e) {
      AppLogger.e("Error removing friend: $e");
      throw Exception(getCustomError(e));
    }
  }
}

// Helper class to include Firestore document ID with User data
class UserWithId {
  final User user;
  final String id;

  UserWithId({required this.user, required this.id});
}
