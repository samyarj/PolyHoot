class ChatChannel {
  final String name;
  final bool isUserInChannel;

  ChatChannel({required this.name, required this.isUserInChannel});

  factory ChatChannel.fromJson(
      Map<String, dynamic> json, String currentUserId) {
    final users = List<String>.from(json['users'] ?? []);
    final isUserInChannel = users.contains(currentUserId);
    return ChatChannel(
      name: json['name'] as String,
      isUserInChannel: isUserInChannel,
    );
  }
}
