import 'package:client_leger/models/quiz.dart';

class Lobby {
  final String title;
  final int nbPlayers;
  final String roomId;
  final bool isLocked;
  final Quiz quiz;

  Lobby({
    required this.title,
    required this.nbPlayers,
    required this.roomId,
    required this.isLocked,
    required this.quiz,
  });

  factory Lobby.fromJson(Map<String, dynamic> json) {
    return Lobby(
      title: json['title'] as String,
      nbPlayers: json['nbPlayers'] as int,
      roomId: json['roomId'] as String,
      isLocked: json['isLocked'] as bool,
      quiz: Quiz.fromJson(json['quiz']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'nbPlayers': nbPlayers,
      'roomId': roomId,
      'isLocked': isLocked,
      'quiz': quiz.toJson(),
    };
  }

  Lobby copyWith({
    String? title,
    int? nbPlayers,
    String? roomId,
    bool? isLocked,
    Quiz? quiz,
  }) {
    return Lobby(
      title: title ?? this.title,
      nbPlayers: nbPlayers ?? this.nbPlayers,
      roomId: roomId ?? this.roomId,
      isLocked: isLocked ?? this.isLocked,
      quiz: quiz ?? this.quiz,
    );
  }
}
