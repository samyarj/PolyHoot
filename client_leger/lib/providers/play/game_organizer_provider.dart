// import 'package:client_leger/backend-communication-services/models/enums.dart';
// import 'package:client_leger/backend-communication-services/models/player_info.dart';
// import 'package:client_leger/backend-communication-services/models/question.dart';
// import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
// import 'package:client_leger/utilities/logger.dart';
// import 'package:client_leger/utilities/socket_events.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';

// final organizerProvider =
//     StateNotifierProvider.autoDispose<OrganizerNotifier, OrganizerState>((ref) {
//   return OrganizerNotifier();
// });

// // ref: organizer.service.ts dans le lourd

// class OrganizerState {
//   final String quizTitle;
//   final int playerPoints;
//   final int currentQuestionIndex;
//   final bool gamePaused;
//   final bool finalAnswer;
//   final bool realShowAnswers;
//   final bool socketsInitialized;
//   final String answer;
//   final ChoiceFeedback choiceFeedback;
//   final Question currentQuestion;
//   final PlayerInfo playerInfo;
//   final int time;
//   final List<AnswerQRL> answersQRL;
//   final GameInfo gameInfo;
//   final Modifiers gameModifiers;
//   final GameStatus gameStatus;
//   final bool shouldDisconnect;
//   final List<int> totalNumberOfAnswers;
//   final List<PointsUpdateQRL> pointsAfterCorrection;
//   final List<bool> isCorrectAnswersArray;

//   OrganizerState({
//     required this.quizTitle,
//     required this.playerPoints,
//     required this.currentQuestionIndex,
//     required this.gamePaused,
//     required this.finalAnswer,
//     required this.realShowAnswers,
//     required this.socketsInitialized,
//     required this.answer,
//     required this.choiceFeedback,
//     required this.currentQuestion,
//     required this.playerInfo,
//     required this.time,
//     required this.answersQRL,
//     required this.gameInfo,
//     required this.gameModifiers,
//     required this.gameStatus,
//     required this.shouldDisconnect,
//     required this.totalNumberOfAnswers,
//     required this.pointsAfterCorrection,
//     required this.isCorrectAnswersArray,
//   });

//   OrganizerState copyWith({
//     String? quizTitle,
//     int? playerPoints,
//     int? currentQuestionIndex,
//     bool? gamePaused,
//     bool? finalAnswer,
//     bool? realShowAnswers,
//     bool? socketsInitialized,
//     String? answer,
//     ChoiceFeedback? choiceFeedback,
//     Question? currentQuestion,
//     PlayerInfo? playerInfo,
//     int? time,
//     List<AnswerQRL>? answersQRL,
//     GameInfo? gameInfo,
//     Modifiers? gameModifiers,
//     GameStatus? gameStatus,
//     bool? shouldDisconnect,
//     List<int>? totalNumberOfAnswers,
//     List<PointsUpdateQRL>? pointsAfterCorrection,
//     List<bool>? isCorrectAnswersArray,
//   }) {
//     return OrganizerState(
//       quizTitle: quizTitle ?? this.quizTitle,
//       playerPoints: playerPoints ?? this.playerPoints,
//       currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
//       gamePaused: gamePaused ?? this.gamePaused,
//       finalAnswer: finalAnswer ?? this.finalAnswer,
//       realShowAnswers: realShowAnswers ?? this.realShowAnswers,
//       socketsInitialized: socketsInitialized ?? this.socketsInitialized,
//       answer: answer ?? this.answer,
//       choiceFeedback: choiceFeedback ?? this.choiceFeedback,
//       currentQuestion: currentQuestion ?? this.currentQuestion,
//       playerInfo: playerInfo ?? this.playerInfo,
//       time: time ?? this.time,
//       answersQRL: answersQRL ?? this.answersQRL,
//       gameInfo: gameInfo ?? this.gameInfo,
//       gameModifiers: gameModifiers ?? this.gameModifiers,
//       gameStatus: gameStatus ?? this.gameStatus,
//       shouldDisconnect: shouldDisconnect ?? this.shouldDisconnect,
//       totalNumberOfAnswers: totalNumberOfAnswers ?? this.totalNumberOfAnswers,
//       pointsAfterCorrection:
//           pointsAfterCorrection ?? this.pointsAfterCorrection,
//       isCorrectAnswersArray:
//           isCorrectAnswersArray ?? this.isCorrectAnswersArray,
//     );
//   }
// }

