import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/models/chat_channels.dart';
import 'package:client_leger/backend-communication-services/models/chat_message.dart';
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;
import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;

class FirebaseChatService {
  static final FirebaseChatService _instance = FirebaseChatService._();

  // Private constructor to prevent external instantiation
  FirebaseChatService._();

  factory FirebaseChatService() {
    return _instance;
  }

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  CollectionReference get _globalChatCollection =>
      _firestore.collection('globalChat');

  CollectionReference get _chatChannelsCollection =>
      _firestore.collection('chatChannels');

  CollectionReference get _usersCollection => _firestore.collection('users');

  static const int messagesLimit = 50;

  Future<void> sendMessage(String channel, String message) async {
    try {
      final user = await auth_service.currentSignedInUser;

      final chatMessage = {
        'uid': user.uid,
        'message': message,
        'date': DateTime.now().millisecondsSinceEpoch,
      };

      if (channel == "General") {
        await _globalChatCollection.add(chatMessage);
      } else {
        await _chatChannelsCollection
            .doc(channel)
            .collection("messages")
            .add(chatMessage);
      }
    } catch (e) {
      AppLogger.e("In sendMessage of FirebaseChatService ${e.toString()}");
      throw Exception(getCustomError(e));
    }
  }

  Future<void> createChannel(String channel) async {
    try {
      final channelDoc = await _chatChannelsCollection.doc(channel).get();

      if (channelDoc.exists) {
        throw Exception(
            'Un canal de communication avec un nom identique existe déjà.');
      }

      Map<String, dynamic> newChannelData = {
        'name': channel,
        'users': [],
      };

      await _chatChannelsCollection.doc(channel).set(newChannelData);
    } catch (e) {
      AppLogger.e(e.toString());
      throw Exception(getCustomError(e));
    }
  }

  Stream<List<ChatMessage>> getMessages(String channel) {
    AppLogger.d("getMessages");
    try {
      final messagesQuery = channel == "General"
          ? _globalChatCollection
              .orderBy('date', descending: true)
              .limit(messagesLimit)
          : _chatChannelsCollection
              .doc(channel)
              .collection("messages")
              .orderBy('date', descending: true)
              .limit(messagesLimit);

      return messagesQuery.snapshots().asyncMap((snapshot) async {
        // returns a stream of updates

        List<ChatMessage> newMessages = [];
        Set<String> userIds = {};
        AppLogger.d("In the asyncMap");

        for (final change in snapshot.docChanges) {
          if (change.type == DocumentChangeType.added) {
            final ChatMessage message =
                ChatMessage.fromJson(change.doc.data() as Map<String, dynamic>);
            newMessages.add(message);
            userIds.add(message.uid);
          }
        }

        if (newMessages.isEmpty) return [];

        // Fetch user details for unique UIDs
        final users = await _fetchUserDetails(userIds.toList());

        // Attach user details to messages
        for (ChatMessage msg in newMessages) {
          msg.username = users[msg.uid]?.username ?? 'Unknown';
          msg.avatar =
              users[msg.uid]?.avatarEquipped ?? 'assets/default-avatar.png';
        }

        newMessages
            .sort((ChatMessage a, ChatMessage b) => b.date.compareTo(a.date));

        AppLogger.i("newmessage length is: ${newMessages.length}");

        return newMessages;
      });
    } catch (e) {
      AppLogger.e("In getMessages of FirebaseChatService ${e.toString()}");
      throw Exception(getCustomError(e));
    }
  }

  Future<Map<String, user_model.User>> _fetchUserDetails(
      List<String> userIds) async {
    AppLogger.d("In fetchUserDetails");

    try {
      final userDetails = <String, user_model.User>{};

      final userFetches = userIds.map(
        (uid) async {
          final userDoc = await _usersCollection.doc(uid).get();
          if (userDoc.exists) {
            userDetails[uid] = user_model.User.fromJson(
                userDoc.data() as Map<String, dynamic>);
          }
        },
      );

      await Future.wait(userFetches);
      return userDetails;
    } catch (e) {
      AppLogger.e(
          "In _fetchUserDetails of FirebaseChatService ${e.toString()}");
      throw Exception(getCustomError(e));
    }
  }

  Future<List<ChatMessage>> loadOlderMessages(
      String channel, int lastMessageDate) async {
    try {
      final olderMessagesQuery = channel == "General"
          ? _globalChatCollection
              .orderBy('date', descending: true)
              .startAfter([lastMessageDate]).limit(50)
          : _chatChannelsCollection
              .doc(channel)
              .collection("messages")
              .orderBy('date', descending: true)
              .startAfter([lastMessageDate]).limit(50);

      final snapshot =
          await olderMessagesQuery.get(); // Fetch once, not as a stream

      final olderMessages = snapshot.docs
          .map(
              (doc) => ChatMessage.fromJson(doc.data() as Map<String, dynamic>))
          .toList();

      final userIds = olderMessages.map((msg) => msg.uid).toSet();

      final users = await _fetchUserDetails(userIds.toList());

      // Attach user details to messages
      for (ChatMessage msg in olderMessages) {
        msg.username = users[msg.uid]?.username ?? 'Unknown';
        msg.avatar =
            users[msg.uid]?.avatarEquipped ?? 'assets/default-avatar.png';
      }

      olderMessages
          .sort((ChatMessage a, ChatMessage b) => b.date.compareTo(a.date));

      AppLogger.i("oldermessage length is: ${olderMessages.length}");

      return olderMessages;
    } catch (e) {
      AppLogger.e("In FirebaseChatService loadOlderMessages ${e.toString()}");
      throw Exception(getCustomError(e));
    }
  }

  Stream<List<ChatChannel>> fetchAllChannels() {
    return _chatChannelsCollection.snapshots().asyncMap((snapshot) async {
      final user = await auth_service.currentSignedInUser;
      final currentUserUid = user.uid;
      return snapshot.docs.map((doc) {
        return ChatChannel.fromJson(
            doc.data() as Map<String, dynamic>, currentUserUid);
      }).toList();
    });
  }

  joinChannel(String channel) async {
    try {
      final user = await auth_service.currentSignedInUser;
      final currentUserUid = user.uid;
      final channelRef = _chatChannelsCollection.doc(channel);
      await channelRef.update({
        'users': FieldValue.arrayUnion([currentUserUid]),
      });
    } catch (e) {
      AppLogger.e("In FirebaseChatService joinChannel ${e.toString()}");
      throw Exception(getCustomError(e));
    }
  }

  quitChannel(String channel) async {
    try {
      final user = await auth_service.currentSignedInUser;
      final currentUserUid = user.uid;
      final channelRef = _chatChannelsCollection.doc(channel);
      await channelRef.update({
        'users': FieldValue.arrayRemove([currentUserUid]),
      });
    } catch (e) {
      AppLogger.e("In FirebaseChatService quitChannel ${e.toString()}");
      throw Exception(getCustomError(e));
    }
  }

  Future<void> deleteChannel(String channelName) async {
    final url = "${Environment.serverUrl}/chat-channels/$channelName";

    try {
      final response = await http.delete(Uri.parse(url));

      if (response.statusCode == 200) {
        AppLogger.i('Chat channel successfully deleted');
      } else {
        throw Exception('Une erreur a eu lieu lors de la suppression du canal');
      }
    } catch (e) {
      AppLogger.e('In deleteChannel of FirebaseChatService ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }
}
