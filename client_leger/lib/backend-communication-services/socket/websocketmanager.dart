import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/backend-communication-services/environment_prod.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

final class WebSocketManager {
  // Singleton pattern
  static final WebSocketManager instance = WebSocketManager();

  String _fetchBaseUrl() {
    switch (kDebugMode) {
      case true:
        return Environment.serverUrlSocket;
      default:
        return EnvironmentProd.serverUrlSocket;
    }
  }

  IO.Socket get socket => IO.io(
      _fetchBaseUrl(), IO.OptionBuilder().setTransports(['websocket']).build());

  initializeSocketConnection() {
    try {
      socket.connect();
      socket.onConnect((_) {
        AppLogger.i("Websocket connection success");
      });
    } catch (e) {
      AppLogger.e('$e');
    }
  }

  disconnectFromSocket() {
    socket.disconnect();
    socket.onDisconnect((data) => AppLogger.i("Websocket disconnected"));
  }

  void webSocketReceiver(String eventName, Function(dynamic) onEvent) {
    socket.on(eventName, (data) {
      onEvent(data);
    });
  }

  void webSocketSender(String eventName, dynamic body) {
    socket.emit(eventName, body);
  }
}