// class OrganizerNotifier extends StateNotifier<OrganizerState> {
//   final WebSocketManager _socketManager = WebSocketManager.instance;

//   OrganizerNotifier()
//       : super(OrganizerState(
//           quizTitle: '',
//           playerPoints: 0,
//           currentQuestionIndex: 0,
//           gamePaused: false,
//           finalAnswer: false,
//           realShowAnswers: false,
//           socketsInitialized: false,
//           answer: '',
//           choiceFeedback: ChoiceFeedback.Idle,
//           currentQuestion: Question(type: '', text: '', points: 0),
//           playerInfo: PlayerInfo(
//               submitted: false,
//               userFirst: false,
//               choiceSelected: [false, false, false, false],
//               waitingForQuestion: false),
//           time: 0,
//           answersQRL: [],
//           gameInfo: GameInfo(
//               time: 0,
//               currentQuestionIndex: 0,
//               currentIndex: 0,
//               playersInGame: 0),
//           gameModifiers: Modifiers(paused: false, alertMode: false),
//           gameStatus: GameStatus.WaitingForAnswers,
//           shouldDisconnect: true,
//           totalNumberOfAnswers: [0, 0, 0],
//           pointsAfterCorrection: [],
//           isCorrectAnswersArray: [],
//         )) {
//     _setupListeners();
//   }

//   void _setupListeners() {
//     if (!state.socketsInitialized) {
//       _socketManager.webSocketReceiver(TimerEvents.Paused.value, (pauseState) {
//         state = state.copyWith(gamePaused: pauseState);
//       });

//       _socketManager.webSocketReceiver(TimerEvents.AlertModeStarted.value, (_) {
//         // Play alert sound
//       });

//       _socketManager.webSocketReceiver(TimerEvents.QuestionCountdownValue.value,
//           (time) {
//         state = state.copyWith(
//             gamePaused: false,
//             playerInfo: state.playerInfo.copyWith(waitingForQuestion: true),
//             time: time);
//       });

//       _socketManager.webSocketReceiver(TimerEvents.QuestionCountdownEnd.value,
//           (_) {
//         state = state.copyWith(
//             playerInfo: state.playerInfo.copyWith(waitingForQuestion: false));
//         // Stop alert sound
//       });

//       _socketManager.webSocketReceiver(TimerEvents.Value.value, (time) {
//         state = state.copyWith(time: time);
//       });

//       _socketManager.webSocketReceiver(TimerEvents.End.value, (time) {
//         state = state.copyWith(time: time);
//       });

//       _socketManager.webSocketReceiver(GameEvents.WaitingForCorrection.value,
//           (_) {
//         state =
//             state.copyWith(choiceFeedback: ChoiceFeedback.AwaitingCorrection);
//       });

//       _socketManager.webSocketReceiver(GameEvents.NextQuestion.value,
//           (nextQuestion) {
//         if (nextQuestion != null && nextQuestion['index'] != null) {
//           resetAttributes();
//           state = state.copyWith(
//             playerInfo: state.playerInfo.copyWith(submitted: false),
//             currentQuestionIndex: nextQuestion['index'],
//             currentQuestion: Question.fromJson(nextQuestion['question']),
//           );
//         }
//       });

//       _socketManager.webSocketReceiver(GameEvents.PlayerPointsUpdate.value,
//           (playerQuestionInfo) {
//         if (playerQuestionInfo['points'] ==
//             state.playerPoints + state.currentQuestion.points) {
//           state = state.copyWith(choiceFeedback: ChoiceFeedback.Correct);
//         } else if (playerQuestionInfo['points'] == state.playerPoints) {
//           state = state.copyWith(choiceFeedback: ChoiceFeedback.Incorrect);
//         } else {
//           state = state.copyWith(choiceFeedback: ChoiceFeedback.Partial);
//         }
//         if (playerQuestionInfo['isFirst']) {
//           state = state.copyWith(
//             playerInfo: state.playerInfo
//                 .copyWith(userFirst: playerQuestionInfo['isFirst']),
//             choiceFeedback: ChoiceFeedback.First,
//           );
//         }
//         state = state.copyWith(
//           playerPoints: playerQuestionInfo['points'],
//           realShowAnswers: true,
//           playerInfo: state.playerInfo
//               .copyWith(choiceSelected: [false, false, false, false]),
//         );
//       });

