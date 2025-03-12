// Game Info model
class GameInfo {
  final int time;
  final int currentQuestionIndex;
  final int currentIndex;
  final int playersInGame;

  GameInfo({
    required this.time,
    required this.currentQuestionIndex,
    required this.currentIndex,
    required this.playersInGame,
  });

  // Copy with method for immutability
  GameInfo copyWith({
    int? time,
    int? currentQuestionIndex,
    int? currentIndex,
    int? playersInGame,
  }) {
    return GameInfo(
      time: time ?? this.time,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      currentIndex: currentIndex ?? this.currentIndex,
      playersInGame: playersInGame ?? this.playersInGame,
    );
  }
}

// GameStatus enum
enum GameStatus {
  WaitingForAnswers,
  OrganizerCorrecting,
  CorrectionFinished,
  WaitingForNextQuestion,
  GameFinished;

  // Method to get string value compatible with TypeScript enum
  String get value {
    switch (this) {
      case GameStatus.WaitingForAnswers:
        return 'waitingForAnswers';
      case GameStatus.OrganizerCorrecting:
        return 'organizerCorrecting';
      case GameStatus.CorrectionFinished:
        return 'correctionFinished';
      case GameStatus.WaitingForNextQuestion:
        return 'waitingForNextQuestion';
      case GameStatus.GameFinished:
        return 'gameFinished';
    }
  }
}
