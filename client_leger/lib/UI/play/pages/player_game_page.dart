import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/play/widgets/feedback_message.dart';
import 'package:client_leger/UI/play/widgets/player_game_page_widgets/question_area.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/models/player_data.dart';
import 'package:client_leger/providers/play/game_player_provider.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:numberpicker/numberpicker.dart';

class PlayerGamePage extends ConsumerStatefulWidget {
  const PlayerGamePage({super.key});

  @override
  ConsumerState<PlayerGamePage> createState() => _PlayerGamePageState();
}

class _PlayerGamePageState extends ConsumerState<PlayerGamePage> {
  final WebSocketManager _socketManager = WebSocketManager.instance;
  bool shouldDisconnect = true;
  static const int MAX_CHARACTERS = 200;
  final TextEditingController _QRLanswerController = TextEditingController();
  List<PlayerData> resultPlayerList = [];

  @override
  void dispose() {
    if (shouldDisconnect) {
      AppLogger.i("Disconnecting player from game and removing roomId");
      _socketManager.isPlaying = false;
      _socketManager.webSocketSender(DisconnectEvents.Player.value);
      _socketManager.removeRoomId();
    }
    _QRLanswerController.dispose();
    super.dispose();
  }

  void abandonGame(GamePlayerNotifier playerGameNotifier) {
    showConfirmationDialog(
        context, "Êtes-vous sûr de vouloir abandonner la partie?", () async {
      playerGameNotifier.stopAlertSound();
      GoRouter.of(context).go(Paths.play);
      _socketManager.isPlaying = false;
    }, null);
  }

