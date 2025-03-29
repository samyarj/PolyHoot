class InGameChatMessage {
  final String message;
  final String author;
  final DateTime? date;
  final String? uid; // user uid
  String? avatar;
  String? border;

  InGameChatMessage({
    required this.message,
    required this.author,
    required this.uid,
    this.date,
    this.avatar,
    this.border,
  });

  factory InGameChatMessage.fromJson(Map<String, dynamic> json) {
    return InGameChatMessage(
      message: json['message'],
      author: json['author'] ?? "inconnu",
      date: json['date'] != null ? DateTime.parse(json['date']) : null,
      uid: json['uid'],
      avatar: json['avatar'],
      border: json['border'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'message': message,
      'author': author,
      'date': date?.toIso8601String(),
      'uid': uid,
      'avatar': avatar,
      'border': border,
    };
  }
}
