import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

final class WebSocketManager {
  static final WebSocketManager instance = WebSocketManager();

  String? roomId;
  final ValueNotifier<String?> currentRoomIdNotifier =
      ValueNotifier<String?>(null);

  bool isOrganizer = false;
  bool isPlaying = false;
  String? playerName;
  IO.Socket? socket;

  String _fetchBaseUrl() {
    return Environment.serverUrlSocket;
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

  initializeSocketConnection(String? token) {
    if (!isSocketAlive() && token != null) {
      try {
        socket = IO.io(
          _fetchBaseUrl(),
          IO.OptionBuilder()
              .setTransports(['websocket']).setQuery({'token': token}).build(),
        );
        socket?.connect();
        socket?.onConnect((_) {
          AppLogger.i("WebSocket connected");
        });
      } catch (e) {
        AppLogger.e('$e');
      }
    }
  }

  disconnectFromSocket() {
    socket?.disconnect();
    roomId = null;
    isOrganizer = false;
    socket?.onDisconnect((_) => AppLogger.i("WebSocket disconnected"));
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
