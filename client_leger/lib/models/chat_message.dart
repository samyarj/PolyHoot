import 'package:cloud_firestore/cloud_firestore.dart';

class ChatMessage {
  final String message;
  String? username;
  String? avatar;
  String? border;
  final Timestamp timestamp;
  final String uid; // user uid

  ChatMessage({
    required this.message,
    required this.timestamp,
    required this.uid,
    this.username,
    this.avatar,
    this.border,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      message: json['message'] as String,
      timestamp: json['date'] as Timestamp,
      uid: json['uid'] as String,
    );
  }
}
