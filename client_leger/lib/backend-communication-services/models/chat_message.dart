class ChatMessage {
  final String message;
  String? username;
  String? avatar;
  final DateTime date;
  final String uid; // user uid

  ChatMessage({
    required this.message,
    required this.date,
    required this.uid,
    this.username,
    this.avatar,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      message: json['message'] as String,
      date: DateTime.fromMillisecondsSinceEpoch(
        json['date'] as int,
        isUtc: true,
      ).toLocal(),
      uid: json['uid'] as String,
      username: json['author'] as String?,
      avatar: json['avatar'] as String?,
    );
  }
}
