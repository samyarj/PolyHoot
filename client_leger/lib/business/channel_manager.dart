import 'package:client_leger/backend-communication-services/chat/firebase_chat_service.dart';
import 'package:client_leger/backend-communication-services/models/chat_channels.dart';
import 'package:client_leger/backend-communication-services/models/chat_message.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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

  Stream<List<ChatChannel>> fetchAllChannels(WidgetRef ref) {
    return _firebaseChatService.fetchAllChannels(ref);
  }

  Future<void> joinChannel(WidgetRef ref, String channel) async {
    await _firebaseChatService.joinChannel(ref, channel);
  }

  Future<void> quitChannel(WidgetRef ref, String channel) async {
    await _firebaseChatService.quitChannel(ref, channel);
  }

  Future<void> sendMessage(
      WidgetRef ref, String channel, String message) async {
    await _firebaseChatService.sendMessage(ref, channel, message);
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
