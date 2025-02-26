import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class ChatMessage {
  final String message;
  String? username;
  String? avatar;
  final Timestamp timestamp;
  final String uid; // user uid

  ChatMessage({
    required this.message,
    required this.timestamp,
    required this.uid,
    this.username,
    this.avatar,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    AppLogger.d("json is $json");

    return ChatMessage(
      message: json['message'] as String,
      timestamp: json['date'] as Timestamp,
      uid: json['uid'] as String,
      username: json['author'] as String?,
      avatar: json['avatar'] as String?,
    );
  }
}