//       _socketManager.webSocketReceiver(DisconnectEvents.OrganizerHasLeft.value,
//           (_) {
//         // Navigate to home
//         if (!_socketManager.isOrganizer) {
//           // Show error dialog
//           // Stop alert sound
//         }
//       });

//       _socketManager.webSocketReceiver(GameEvents.SendResults.value, (_) {
//         state = state.copyWith(shouldDisconnect: false);
//         // Navigate to results
//         // Stop alert sound
//         _socketManager.canChat = true;
//       });

//       state = state.copyWith(socketsInitialized: true);
//     }
//   }

//   void selectChoice(int indexChoice) {
//     if (state.time > 0 && !state.finalAnswer) {
//       if (state.currentQuestion.choices != null &&
//           state.currentQuestion.choices[indexChoice] != null) {
//         state.currentQuestion.choices[indexChoice].isSelected =
//             !state.currentQuestion.choices[indexChoice].isSelected;
//         state.playerInfo.choiceSelected[indexChoice] =
//             !state.playerInfo.choiceSelected[indexChoice];
//         _socketManager.webSocketSender(
//             GameEvents.SelectFromPlayer.value, {'choice': indexChoice});
//       }
//     }
//   }

//   void finalizeAnswer() {
//     state = state.copyWith(
//         playerInfo: state.playerInfo.copyWith(submitted: true),
//         choiceFeedback: ChoiceFeedback.Awaiting);
//     if (!state.finalAnswer && state.time > 0) {
//       state = state.copyWith(finalAnswer: true);
//       _socketManager.webSocketSender(GameEvents.FinalizePlayerAnswer.value);
//     }
//   }

//   void resetAttributes() {
//     state = state.copyWith(
//       choiceFeedback: ChoiceFeedback.Idle,
//       answer: '',
//       gamePaused: false,
//       finalAnswer: false,
//       realShowAnswers: false,
//       playerInfo: state.playerInfo.copyWith(
//         userFirst: false,
//         waitingForQuestion: false,
//         choiceSelected: [false, false, false, false],
//       ),
//       shouldDisconnect: true,
//     );
//     if (state.currentQuestion.choices != null) {
//       for (var choice in state.currentQuestion.choices) {
//         choice.isSelected = false;
//       }
//     }
//   }

//   void getTitle() {
//     _socketManager.webSocketSender(JoinEvents.TitleRequest.value, (title) {
//       state = state.copyWith(quizTitle: title);
//     });
//   }

//   void signalUserDisconnect() {
//     _socketManager.webSocketSender(DisconnectEvents.Player.value);
//     // Stop alert sound
//   }

//   void signalUserConnect() {
//     _socketManager.webSocketSender(ConnectEvents.UserToGame.value);
//   }

//   void sendAnswerForCorrection(String answer) {
//     _socketManager.webSocketSender(GameEvents.QRLAnswerSubmitted.value,
//         {'player': _socketManager.playerName, 'playerAnswer': answer});
//   }

//   void abandonGame() {
//     // Show confirmation dialog
//     // Navigate to home
//     // Stop alert sound
//   }

//   void nextQuestion() {
//     state = state.copyWith(gameStatus: GameStatus.WaitingForNextQuestion);
//     _socketManager.webSocketSender(GameEvents.StartQuestionCountdown.value);
//     Future.delayed(Duration(seconds: TIME_TO_NEXT_ANSWER), () {
//       state = state.copyWith(gameStatus: GameStatus.WaitingForAnswers);
//     });
//   }

//   void showResults() {
//     _socketManager.webSocketSender(GameEvents.ShowResults.value);
//   }

//   void gradeAnswer(QRLGrade value) {
//     updateTotalAnswersArray(value);
//     updatePointsForPlayer(value);

