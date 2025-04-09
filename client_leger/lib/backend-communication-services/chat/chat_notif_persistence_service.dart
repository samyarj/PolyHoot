import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ChatNotifPersistenceService {
  static final ChatNotifPersistenceService _instance =
      ChatNotifPersistenceService._();

  // Private constructor to prevent external instantiation
  ChatNotifPersistenceService._();

  factory ChatNotifPersistenceService() {
    return _instance;
  }

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  CollectionReference get _usersCollection => _firestore.collection('users');

  final Map<String, Timestamp> _readMessagesCache = {};

  String? getUserUid() {
    return FirebaseAuth.instance.currentUser?.uid;
  }

  void setReadMessagesCache(Map<String, Timestamp> readMessages) {
    // updated in real time
    AppLogger.w("setReadMessagesCache");
    _readMessagesCache.clear();
    _readMessagesCache.addAll(readMessages);
  }

  void clearReadMessagesCache() {
    AppLogger.w("clearReadMessagesCache");
    _readMessagesCache.clear();
  }

  Map<String, Timestamp> get readMessagesCache {
    return _readMessagesCache;
  }

// TODO: fonction a mettre dans le lourd aussi
  Future<void> updateReadMessages(String channelId, Timestamp lastRead) async {
    try {
      final userUid = getUserUid();
      if (userUid == null) {
        return;
      }
      await _usersCollection.doc(userUid).update({
        'readMessages.$channelId': lastRead,
      });
      AppLogger.w(
          "successfully updated $channelId to $lastRead in read messages");
    } catch (e) {
      AppLogger.e('Error updating read messages: $e');
    }
  }

  Future<void> removeChannelFromReadMessages(String channelId) async {
    if (!_readMessagesCache.containsKey(channelId)) {
      AppLogger.w(
          "_readMessageCache doesnt container channelId $channelId, skipping removal");
      return;
    }
    try {
      final userUid = getUserUid();
      if (userUid == null) {
        return;
      }
      await _usersCollection.doc(userUid).update({
        'readMessages.$channelId': FieldValue.delete(),
      });
      AppLogger.w("successfully removed $channelId from read messages");
    } catch (e) {
      AppLogger.e('Error removing channel from read messages: $e');
    }
  }

// TODO: fonction a mettre dans le lourd aussi (je pense pas besoin pcq il redirige direct vers le chat channel window)
  Future<void> addChannelToReadMessages(String channelId) async {
    if (_readMessagesCache.containsKey(channelId)) {
      return;
    }

    try {
      final userUid = getUserUid();
      if (userUid == null) {
        return;
      }

      await _usersCollection.doc(userUid).update({
        'readMessages.$channelId': Timestamp.fromMillisecondsSinceEpoch(0),
      });
      AppLogger.w("successfully added $channelId to read messages");
    } catch (e) {
      AppLogger.e('Error adding channel to read messages: $e');
    }
  }
}
