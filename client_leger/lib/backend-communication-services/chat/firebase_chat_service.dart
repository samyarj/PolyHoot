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

  List<ChatMessage> globalMessagesCache = [];

  Future<void> sendMessage(String message) async {
    final user = await auth_service.currentSignedInUser;

    if (user == null) {
      throw Exception('User is not authenticated');
    }

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
    globalMessagesCache =
        []; // clear cache if it is a new subscription (chat window just opened)

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

      if (newMessages.isEmpty) return globalMessagesCache;

      // Fetch user details for unique UIDs
      final users = await _fetchUserDetails(userIds.toList());

      // Attach user details to messages
      for (ChatMessage msg in newMessages) {
        msg.username = users[msg.uid]?.username ?? 'Unknown';
        msg.avatar =
            users[msg.uid]?.avatarEquipped ?? 'assets/default-avatar.png';
      }

      // Merge new messages into cache and sort
      globalMessagesCache = [...globalMessagesCache, ...newMessages];
      globalMessagesCache
          .sort((ChatMessage a, ChatMessage b) => a.date.compareTo(b.date));

      AppLogger.d(
          "globalMessagesCache length is: ${globalMessagesCache.length}");

      return globalMessagesCache;
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

  // Stream<List<ChatMessage>> loadOlderMessages(int lastMessageDate) {
  //   final olderMessagesQuery = _globalChatCollection
  //       .orderBy('date', descending: true)
  //       .startAfter([lastMessageDate]).limit(50);

  //   return olderMessagesQuery.snapshots().asyncMap((snapshot) async {
  //     final newMessages = snapshot.docs
  //         .map((doc) => ChatMessage.fromMap(doc.data() as Map<String, dynamic>))
  //         .toList();
  //     final userIds = newMessages.map((msg) => msg.uid).toSet();

  //     final users = await _fetchUserDetails(userIds.toList());

  //     return newMessages.map((msg) {
  //       final user = users[msg.uid];
  //       return msg.copyWith(
  //         username: user?.username ?? 'Unknown',
  //         avatar: user?.avatarEquipped ?? 'assets/default-avatar.png',
  //       );
  //     }).toList();
  //   });
  // }
}
