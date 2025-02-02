import 'package:client_leger/backend-communication-services/chat/firebase_chat_service.dart';
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

  final List<String> channelsAvailable = [
    // TODO: fetch when implemented
    'General',
    'The BIRDS',
    'Music Lovers',
    'Foodies',
    '3.5+ only',
    "Test1",
    "Test2",
    "Test3",
  ]..sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));

  final List<String> joinedChannels = ['General', "Test1", "Test2", "Test3"];

  Stream<List<ChatMessage>> getMessagesForChannel(String channel) {
    if (channel == 'General') {
      return _firebaseChatService.getMessages();
    }
    return Stream.value([]);
  }

  void sendMessage(String channel, String message) {
    if (channel == 'General') {
      _firebaseChatService.sendMessage(message);
    }
  }
}
