import 'dart:async';
import 'package:client_leger/backend-communication-services/chat/ingame_chat_service.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/classes/sound_player.dart';
import 'package:client_leger/models/game-related/answer_qrl.dart';
import 'package:client_leger/models/game-related/modfiers.dart';
import 'package:client_leger/models/game-related/partial_player.dart';
import 'package:client_leger/models/game-related/points_update_qrl.dart';
import 'package:client_leger/models/game_info.dart';
import 'package:client_leger/models/player_data.dart';
import 'package:client_leger/models/question.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

const TIME_TO_NEXT_ANSWER = 3000;

final organizerProvider =
    StateNotifierProvider.autoDispose<OrganizerNotifier, OrganizerState>((ref) {
  return OrganizerNotifier(WebSocketManager());
});

class OrganizerState {
  final List<AnswerQRL> answersQRL;
  final Question currentQuestion;
  final GameInfo gameInfo;
  final Modifiers gameModifiers;
  final GameStatus gameStatus;
  final bool shouldDisconnect;
  final bool allPlayersLeft;
  final bool shouldNavigateToResults;
  final List<PartialPlayer> playerList;
  final List<PointsUpdateQRL> pointsAfterCorrection;
  final int questionsLength;

  OrganizerState({
    required this.answersQRL,
    required this.currentQuestion,
    required this.gameInfo,
    required this.gameModifiers,
    required this.gameStatus,
    required this.shouldDisconnect,
    required this.allPlayersLeft,
    required this.shouldNavigateToResults,
    required this.playerList,
    required this.pointsAfterCorrection,
    required this.questionsLength,
  });

  OrganizerState copyWith({
    List<AnswerQRL>? answersQRL,
    Question? currentQuestion,
    GameInfo? gameInfo,
    Modifiers? gameModifiers,
    GameStatus? gameStatus,
    bool? shouldDisconnect,
    bool? allPlayersLeft,
    bool? shouldNavigateToResults,
    List<PartialPlayer>? playerList,
    List<PointsUpdateQRL>? pointsAfterCorrection,
    int? questionsLength,
  }) {
    return OrganizerState(
      answersQRL: answersQRL ?? this.answersQRL,
      currentQuestion: currentQuestion ?? this.currentQuestion,
      gameInfo: gameInfo ?? this.gameInfo,
      gameModifiers: gameModifiers ?? this.gameModifiers,
      gameStatus: gameStatus ?? this.gameStatus,
      shouldDisconnect: shouldDisconnect ?? this.shouldDisconnect,
      allPlayersLeft: allPlayersLeft ?? this.allPlayersLeft,
      shouldNavigateToResults:
          shouldNavigateToResults ?? this.shouldNavigateToResults,
      playerList: playerList ?? this.playerList,
      pointsAfterCorrection:
          pointsAfterCorrection ?? this.pointsAfterCorrection,
      questionsLength: questionsLength ?? this.questionsLength,
    );
  }
}

class OrganizerNotifier extends StateNotifier<OrganizerState> {
  final WebSocketManager _socketManager;
  SoundPlayer alertSoundPlayer = SoundPlayer();
  List<PlayerData> resultPlayerList = [];
  final ingameChatService = InGameChatService();

  OrganizerNotifier(this._socketManager)
      : super(OrganizerState(
          answersQRL: [],
          currentQuestion:
              Question(id: '0', type: 'QCM', text: '', points: 0, choices: []),
          gameInfo: GameInfo(
            time: 0,
            currentQuestionIndex: 0,
            currentIndex: 0,
            playersInGame: 0,
          ),
          gameModifiers: Modifiers(
            paused: false,
            alertMode: false,
          ),
          gameStatus: GameStatus.WaitingForAnswers,
          shouldDisconnect: true,
          allPlayersLeft: false,
          shouldNavigateToResults: false,
          playerList: [],
          pointsAfterCorrection: [],
          questionsLength: 0,
        )) {
    _initializeListeners();
    signalUserConnect();
    AppLogger.i("OrganizerNotifier initialized");
  }

