import 'package:client_leger/backend-communication-services/chat/firebase_chat_service.dart';
import 'package:client_leger/models/chat_channels.dart';
import 'package:client_leger/models/chat_message.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class ChannelManager {
  static final ChannelManager _instance = ChannelManager._internal();

  factory ChannelManager() {
    return _instance;
  }

  ChannelManager._internal() {
    // private constructor
    _firebaseChatService = FirebaseChatService();
  }

  late FirebaseChatService _firebaseChatService;

  Stream<List<ChatMessage>> getMessagesForChannel(String channel) {
    return _firebaseChatService.getMessages(channel);
  }

  Stream<List<ChatChannel>> fetchAllChannels(String currentUserUid) {
    return _firebaseChatService.fetchAllChannels(currentUserUid);
  }

  Future<void> joinChannel(String currentUserUid, String channel) async {
    await _firebaseChatService.joinChannel(currentUserUid, channel);
  }

  Future<void> quitChannel(String currentUserUid, String channel) async {
    await _firebaseChatService.quitChannel(currentUserUid, channel);
  }

  Future<void> sendMessage(
      String currentUserUid, String channel, String message) async {
    await _firebaseChatService.sendMessage(currentUserUid, channel, message);
  }

  Future<void> createChannel(String channel) async {
    await _firebaseChatService.createChannel(channel);
  }

  Future<List<ChatMessage>> loadOlderMessages(
      String channel, Timestamp lastMessageDate) async {
    return await _firebaseChatService.loadOlderMessages(
        channel, lastMessageDate);
  }

  Future<void> deleteChannel(String channel) async {
    await _firebaseChatService.deleteChannel(channel);
  }
}
