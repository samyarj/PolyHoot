import 'package:client_leger/backend-communication-services/chat/firebase_chat_service.dart';
import 'package:client_leger/backend-communication-services/models/chat_channels.dart';
import 'package:client_leger/backend-communication-services/models/chat_message.dart';

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

  Stream<List<ChatChannel>> fetchAllChannels() {
    return _firebaseChatService.fetchAllChannels();
  }

  Future<void> joinChannel(String channel) async {
    await _firebaseChatService.joinChannel(channel);
  }

  Future<void> quitChannel(String channel) async {
    await _firebaseChatService.quitChannel(channel);
  }

  Future<void> sendMessage(String channel, String message) async {
    await _firebaseChatService.sendMessage(channel, message);
  }

  Future<void> createChannel(String channel) async {
    await _firebaseChatService.createChannel(channel);
  }

  Future<List<ChatMessage>> loadOlderMessages(
      String channel, int lastMessageDate) async {
    return await _firebaseChatService.loadOlderMessages(
        channel, lastMessageDate);
  }

  Future<void> deleteChannel(String channel) async {
    await _firebaseChatService.deleteChannel(channel);
  }
}