  String get roomId => _socketManager.roomId ?? '';

  void nextQuestion() {
    state = state.copyWith(gameStatus: GameStatus.WaitingForNextQuestion);
    _socketManager.webSocketSender(GameEvents.StartQuestionCountdown.value);
    Timer(const Duration(milliseconds: TIME_TO_NEXT_ANSWER), () {
      state = state.copyWith(gameStatus: GameStatus.WaitingForAnswers);
    });
  }

  void showResults() {
    _socketManager.webSocketSender(GameEvents.ShowResults.value);
  }

  void gradeAnswer(int value) {
    _updatePointsForPlayer(value);

    final isLastQuestion =
        state.gameInfo.currentIndex >= state.answersQRL.length - 1;
    if (isLastQuestion) {
      _sendInfoToUsers();
    } else {
      final updatedGameInfo = GameInfo(
        time: state.gameInfo.time,
        currentQuestionIndex: state.gameInfo.currentQuestionIndex,
        currentIndex: state.gameInfo.currentIndex + 1,
        playersInGame: state.gameInfo.playersInGame,
      );
      state = state.copyWith(gameInfo: updatedGameInfo);
    }
  }

  void signalUserConnect() {
    _socketManager.webSocketSender(ConnectEvents.UserToGame.value);
  }

  void pauseGame() {
    _socketManager.webSocketSender(TimerEvents.Pause.value);
  }

  void startAlertMode() {
    _socketManager.webSocketSender(TimerEvents.AlertGameMode.value);
    AppLogger.i("Alert mode started");
  }

  void abandonGame() {
    // Implement a dialog service similar to messageHandlerService
    // For now, we'll just navigate and stop sound
    // This would typically require a navigation service
    alertSoundPlayer.stop();
    _signalUserDisconnect();
    AppLogger.i("Abandoning game");
  }

  void _signalUserDisconnect() {
    _socketManager
        .webSocketSender(DisconnectEvents.OrganizerDisconnected.value);
    alertSoundPlayer.stop();
    AppLogger.i("Organizer disconnected from game");
    _socketManager.removeRoomId();
  }

  void _updatePointsForPlayer(int value) {
    final currentAnswer = state.answersQRL[state.gameInfo.currentIndex];
    final foundPlayerIndex = state.playerList.indexWhere(
      (player) => player.name == currentAnswer.playerName && player.isInGame,
    );

    if (foundPlayerIndex != -1) {
      // Convert value to percentage (assuming value is 0-100 like QRLGrade)
      final additionalPoints = state.currentQuestion.points * (value / 100);

      // Create updated points list
      final updatedPointsAfterCorrection =
          List<PointsUpdateQRL>.from(state.pointsAfterCorrection);
      updatedPointsAfterCorrection.add(
        PointsUpdateQRL(
          playerName: state.playerList[foundPlayerIndex].name,
          points: state.playerList[foundPlayerIndex].points + additionalPoints,
        ),
      );

      state =
          state.copyWith(pointsAfterCorrection: updatedPointsAfterCorrection);
    }
  }

  void _sendInfoToUsers() {
    state = state.copyWith(
      gameStatus: GameStatus.CorrectionFinished,
      answersQRL: [],
    );

    _socketManager.webSocketSender(GameEvents.CorrectionFinished.value, {
      'pointsTotal': state.pointsAfterCorrection,
    });

    if (state.gameInfo.currentQuestionIndex + 1 >= state.questionsLength) {
      state = state.copyWith(gameStatus: GameStatus.GameFinished);
    }
  }

  void _initializeListeners() {
    _handleQRLAnswer();
    _handleEveryoneSubmitted();
    _handlePlayerStatus();
    _handlePlayerPoints();
    _handlePlayerList();
    _handleTimerValue();
    _handleTimerEnd();
    _handleQuestionsLength();
    _handleNextQuestion();
    _handleResultsSockets();
    _handleGameEnded();
  }

