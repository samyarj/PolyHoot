import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/models/chat_message.dart';
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;
import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

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

  CollectionReference get _usersCollection => _firestore.collection('users');

  static const int messagesLimit = 50;

  Future<void> sendMessage(String message) async {
    final user = await auth_service.currentSignedInUser;

    final chatMessage = {
      'uid': user.uid,
      'message': message,
      'date': DateTime.now().millisecondsSinceEpoch,
    };

    await _globalChatCollection.add(chatMessage);
  }

  /// Get a real-time stream of the latest 50 messages from the global chat.
  Stream<List<ChatMessage>> getMessages() {
    AppLogger.d("getMessages");

    final messagesQuery = _globalChatCollection
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
          .sort((ChatMessage a, ChatMessage b) => a.date.compareTo(b.date));

      AppLogger.i("newmessage length is: ${newMessages.length}");

      return newMessages;
    });
  }

  Future<Map<String, user_model.User>> _fetchUserDetails(
      List<String> userIds) async {
    AppLogger.d("In fetchUserDetails");

    final userDetails = <String, user_model.User>{};

    final userFetches = userIds.map(
      (uid) async {
        final userDoc = await _usersCollection.doc(uid).get();
        if (userDoc.exists) {
          userDetails[uid] =
              user_model.User.fromJson(userDoc.data() as Map<String, dynamic>);
        }
      },
    );

    await Future.wait(userFetches);
    return userDetails;
  }

  Future<List<ChatMessage>> loadOlderMessages(int lastMessageDate) async {
    final olderMessagesQuery = _globalChatCollection
        .orderBy('date', descending: true)
        .startAfter([lastMessageDate]).limit(50);

    final snapshot =
        await olderMessagesQuery.get(); // Fetch once, not as a stream

    final olderMessages = snapshot.docs
        .map((doc) => ChatMessage.fromJson(doc.data() as Map<String, dynamic>))
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
        .sort((ChatMessage a, ChatMessage b) => a.date.compareTo(b.date));

    AppLogger.i("oldermessage length is: ${olderMessages.length}");

    return olderMessages;
  }
}