//     final isLastQuestion =
//         state.gameInfo.currentIndex >= state.answersQRL.length - 1;
//     if (isLastQuestion) {
//       sendInfoToUsers();
//     } else {
//       state = state.copyWith(
//           gameInfo: state.gameInfo
//               .copyWith(currentIndex: state.gameInfo.currentIndex + 1));
//     }
//   }

//   void pauseGame() {
//     _socketManager.webSocketSender(TimerEvents.Pause.value);
//   }

//   void startAlertMode() {
//     _socketManager.webSocketSender(TimerEvents.AlertGameMode.value);
//   }

//   void initializeAttributes() {
//     initializeCorrectAnswers();
//     state = state.copyWith(
//       gameStatus: GameStatus.WaitingForAnswers,
//       gameModifiers:
//           state.gameModifiers.copyWith(paused: false, alertMode: false),
//       gameInfo: state.gameInfo.copyWith(time: 0),
//       currentQuestion: DEFAULT_QUESTION,
//       shouldDisconnect: true,
//     );
//   }

//   void updatePointsForPlayer(QRLGrade value) {
//     final foundPlayer = state.playerListService.playerList.firstWhere(
//         (player) =>
//             player.name ==
//             state.answersQRL[state.gameInfo.currentIndex].player);
//     if (foundPlayer != null && foundPlayer.isInGame) {
//       final additionalPoints = state.currentQuestion.points *
//           (value / 100); // Conversion en pourcentage
//       state = state.copyWith(pointsAfterCorrection: [
//         ...state.pointsAfterCorrection,
//         PointsUpdateQRL(
//             playerName: foundPlayer.name,
//             points: foundPlayer.points + additionalPoints),
//       ]);
//     }
//   }

//   void updateTotalAnswersArray(QRLGrade value) {
//     if (value == QRLGrade.Wrong) state.totalNumberOfAnswers[0] += 1;
//     if (value == QRLGrade.Partial) state.totalNumberOfAnswers[1] += 1;
//     if (value == QRLGrade.Correct) state.totalNumberOfAnswers[2] += 1;
//   }

//   void sendInfoToUsers() {
//     state = state
//         .copyWith(gameStatus: GameStatus.CorrectionFinished, answersQRL: []);
//     _socketManager.webSocketSender(GameEvents.CorrectionFinished.value, {
//       'pointsTotal': state.pointsAfterCorrection,
//       'answers': state.totalNumberOfAnswers,
//     });
//     if (state.gameInfo.currentQuestionIndex + 1 >= state.questionsLength) {
//       state = state.copyWith(gameStatus: GameStatus.GameFinished);
//     }
//   }

//   void initializeCorrectAnswers() {
//     state = state.copyWith(isCorrectAnswersArray: []);
//     final choices = state.currentQuestion.choices;
//     if (choices != null) {
//       for (final choice in choices) {
//         if (choice.isCorrect) {
//           state.isCorrectAnswersArray.add(true);
//         } else {
//           state.isCorrectAnswersArray.add(false);
//         }
//       }
//     }
//   }

//   void handleQRLAnswer() {
//     _socketManager.webSocketReceiver(GameEvents.QRLAnswerSubmitted.value,
//         (data) {
//       state = state.copyWith(
//           answersQRL: [...state.answersQRL, AnswerQRL.fromJson(data)]);
//       state.answersQRL.sort(
//           (a, b) => a.player.toLowerCase().compareTo(b.player.toLowerCase()));
//     });
//   }

//   void handleEveryoneSubmitted() {
//     _socketManager.webSocketReceiver(GameEvents.EveryoneSubmitted.value, (_) {
//       state = state.copyWith(gameStatus: GameStatus.OrganizerCorrecting);
//     });
//   }

//   void handlePlayerStatus() {
//     _socketManager.webSocketReceiver(GameEvents.PlayerStatusUpdate.value,
//         (player) {
//       state.playerListService
//           .updatePlayerPresence(player['name'], player['isInGame']);
//       if (!player['isInGame']) {
//         state = state.copyWith(
//             answersQRL: state.answersQRL
//                 .where((playerGraded) => playerGraded.player != player['name'])
//                 .toList());
//       }
//     });
//   }