  void _handleQRLAnswer() {
    _socketManager.webSocketReceiver(GameEvents.QRLAnswerSubmitted.value,
        (data) {
      if (data is Map<String, dynamic>) {
        final answer = AnswerQRL(
          playerName: data['playerName'],
          playerAnswer: data['playerAnswer'],
        );

        final updatedAnswers = List<AnswerQRL>.from(state.answersQRL)
          ..add(answer);
        updatedAnswers.sort((a, b) =>
            a.playerName.toLowerCase().compareTo(b.playerName.toLowerCase()));

        state = state.copyWith(answersQRL: updatedAnswers);
        AppLogger.i("QRL Answer received from: ${answer.playerName}");
      } else {
        AppLogger.e("Invalid QRL Answer data received");
      }
    });
  }

  void _handleEveryoneSubmitted() {
    _socketManager.webSocketReceiver(GameEvents.EveryoneSubmitted.value, (_) {
      final updatedGameInfo = GameInfo(
        time: 0,
        currentQuestionIndex: state.gameInfo.currentQuestionIndex,
        currentIndex: state.gameInfo.currentIndex,
        playersInGame: state.gameInfo.playersInGame,
      );

      state = state.copyWith(
        gameInfo: updatedGameInfo,
        gameStatus: GameStatus.OrganizerCorrecting,
      );

      AppLogger.i("Everyone submitted their answers, requesting quick replies");
      ingameChatService.requestQuickReplies();
    });
  }

  void _handlePlayerStatus() {
    _socketManager.webSocketReceiver(GameEvents.PlayerStatusUpdate.value,
        (data) {
      if (data is Map<String, dynamic>) {
        final String playerName = data['name'];
        final bool isInGame = data['isInGame'];

        // Update player list
        final updatedPlayerList = List<PartialPlayer>.from(state.playerList);
        final playerIndex =
            updatedPlayerList.indexWhere((p) => p.name == playerName);
        if (playerIndex != -1) {
          updatedPlayerList[playerIndex] = PartialPlayer(
            name: playerName,
            isInGame: isInGame,
            submitted: false,
            points: updatedPlayerList[playerIndex].points,
            avatarEquipped: updatedPlayerList[playerIndex].avatarEquipped,
            bannerEquipped: updatedPlayerList[playerIndex].bannerEquipped,
          );
        }

        // Filter answers if player left
        List<AnswerQRL> updatedAnswers = state.answersQRL;
        if (!isInGame) {
          updatedAnswers = state.answersQRL
              .where((answer) => answer.playerName != playerName)
              .toList();
        }

        state = state.copyWith(
          playerList: updatedPlayerList,
          answersQRL: updatedAnswers,
        );

        AppLogger.i("Player $playerName status updated: isInGame=$isInGame");
      }
    });
  }

  void _handlePlayerPoints() {
    _socketManager.webSocketReceiver(GameEvents.OrganizerPointsUpdate.value,
        (data) {
      if (data is Map<String, dynamic>) {
        final String playerName = data['name'];
        final int points = data['points'];

        final updatedPlayerList = List<PartialPlayer>.from(state.playerList);
        final playerIndex =
            updatedPlayerList.indexWhere((p) => p.name == playerName);

        if (playerIndex != -1) {
          updatedPlayerList[playerIndex] = PartialPlayer(
            name: playerName,
            submitted: updatedPlayerList[playerIndex].submitted,
            isInGame: updatedPlayerList[playerIndex].isInGame,
            avatarEquipped: updatedPlayerList[playerIndex].avatarEquipped,
            bannerEquipped: updatedPlayerList[playerIndex].bannerEquipped,
            points: points,
          );

          state = state.copyWith(playerList: updatedPlayerList);
          AppLogger.i("Player $playerName points updated: $points");
        }
      }
    });
  }

