import 'package:client_leger/backend-communication-services/models/enums.dart';
import 'package:client_leger/backend-communication-services/models/player_info.dart';
import 'package:client_leger/backend-communication-services/models/question.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final gameClientProvider =
    StateNotifierProvider.autoDispose<GamePlayerNotifier, GamePlayerState>(
        (ref) {
  return GamePlayerNotifier();
});

// ref: game-client.service.ts dans le lourd

class GamePlayerState {
  final ChoiceFeedback choiceFeedback;
  final Question currentQuestion;
  final int currentQuestionIndex;
  final bool gamePaused;
  final PlayerInfo playerInfo;
  final int playerPoints;
  final int pointsReceived;
  final String quizTitle;
  final bool shouldDisconnect;
  final int time;
  final String answer;
  final bool finalAnswer;
  final bool realShowAnswers;
  final bool shouldNavigateToResults;

  GamePlayerState({
    required this.pointsReceived,
    required this.shouldDisconnect,
    required this.quizTitle,
    required this.playerPoints,
    required this.currentQuestionIndex,
    required this.gamePaused,
    required this.finalAnswer,
    required this.realShowAnswers,
    required this.answer,
    required this.choiceFeedback,
    required this.currentQuestion,
    required this.playerInfo,
    required this.time,
    required this.shouldNavigateToResults,
  });

  GamePlayerState copyWith({
    String? quizTitle,
    int? playerPoints,
    int? currentQuestionIndex,
    bool? gamePaused,
    bool? finalAnswer,
    bool? realShowAnswers,
    bool? socketsInitialized,
    String? answer,
    ChoiceFeedback? choiceFeedback,
    Question? currentQuestion,
    PlayerInfo? playerInfo,
    int? time,
    int? pointsReceived,
    bool? shouldDisconnect,
    bool? shouldNavigateToResults,
  }) {
    return GamePlayerState(
      pointsReceived: pointsReceived ?? this.pointsReceived,
      shouldDisconnect: shouldDisconnect ?? this.shouldDisconnect,
      quizTitle: quizTitle ?? this.quizTitle,
      playerPoints: playerPoints ?? this.playerPoints,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      gamePaused: gamePaused ?? this.gamePaused,
      finalAnswer: finalAnswer ?? this.finalAnswer,
      realShowAnswers: realShowAnswers ?? this.realShowAnswers,
      answer: answer ?? this.answer,
      choiceFeedback: choiceFeedback ?? this.choiceFeedback,
      currentQuestion: currentQuestion ?? this.currentQuestion,
      playerInfo: playerInfo ?? this.playerInfo,
      time: time ?? this.time,
      shouldNavigateToResults:
          shouldNavigateToResults ?? this.shouldNavigateToResults,
    );
  }
}

class GamePlayerNotifier extends StateNotifier<GamePlayerState> {
  final WebSocketManager _socketManager = WebSocketManager.instance;

  GamePlayerNotifier()
      : super(GamePlayerState(
          pointsReceived: 0,
          shouldDisconnect: true,
          quizTitle: '',
          playerPoints: 0,
          currentQuestionIndex: 0,
          gamePaused: false,
          finalAnswer: false,
          realShowAnswers: false,
          answer: '',
          choiceFeedback: ChoiceFeedback.Idle,
          currentQuestion: Question(type: '', text: '', points: 0),
          playerInfo: PlayerInfo(
              submitted: false,
              userFirst: false,
              choiceSelected: [false, false, false, false],
              waitingForQuestion: false),
          time: 0,
          shouldNavigateToResults: false,
        )) {
    _setupListeners();
    signalUserConnect();
    getTitle();
    AppLogger.i("GamePlayerNotifier initialized");
  }

