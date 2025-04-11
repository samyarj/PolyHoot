import 'dart:async';
import 'package:client_leger/backend-communication-services/chat/firebase_chat_service.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/ingame_chat_messages.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/providers/messages/messages_notif_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';

class InGameChatService {
  InGameChatService._privateConstructor();
  final WebSocketManager _socketManager = WebSocketManager();
  final FirebaseChatService _firebaseChatService = FirebaseChatService();
  String _username = "";
  late String? _uid;
  late String? _avatar;
  late String? _border;
  Map<String, PartialUser> _userDetails =
      {}; // key = uid, value = border + avatar

  static final InGameChatService _instance =
      InGameChatService._privateConstructor();

  final inGameChatMessagesNotifier = ValueNotifier<List<InGameChatMessage>>([]);

  String? currentRoomId;
  Timer? quickRepliesTimer;
  MessageNotifNotifier? _notifier;

  final quickRepliesNotifier = ValueNotifier<List<String>>([]);

  factory InGameChatService() {
    return _instance;
  }

  requestQuickReplies() {
    if (_socketManager.roomId != null) {
      _socketManager
          .webSocketSender(ChatEvents.RequestQuickReplies.value, {_username});
    }
  }

  void reset() {
    if (currentRoomId == _socketManager.roomId && currentRoomId != null) {
      AppLogger.i("user changed channel tabs, not resetting InGameChatService");
    } else if (_socketManager.roomId == null) {
      AppLogger.w(
          "Resetting InGameChatService because we're not in a game anymore");
      _socketManager.socket?.off(ChatEvents.RoomLeft.value);
      _socketManager.socket?.off(ChatEvents.MessageAdded.value);
      _socketManager.socket?.off(ChatEvents.QuickRepliesGenerated.value);
      currentRoomId = null;
      _username = "";
      _avatar = null;
      _border = null;
      _uid = null;
      _notifier = null;
      _userDetails = {};
      inGameChatMessagesNotifier.value = [];
      quickRepliesTimer?.cancel();
      quickRepliesTimer = null;
      quickRepliesNotifier.value = [];
    }
  }

  void startQuickRepliesInterval() {
    quickRepliesTimer = Timer.periodic(
      const Duration(seconds: 8),
      (timer) {
        requestQuickReplies();
      },
    );
  }

  void setUserInfosAndInitialize(
    String username,
    String? uid,
    String? avatar,
    String? border,
    MessageNotifNotifier notifier,
  ) {
    if (currentRoomId == _socketManager.roomId && currentRoomId != null) {
      AppLogger.i(
          "user changed channel tabs, not initializing InGameChatService");
      return;
    } else {
      AppLogger.i("new game detected. SetUsernameAndInitialize");
      _username = username;
      _avatar = avatar;
      _border = border;
      _uid = uid;
      _notifier = notifier;
      currentRoomId = _socketManager.roomId;
      configureChatSocketFeatures();
      getHistory();
      if (quickRepliesTimer == null) {
        AppLogger.i("Starting quick replies timer");
        startQuickRepliesInterval();
      }
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
        (history) async {
      final messages = await Future.wait(
        (history as List<dynamic>).map((message) async {
          final chatMessage = InGameChatMessage.fromJson(message);
          if (chatMessage.avatar == null &&
              chatMessage.border == null &&
              chatMessage.author != 'System') {
            AppLogger.w(
                "message has no avatar or border, will fetch from firebase");
            await attachUrlToMessage(chatMessage);
          }
          return chatMessage;
        }),
      );
      messages.sort((a, b) => b.date!.compareTo(a.date!));
      inGameChatMessagesNotifier.value = messages;
    });
  }

  sendMessageToRoom(String inputMessage) {
    AppLogger.i("sendMessageToRoom $inputMessage");
    final message = InGameChatMessage(
      message: inputMessage,
      author: getAuthor(),
      uid: _uid,
      avatar: _avatar ??
          'https://res.cloudinary.com/dtu6fkkm9/image/upload/v1737478954/default-avatar_qcaycl.jpg',
      border: _border,
    );

    _socketManager.webSocketSender(
        ChatEvents.RoomMessage.value, message.toJson());
  }

  Future<void> attachUrlToMessage(InGameChatMessage message) async {
    if (message.uid != null && !_userDetails.containsKey(message.uid)) {
      final partialUserMap =
          await _firebaseChatService.fetchUserDetails([message.uid!]);
      if (partialUserMap[message.uid!] != null) {
        _userDetails[message.uid!] = partialUserMap[message.uid!]!;
      }
    }
    message.avatar = _userDetails[message.uid]?.avatarEquipped;
    message.border = _userDetails[message.uid]?.borderEquipped;
  }

  void configureChatSocketFeatures() {
    AppLogger.i("configuring ChatSocketFeatures");

    _socketManager.webSocketReceiver(ChatEvents.QuickRepliesGenerated.value,
        (quickReplies) {
      try {
        List<String> replies = quickReplies.cast<String>();
        quickRepliesNotifier.value = replies;
      } catch (e) {
        AppLogger.e("Error parsing quick replies: $e");
      }
    });

    _socketManager.webSocketReceiver(ChatEvents.MessageAdded.value,
        (newMessage) async {
      final message = InGameChatMessage.fromJson(newMessage);

      if (message.avatar == null &&
          message.border == null &&
          message.author != 'System') {
        AppLogger.w(
            "message has no avatar or border, will fetch from firebase");
        await attachUrlToMessage(message);
      }

      _notifier?.onIngameMessageReceived();

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

        _notifier?.onIngameMessageReceived();

        inGameChatMessagesNotifier.value = [
          message,
          ...inGameChatMessagesNotifier.value,
        ];
      }
    });
  }
}