  void _handlePlayerList() {
    _socketManager.webSocketReceiver(GameEvents.SendPlayerList.value, (data) {
      if (data is List) {
        bool allPlayersLeft = state.allPlayersLeft;
        final List<PartialPlayer> playerList = data.map((player) {
          return PartialPlayer(
            name: player['name'] ?? '', // Add null check
            isInGame: player['isInGame'] ?? false, // Add null check
            points: player['points'] ?? 0,
            submitted: player['submitted'] ?? false,
            avatarEquipped: player['equippedAvatar'] ?? '', // Add null check
            bannerEquipped: player['equippedBanner'] ?? '', // Add null check
          );
        }).toList();

        if (playerList.isEmpty) {
          // Handle empty player list - this would typically involve navigation
          _signalUserDisconnect();
          allPlayersLeft = true;
          AppLogger.w("All players left the game");
          return;
        }

        final playersInGame =
            playerList.where((player) => player.isInGame).length;
        final updatedGameInfo =
            state.gameInfo.copyWith(playersInGame: playersInGame);

        state = state.copyWith(
          playerList: playerList,
          gameInfo: updatedGameInfo,
          allPlayersLeft: allPlayersLeft,
        );

        AppLogger.i(
            "Player list updated: ${playerList.length} players, $playersInGame active");
      }
    });
  }

  void _handleTimerValue() {
    _socketManager.webSocketReceiver(TimerEvents.Value.value, (time) {
      final updatedGameInfo = state.gameInfo.copyWith(time: time);
      state = state.copyWith(gameInfo: updatedGameInfo);
      AppLogger.i("Timer value updated: $time");
    });

    _socketManager.webSocketReceiver(TimerEvents.QuestionCountdownValue.value,
        (time) {
      final updatedGameInfo = state.gameInfo.copyWith(time: time);
      state = state.copyWith(gameInfo: updatedGameInfo);
      AppLogger.i("Question countdown value: $time");
    });

    _socketManager.webSocketReceiver(TimerEvents.Paused.value, (pauseState) {
      final updatedModifiers = state.gameModifiers.copyWith(paused: pauseState);
      state = state.copyWith(gameModifiers: updatedModifiers);
      AppLogger.i("Game paused state: $pauseState");
    });

    _socketManager.webSocketReceiver(TimerEvents.AlertModeStarted.value, (_) {
      final updatedModifiers = state.gameModifiers.copyWith(alertMode: true);
      state = state.copyWith(gameModifiers: updatedModifiers);
      alertSoundPlayer.play();
      AppLogger.i("Alert mode started");
    });
  }

  void _handleTimerEnd() {
    _socketManager.webSocketReceiver(TimerEvents.QuestionCountdownEnd.value,
        (_) {
      alertSoundPlayer.stop();
      AppLogger.i("Question countdown ended");
    });

    _socketManager.webSocketReceiver(TimerEvents.End.value, (_) {
      _socketManager.webSocketSender(GameEvents.QuestionEndByTimer.value);
      AppLogger.i("Timer ended, question ended by timer");
    });
  }

  void _handleQuestionsLength() {
    _socketManager.webSocketReceiver(GameEvents.QuestionsLength.value,
        (length) {
      state = state.copyWith(questionsLength: length);
      AppLogger.i("Questions length: $length");
    });
  }

  void _handleNextQuestion() {
    _socketManager.webSocketReceiver(GameEvents.ProceedToNextQuestion.value,
        (_) {
      if (state.currentQuestion.type == 'QCM' ||
          state.currentQuestion.type == 'QRE') {
        final updatedGameInfo = state.gameInfo.copyWith(time: 0);

        GameStatus newStatus = GameStatus.CorrectionFinished;
        if (state.gameInfo.currentQuestionIndex + 1 >= state.questionsLength) {
          newStatus = GameStatus.GameFinished;
        }

        state = state.copyWith(
          gameStatus: newStatus,
          gameInfo: updatedGameInfo,
        );

        AppLogger.i(
            "Proceeding to next question automatically, requesting quick replies");
        ingameChatService.requestQuickReplies();
      }
    });

    _socketManager.webSocketReceiver(GameEvents.NextQuestion.value, (data) {
      if (data is Map<String, dynamic>) {
        final updatedPlayerList = state.playerList.map((player) {
          if (player.isInGame) {
            return player.copyWith(submitted: false);
          }
          return player;
        }).toList();

        final updatedGameInfo = GameInfo(
          time: state.gameInfo.time,
          currentQuestionIndex: data['index'],
          currentIndex: 0,
          playersInGame: state.gameInfo.playersInGame,
        );

        final updatedModifiers = Modifiers(
          paused: false,
          alertMode: false,
        );

        state = state.copyWith(
          answersQRL: [],
          pointsAfterCorrection: [],
          gameInfo: updatedGameInfo,
          gameModifiers: updatedModifiers,
          currentQuestion: Question.fromJson(data['question']),
          playerList: updatedPlayerList,
        );

        AppLogger.i(
            "Next question received: ${data['index']}, requesting quick replies");
        ingameChatService.requestQuickReplies();
      }
    });
  }