  void _setupListeners() {
    AppLogger.i("Setting up listeners in game player provider");

    _socketManager.webSocketReceiver(GameEvents.WaitingForCorrection.value,
        (_) {
      state = state.copyWith(choiceFeedback: ChoiceFeedback.AwaitingCorrection);
    });

    _socketManager.webSocketReceiver(TimerEvents.Paused.value, (pauseState) {
      state = state.copyWith(gamePaused: pauseState);
    });

    _socketManager.webSocketReceiver(TimerEvents.AlertModeStarted.value, (_) {
      // Play alert sound
    });

    _socketManager.webSocketReceiver(TimerEvents.QuestionCountdownValue.value,
        (time) {
      state = state.copyWith(
          gamePaused: false,
          playerInfo: state.playerInfo.copyWith(waitingForQuestion: true),
          time: time);
    });

    _socketManager.webSocketReceiver(TimerEvents.QuestionCountdownEnd.value,
        (_) {
      state = state.copyWith(
          playerInfo: state.playerInfo.copyWith(waitingForQuestion: false));
      // Stop alert sound
    });

    _socketManager.webSocketReceiver(TimerEvents.Value.value, (time) {
      state = state.copyWith(time: time);
    });

    _socketManager.webSocketReceiver(TimerEvents.End.value, (time) {
      state = state.copyWith(time: time);
    });

    _socketManager.webSocketReceiver(GameEvents.NextQuestion.value,
        (nextQuestion) {
      AppLogger.i("Next question received in game player provider");
      if (nextQuestion != null && nextQuestion['index'] != null) {
        resetAttributes();
        state = state.copyWith(
          playerInfo: state.playerInfo.copyWith(submitted: false),
          currentQuestionIndex: nextQuestion['index'],
          currentQuestion: Question.fromJson(nextQuestion['question']),
        );
      }
    });

    _socketManager.webSocketReceiver(GameEvents.PlayerPointsUpdate.value,
        (playerQuestionInfo) {
      ChoiceFeedback feedback;
      if (playerQuestionInfo['points'] ==
          state.playerPoints + state.currentQuestion.points) {
        feedback = ChoiceFeedback.Correct;
      } else if (playerQuestionInfo['points'] == state.playerPoints) {
        feedback = ChoiceFeedback.Incorrect;
      } else {
        feedback = ChoiceFeedback.Partial;
      }

      bool isFirst = playerQuestionInfo['isFirst'];
      int points = playerQuestionInfo['points'];
      if (playerQuestionInfo['isFirst']) {
        feedback = ChoiceFeedback.First;
      }

      state = state.copyWith(
        playerPoints: points,
        pointsReceived: points,
        realShowAnswers: true,
        choiceFeedback: feedback,
        playerInfo: state.playerInfo.copyWith(
            choiceSelected: [false, false, false, false], userFirst: isFirst),
      );
    });

    _socketManager.webSocketReceiver(DisconnectEvents.OrganizerHasLeft.value,
        (_) {
      // Navigate to home
      if (!_socketManager.isOrganizer) {
        // Show error dialog
        // Stop alert sound
      }
    });

    _socketManager.webSocketReceiver(GameEvents.SendResults.value, (_) {
      state = state.copyWith(
          shouldDisconnect: false, shouldNavigateToResults: true);
      // Navigate to results
      // Stop alert sound
    });
  }

  bool selectChoice(int indexChoice) {
    if (state.time > 0 && !state.finalAnswer) {
      if (state.currentQuestion.choices != null &&
          // ignore: unnecessary_null_comparison
          state.currentQuestion.choices![indexChoice] != null) {
        state.currentQuestion.choices![indexChoice].isSelected =
            !(state.currentQuestion.choices![indexChoice].isSelected!);
        state.playerInfo.choiceSelected[indexChoice] =
            !state.playerInfo.choiceSelected[indexChoice];
        _socketManager.webSocketSender(
            GameEvents.SelectFromPlayer.value, {'choice': indexChoice});
        return true;
      }
    }
    return false;
  }

  void finalizeAnswer() {
    state = state.copyWith(
        playerInfo: state.playerInfo.copyWith(submitted: true),
        choiceFeedback: ChoiceFeedback.Awaiting);

    if (!state.finalAnswer && state.time > 0) {
      state = state.copyWith(finalAnswer: true);
      _socketManager.webSocketSender(GameEvents.FinalizePlayerAnswer.value);
    }
  }

  void resetAttributes() {
    state = state.copyWith(
      choiceFeedback: ChoiceFeedback.Idle,
      answer: '',
      gamePaused: false,
      finalAnswer: false,
      realShowAnswers: false,
      playerInfo: state.playerInfo.copyWith(
        userFirst: false,
        waitingForQuestion: false,
        choiceSelected: [false, false, false, false],
      ),
      shouldDisconnect: true,
    );
    if (state.currentQuestion.choices != null) {
      for (final choice in state.currentQuestion.choices!) {
        choice.isSelected = false;
      }
    }
  }

  void resetCurrentQuestionFields() {
    state = state.copyWith(
        currentQuestion: Question(type: '', text: '', points: 0));
  }

  void getTitle() {
    _socketManager.webSocketSender(
        JoinEvents.TitleRequest.value, null, _updateTitle);
  }

  void _updateTitle(title) {
    AppLogger.i("Title received in game player provider");
    state = state.copyWith(quizTitle: title as String);
  }

  void signalUserDisconnect() {
    _socketManager.webSocketSender(DisconnectEvents.Player.value);
  }

  void signalUserConnect() {
    _socketManager.webSocketSender(ConnectEvents.UserToGame.value);
  }

  void sendAnswerForCorrection(String answer) {
    _socketManager.webSocketSender(GameEvents.QRLAnswerSubmitted.value,
        {'player': _socketManager.playerName, 'playerAnswer': answer});
  }

  void abandonGame() {
    // Show confirmation dialog
    // Navigate to home
    // Stop alert sound
  }

  @override
  void dispose() {
    AppLogger.i("Disposing GamePlayerNotifier");
    _socketManager.socket.off(GameEvents.WaitingForCorrection.value);
    _socketManager.socket.off(TimerEvents.Paused.value);
    _socketManager.socket.off(TimerEvents.AlertModeStarted.value);
    _socketManager.socket.off(TimerEvents.QuestionCountdownValue.value);
    _socketManager.socket.off(TimerEvents.QuestionCountdownEnd.value);
    _socketManager.socket.off(TimerEvents.Value.value);
    _socketManager.socket.off(TimerEvents.End.value);
    _socketManager.socket.off(GameEvents.NextQuestion.value);
    _socketManager.socket.off(GameEvents.PlayerPointsUpdate.value);
    _socketManager.socket.off(DisconnectEvents.OrganizerHasLeft.value);
    _socketManager.socket.off(GameEvents.SendResults.value);
    if (!mounted) return;
    resetAttributes();
    super.dispose();
  }
}
