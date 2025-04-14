import 'package:client_leger/environment_config.dart';
import 'package:client_leger/push-notif-api/firebase_api_push_notif.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

final class WebSocketManager {
  static final WebSocketManager _instance = WebSocketManager._();

  factory WebSocketManager() {
    return _instance;
  }

  WebSocketManager._() {
    socket?.onDisconnect((_) {
      AppLogger.w("WebSocket disconnected, will empty fcmToken");
      firebasePushNotif.emptyFcmToken();
    });
  }

  String? roomId;
  final ValueNotifier<String?> currentRoomIdNotifier =
      ValueNotifier<String?>(null);

  final firebasePushNotif = FirebasePushApi();

  bool isOrganizer = false;
  bool isInResultPage = false;
  String? playerName;
  IO.Socket? socket;

  String _fetchBaseUrl() {
    return EnvironmentConfig.serverUrlSocket;
  }

  void setRoomId(String newRoomId) {
    AppLogger.i("Setting roomId: $newRoomId");
    roomId = newRoomId;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      currentRoomIdNotifier.value = newRoomId;
    });
  }

  void removeRoomId() {
    AppLogger.i("Removing roomId $roomId room Id= null");
    roomId = null;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      currentRoomIdNotifier.value = null;
    });
  }

  bool isSocketAlive() {
    return socket != null && socket!.connected;
  }

  initializeSocketConnection(String? token, String? userUid) {
    if (!isSocketAlive() && token != null) {
      try {
        socket = IO.io(
          _fetchBaseUrl(),
          IO.OptionBuilder()
              .setTransports(['websocket']).setQuery({'token': token}).build(),
        );
        socket?.onConnect((_) {
          AppLogger.w("WebSocket connected, will send identify client now");
          webSocketSender(ConnectEvents.IdentifyClient.value,
              userUid); // pour s'assurer que les appels soient fait séquentiellement
        });
        socket?.connect();
        firebasePushNotif.onLogin();
      } catch (e) {
        AppLogger.e('$e');
      }
    }
  }

  disconnectFromSocket() {
    socket?.disconnect();
    socket?.off('connect');
    socket?.off('disconnect');
    firebasePushNotif.emptyFcmToken();
    roomId = null;
    isOrganizer = false;
    playerName = null;
    currentRoomIdNotifier.value = null;
  }

  void webSocketReceiver(String eventName, Function(dynamic) onEvent) {
    socket?.on(eventName, (data) {
      onEvent(data);
    });
  }

  void webSocketSender(String eventName,
      [dynamic body, Function(dynamic)? callback]) {
    if (callback != null) {
      socket?.emitWithAck(eventName, body ?? {}, ack: (data) {
        callback(data);
      });
    } else {
      socket?.emit(eventName, body ?? {});
    }
  }
}