  List<PlayerData> getResultPlayerList() {
    return resultPlayerList;
  }

  void _handleResultsSockets() {
    _socketManager.webSocketReceiver(GameEvents.SendResults.value, (data) {
      alertSoundPlayer.stop();
      final List<dynamic> jsonData = data as List<dynamic>;
      resultPlayerList = jsonData
          .map((json) => PlayerData.fromJson(json as Map<String, dynamic>))
          .toList();
      state = state.copyWith(
          shouldDisconnect: false, shouldNavigateToResults: true);
      // This would typically involve navigation
      AppLogger.i("Game results received");
    });
  }

  void _handleGameEnded() {
    _socketManager.webSocketReceiver(ConnectEvents.AllPlayersLeft.value, (_) {
      // This would typically involve navigation and showing an error dialog
      AppLogger.w("All players left the game");
      alertSoundPlayer.stop();
      state = state.copyWith(allPlayersLeft: true);
      _signalUserDisconnect();
    });
  }

  void _resetAttributes() {
    state = OrganizerState(
      answersQRL: [],
      currentQuestion: Question(
        id: '0',
        type: 'QCM',
        text: '',
        points: 0,
        choices: [],
      ),
      gameInfo: GameInfo(
        time: 0,
        currentQuestionIndex: 0,
        currentIndex: 0,
        playersInGame: 0,
      ),
      gameModifiers: Modifiers(
        paused: false,
        alertMode: false,
      ),
      gameStatus: GameStatus.WaitingForAnswers,
      shouldDisconnect: true,
      allPlayersLeft: false,
      shouldNavigateToResults: false,
      playerList: [],
      pointsAfterCorrection: [],
      questionsLength: 0,
    );
  }

  @override
  void dispose() {
    if (!mounted) return;
    AppLogger.i("Disposing OrganizerNotifier");

    _socketManager.socket?.off(GameEvents.QRLAnswerSubmitted.value);
    _socketManager.socket?.off(GameEvents.EveryoneSubmitted.value);
    _socketManager.socket?.off(GameEvents.PlayerStatusUpdate.value);
    _socketManager.socket?.off(GameEvents.OrganizerPointsUpdate.value);
    _socketManager.socket?.off(GameEvents.SendPlayerList.value);
    _socketManager.socket?.off(TimerEvents.Value.value);
    _socketManager.socket?.off(TimerEvents.QuestionCountdownValue.value);
    _socketManager.socket?.off(TimerEvents.Paused.value);
    _socketManager.socket?.off(TimerEvents.AlertModeStarted.value);
    _socketManager.socket?.off(TimerEvents.QuestionCountdownEnd.value);
    _socketManager.socket?.off(TimerEvents.End.value);
    _socketManager.socket?.off(GameEvents.QuestionsLength.value);
    _socketManager.socket?.off(GameEvents.ProceedToNextQuestion.value);
    _socketManager.socket?.off(GameEvents.NextQuestion.value);
    _socketManager.socket?.off(GameEvents.SendResults.value);
    _socketManager.socket?.off(ConnectEvents.AllPlayersLeft.value);

    _resetAttributes();
    alertSoundPlayer.stop();
    super.dispose();
  }
}