//   void handlePlayerPoints() {
//     _socketManager.webSocketReceiver(GameEvents.OrganizerPointsUpdate.value,
//         (player) {
//       state.playerListService
//           .updatePlayerPoints(player['name'], player['points']);
//     });
//   }

//   void handlePlayerList() {
//     _socketManager.webSocketReceiver(GameEvents.SendPlayerList.value,
//         (playerList) {
//       if (playerList.isEmpty) {
//         // Navigate to create
//         // Show error dialog
//         signalUserDisconnect();
//         return;
//       }
//       state = state.copyWith(
//         gameInfo: state.gameInfo.copyWith(
//             playersInGame:
//                 playerList.where((player) => player['isInGame']).length),
//         playerListService: state.playerListService
//             .copyWith(playerList: playerList, noPlayers: playerList.length),
//       );
//     });
//   }

//   void handlePlayerListSockets() {
//     handlePlayerStatus();
//     handlePlayerPoints();
//     handlePlayerList();
//   }

//   void handleTimerValue() {
//     _socketManager.webSocketReceiver(TimerEvents.Value.value, (time) {
//       state = state.copyWith(gameInfo: state.gameInfo.copyWith(time: time));
//     });
//     _socketManager.webSocketReceiver(TimerEvents.QuestionCountdownValue.value,
//         (time) {
//       state = state.copyWith(gameInfo: state.gameInfo.copyWith(time: time));
//     });
//     _socketManager.webSocketReceiver(TimerEvents.Paused.value, (pauseState) {
//       state = state.copyWith(
//           gameModifiers: state.gameModifiers.copyWith(paused: pauseState));
//     });
//     _socketManager.webSocketReceiver(TimerEvents.AlertModeStarted.value, (_) {
//       state = state.copyWith(
//           gameModifiers: state.gameModifiers.copyWith(alertMode: true));
//       // Play alert sound
//     });
//   }

//   void handleTimerEnd() {
//     _socketManager.webSocketReceiver(TimerEvents.QuestionCountdownEnd.value,
//         (_) {
//       // Stop alert sound
//     });

//     _socketManager.webSocketReceiver(TimerEvents.End.value, (_) {
//       _socketManager.webSocketSender(GameEvents.QuestionEndByTimer.value);
//     });
//   }

//   void handleQuestionsLength() {
//     _socketManager.webSocketReceiver(GameEvents.QuestionsLength.value,
//         (length) {
//       state = state.copyWith(questionsLength: length);
//     });
//   }

//   void handleNextQuestion() {
//     _socketManager.webSocketReceiver(GameEvents.ProceedToNextQuestion.value,
//         (_) {
//       if (state.currentQuestion.type == QuestionType.QCM) {
//         state = state.copyWith(gameStatus: GameStatus.CorrectionFinished);
//         if (state.gameInfo.currentQuestionIndex + 1 >= state.questionsLength) {
//           state = state.copyWith(gameStatus: GameStatus.GameFinished);
//         }
//       }
//     });
//     _socketManager.webSocketReceiver(GameEvents.NextQuestion.value,
//         (nextQuestion) {
//       state.playerListService.resetPlayerList();
//       state = state.copyWith(
//         answersQRL: [],
//         pointsAfterCorrection: [],
//         totalNumberOfAnswers: [0, 0, 0],
//         gameInfo: state.gameInfo.copyWith(
//             currentIndex: 0, currentQuestionIndex: nextQuestion['index']),
//         gameModifiers:
//             state.gameModifiers.copyWith(paused: false, alertMode: false),
//         currentQuestion: Question.fromJson(nextQuestion['question']),
//       );
//       initializeCorrectAnswers();
//     });
//   }

//   void handleTimeSockets() {
//     handleTimerValue();
//     handleTimerEnd();
//     handleQuestionsLength();
//     handleNextQuestion();
//   }

//   void handleResultsSockets() {
//     _socketManager.webSocketReceiver(GameEvents.SendResults.value, (_) {
//       state = state.copyWith(shouldDisconnect: false);
//       // Navigate to results
//       // Stop alert sound
//     });
//   }

//   void handleGameEnded() {
//     _socketManager.webSocketReceiver(ConnectEvents.AllPlayersLeft.value, (_) {
//       // Navigate to create
//       // Show error dialog
//       // Stop alert sound
//     });
//   }
// }
