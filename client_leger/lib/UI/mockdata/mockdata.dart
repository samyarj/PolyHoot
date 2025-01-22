Map<String, dynamic> mockUser = {
  'username': 'Pitchouna',
  'avatar_equipped':
      'https://pangovet.com/wp-content/uploads/2024/06/yellow-gray-cockatiel-perched-on-a-branch_Marlon-Roth_Shutterstock.jpg',
};

class ChatMessage {
  final String message;
  final String author;
  final DateTime? date;

  ChatMessage({
    required this.message,
    required this.author,
    this.date,
  });
}

Map<String, List<ChatMessage>> mockChats = {
  "General": [
    ChatMessage(
      message: "Hello everyone!",
      author: "Pitchouna",
      date: DateTime.now().subtract(Duration(minutes: 5)),
    ),
    ChatMessage(
      message: "Hi Pitchouna!",
      author: "User2",
      date: DateTime.now().subtract(Duration(minutes: 3)),
    ),
    ChatMessage(
      message: "How are you all doing?",
      author: "User3",
      date: DateTime.now().subtract(Duration(minutes: 1)),
    ),
  ],
};
