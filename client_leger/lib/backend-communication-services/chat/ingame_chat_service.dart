import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/ingame_chat_messages.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';

class InGameChatService {
  InGameChatService._privateConstructor();
  final WebSocketManager _socketManager = WebSocketManager.instance;
  late String _username;

  static final InGameChatService _instance =
      InGameChatService._privateConstructor();

  final inGameChatMessagesNotifier = ValueNotifier<List<InGameChatMessage>>([]);

  String? currentRoomId;

  factory InGameChatService() {
    return _instance;
  }

  void reset() {
    if (currentRoomId == _socketManager.roomId && currentRoomId != null) {
      AppLogger.i("user changed channel tabs, not resetting InGameChatService");
    } else if (_socketManager.roomId == null) {
      currentRoomId = null;
      AppLogger.i(
          "Resetting InGameChatService because we're not in a game anymore");
      _socketManager.socket.off(ChatEvents.RoomLeft.value);
      _socketManager.socket.off(ChatEvents.MessageAdded.value);
    }
  }

  void setUsernameAndInitialize(String username) {
    _username = username;
    if (currentRoomId == _socketManager.roomId && currentRoomId != null) {
      AppLogger.i(
          "user changed channel tabs, not initializing InGameChatService");
      return;
    } else {
      AppLogger.i("new game detected. SetUsernameAndInitialize");
      currentRoomId = _socketManager.roomId;
      configureChatSocketFeatures();
      getHistory();
    }
  }

  bool isOrganizer() {
    return _socketManager.isOrganizer;
  }

  String getAuthor() {
    return isOrganizer() ? "Organisateur" : _username;
  }

  getHistory() {
    AppLogger.i("getHistory");
    _socketManager.webSocketSender(ChatEvents.GetHistory.value, null,
        (history) {
      final messages = (history as List<dynamic>)
          .map((message) => InGameChatMessage.fromJson(message))
          .toList();
      messages.sort((a, b) => b.date!.compareTo(a.date!));
      inGameChatMessagesNotifier.value = messages;
    });
  }

  sendMessageToRoom(String inputMessage) {
    AppLogger.i("sendMessageToRoom $inputMessage");
    final message = InGameChatMessage(
      message: inputMessage,
      author: getAuthor(),
    );

    _socketManager.webSocketSender(ChatEvents.RoomMessage.value, message);
  }

  void configureChatSocketFeatures() {
    AppLogger.i("configuring ChatSocketFeatures");
    _socketManager.webSocketReceiver(ChatEvents.MessageAdded.value,
        (newMessage) {
      final message = InGameChatMessage.fromJson(newMessage);
      inGameChatMessagesNotifier.value = [
        message,
        ...inGameChatMessagesNotifier.value,
      ];
    });

    _socketManager.webSocketReceiver(ChatEvents.RoomLeft.value, (chatData) {
      // chatData has message (chatmessage) roomId? and playerName
      if (chatData == null || getAuthor() == chatData['playerName']) {
        // you quit the chat
      } else {
        final message = InGameChatMessage.fromJson(chatData['message']);
        inGameChatMessagesNotifier.value = [
          message,
          ...inGameChatMessagesNotifier.value,
        ];
      }
    });
  }
}
