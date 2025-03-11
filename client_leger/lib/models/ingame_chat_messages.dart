class InGameChatMessage {
  final String message;
  final String author;
  final DateTime? date;

  InGameChatMessage({
    required this.message,
    required this.author,
    this.date,
  });

  factory InGameChatMessage.fromJson(Map<String, dynamic> json) {
    return InGameChatMessage(
      message: json['message'],
      author: json['author'],
      date: json['date'] != null ? DateTime.parse(json['date']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'message': message,
      'author': author,
      'date': date?.toIso8601String(),
    };
  }
}
