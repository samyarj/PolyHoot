import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

final class WebSocketManager {
  static final WebSocketManager instance = WebSocketManager();

  String? roomId; // ✅ Optional Room ID
  bool isOrganizer = false; // ✅ Default to false

  String _fetchBaseUrl() {
    return Environment.serverUrlSocket;
  }

  IO.Socket get socket => IO.io(
      _fetchBaseUrl(), IO.OptionBuilder().setTransports(['websocket']).build());

  initializeSocketConnection() {
    try {
      socket.connect();
      socket.onConnect((_) {
        AppLogger.i("WebSocket connected");
      });
    } catch (e) {
      AppLogger.e('$e');
    }
  }

  disconnectFromSocket() {
    socket.disconnect();
    roomId = null;
    isOrganizer = false;
    socket.onDisconnect((_) => AppLogger.i("WebSocket disconnected"));
  }

  void webSocketReceiver(String eventName, Function(dynamic) onEvent) {
    socket.on(eventName, (data) {
      onEvent(data);
    });
  }

  void webSocketSender(String eventName,
      [dynamic body, Function(dynamic)? callback]) {
    if (callback != null) {
      socket.emitWithAck(eventName, body ?? {}, ack: (data) {
        callback(data);
      });
    } else {
      socket.emit(eventName, body ?? {});
    }
  }
}