  @override
  Widget build(BuildContext context) {
    final playerGameState = ref.watch(gameClientProvider);
    final playerGameNotifier = ref.read(gameClientProvider.notifier);
    final colorScheme = Theme.of(context).colorScheme;

    ref.listen(gameClientProvider, (previous, next) {
      if (next.shouldNavigateToResults) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          shouldDisconnect = false;
          resultPlayerList = playerGameNotifier.getResultPlayerList();
          _socketManager.isPlaying = false;
          GoRouter.of(context).go('${Paths.play}/${Paths.resultsView}',
              extra: resultPlayerList);
        });
      } else if (next.organizerDisconnected == true) {
        AppLogger.w("ORGANIZER DISCONNECTED");
        showToast(context, "L'organisateur a quitté la partie.");
        _socketManager.isPlaying = false;
        GoRouter.of(context).go(Paths.play);
      }
    });

    return SingleChildScrollView(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              // gives the backround
              Theme.of(context).colorScheme.primary,
              Theme.of(context).colorScheme.primary,
              Theme.of(context).colorScheme.secondary,
            ],
          ),
        ),
        padding: const EdgeInsets.all(16),
        height: 670,
        child: Container(
          height: 670,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            border: Border.all(
              color:
                  colorScheme.tertiary.withValues(alpha: 0.3), // Border color
              width: 2, // Border width
            ),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // question area
              QuestionArea(
                paused: playerGameState.gamePaused,
                time: playerGameState.time,
                playerPoints: playerGameState.playerPoints.toString(),
                currentQuestion: playerGameState.currentQuestion,
                currentQuestionIndex: playerGameState.currentQuestionIndex,
                isWaitingForQuestion:
                    playerGameState.playerInfo.waitingForQuestion,
              ),
              SizedBox(height: 32),
              if (playerGameState.currentQuestion.type == QuestionType.QCM.name)
                ...playerGameState.currentQuestion.choices!
                    .asMap()
                    .entries
                    .map((entry) {
                  int choiceIndex = entry.key;
                  final choice = entry.value;
                  return ListTile(
                    title: Text(choice.text,
                        style: TextStyle(
                            fontSize: 16,
                            color: playerGameState.realShowAnswers
                                ? (choice.isCorrect!
                                    ? Colors.green
                                    : Colors.red)
                                : colorScheme.onSurface)),
                    leading: Checkbox(
                      value: playerGameState
                          .playerInfo.choiceSelected[choiceIndex],
                      onChanged: (value) {
                        setState(() {
                          playerGameNotifier.selectChoice(choiceIndex);
                        });
                      },
                    ),
                  );
                }),

              // QRL container
              if (playerGameState.currentQuestion.type == QuestionType.QRL.name)
                Container(
                  decoration: BoxDecoration(
                    color: colorScheme.primary.withAlpha(125),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(
                      color: colorScheme.tertiary
                          .withValues(alpha: 0.3), // Border color
                      width: 2, // Border width
                    ),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 32, vertical: 6),
                  child: Column(
                    children: [
                      if (playerGameState.currentQuestion.type ==
                              QuestionType.QRL.name &&
                          !playerGameState.playerInfo.submitted)
                        Text(
                          'Caractères restants : ${MAX_CHARACTERS - _QRLanswerController.text.length}',
                          style: TextStyle(
                              color: colorScheme.onSurface, fontSize: 16),
                        ),
                      buildFeedbackMessage(
                          playerGameState.choiceFeedback,
                          playerGameState.currentQuestion,
                          playerGameState.playerInfo.submitted),
                      SizedBox(height: 8),
                      if (playerGameState.currentQuestion.type ==
                          QuestionType.QRL.name)
                        TextField(
                          controller: _QRLanswerController,
                          maxLength: MAX_CHARACTERS,
                          enabled: !isSubmissionDisabled(playerGameState),
                          maxLines: 2,
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.all(16),
                            hintText: 'Votre réponse',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(30),
                              borderSide: BorderSide(
                                color:
                                    colorScheme.tertiary.withValues(alpha: 0.3),
                                width: 3,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(30),
                              borderSide: BorderSide(
                                color:
                                    colorScheme.tertiary.withValues(alpha: 0.3),
                                width: 3,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(30),
                              borderSide: BorderSide(
                                color: colorScheme.secondary,
                                width: 3,
                              ),
                            ),
                          ),
                          onChanged: (value) {
                            setState(() {});
                          },
                        ),
                    ],
                  ),
                ),

              if (playerGameState.currentQuestion.type ==
                      QuestionType.QRE.name &&
                  playerGameState.currentQuestion.qreAttributes != null) ...[
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    color: Colors.blue,
                  ),
                  child: NumberPicker(
                    value: playerGameState.qreAnswer,
                    minValue:
                        playerGameState.currentQuestion.qreAttributes!.minBound,
                    maxValue:
                        playerGameState.currentQuestion.qreAttributes!.maxBound,
                    axis: Axis.vertical,
                    onChanged: playerGameState.playerInfo.submitted ||
                            playerGameState.time == 0
                        ? (value) {}
                        : (value) {
                            setState(() {
                              playerGameNotifier.setQreAnswer(value);
                            });
                          },
                    textStyle: TextStyle(
                        color: Theme.of(context).colorScheme.onPrimary,
                        fontSize: 18),
                    selectedTextStyle: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 34),
                  ),
                ),
                SizedBox(height: 16),
                Text(
                    'Borne minimale: ${playerGameState.currentQuestion.qreAttributes!.minBound}',
                    style: TextStyle(fontSize: 16)),
                Text(
                    'Borne maximale: ${playerGameState.currentQuestion.qreAttributes!.maxBound}',
                    style: TextStyle(fontSize: 16)),
                Text('Votre réponse: ${playerGameState.qreAnswer}',
                    style: TextStyle(fontSize: 16)),
                Text(
                    'Marge de tolérance: ${playerGameState.currentQuestion.qreAttributes!.tolerance}',
                    style: TextStyle(fontSize: 16)),
                if (playerGameState.realShowAnswers)
                  Text(
                      'Bonne réponse: ${playerGameState.currentQuestion.qreAttributes!.goodAnswer}',
                      style: TextStyle(fontSize: 16)),
                SizedBox(height: 16),
              ],
              // buildFeedbackMessage(
              //     playerGameState.choiceFeedback,
              //     playerGameState.currentQuestion,
              //     playerGameState.playerInfo.submitted),
              SizedBox(height: 4),
              ElevatedButton(
                onPressed: isSubmissionDisabled(playerGameState)
                    ? null
                    : () {
                        playerGameNotifier.finalizeAnswer();
                        if (playerGameState.currentQuestion.type ==
                            QuestionType.QRL.name) {
                          playerGameNotifier.sendAnswerForCorrection(
                              _QRLanswerController.text);
                          _QRLanswerController.clear();
                        }
                      },
                style: isSubmissionDisabled(playerGameState)
                    ? null
                    : getButtonStyle(context),
                child: Text(
                  "Soumettre",
                  style: TextStyle(
                    fontSize: 16,
                    color: Theme.of(context).colorScheme.tertiary,
                  ),
                ),
              ),
              Align(
                alignment: Alignment.bottomRight,
                child: ElevatedButton(
                  style: getButtonStyle(context),
                  onPressed: () {
                    abandonGame(playerGameNotifier);
                  },
                  child: Text("Abandonner",
                      style: TextStyle(
                        fontSize: 16,
                        color: Theme.of(context).colorScheme.tertiary,
                      )),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

ButtonStyle getButtonStyle(BuildContext context) {
  return ButtonStyle(
    backgroundColor: WidgetStateProperty.all(
      Theme.of(context).colorScheme.primary, // Background color
    ),
    shape: WidgetStateProperty.all(
      RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(50), // Rounded corners
        side: BorderSide(
          color: Theme.of(context).colorScheme.tertiary, // Border color
          width: 3,
        ),
      ),
    ),
  );
}

bool isSubmissionDisabled(GamePlayerState playerGameState) {
  return playerGameState.playerInfo.submitted ||
      playerGameState.time == 0 ||
      playerGameState.choiceFeedback == ChoiceFeedback.AwaitingCorrection ||
      playerGameState.choiceFeedback == ChoiceFeedback.Incorrect ||
      playerGameState.realShowAnswers;
}
