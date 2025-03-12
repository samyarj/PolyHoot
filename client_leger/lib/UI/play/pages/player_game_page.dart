import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/models/player_data.dart';
import 'package:client_leger/providers/play/game_player_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:client_leger/UI/play/widgets/feedback_message.dart';
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
    });
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
          GoRouter.of(context).go('${Paths.play}/${Paths.resultsView}',
              extra: resultPlayerList);
        });
      } else if (next.organizerDisconnected) {
        showErrorDialog(context, "L'organisateur a quitté la partie.");
        GoRouter.of(context).go(Paths.play);
      }
    });

    return SingleChildScrollView(
      physics: NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16.0),
      child: SizedBox(
        height: 625,
        child: Column(
          children: [
            SizedBox(height: 16),
            Text(playerGameState.quizTitle,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            SizedBox(height: 16),
            Text("Vos points: ${playerGameState.playerPoints.toString()}",
                style: TextStyle(color: colorScheme.onSurface, fontSize: 20)),
            SizedBox(height: 16),
            Row(
              children: [
                Text(
                  "${playerGameState.currentQuestion.points.toString()} points",
                  style: TextStyle(color: colorScheme.onSurface, fontSize: 20),
                ),
                SizedBox(width: 16),
                if (playerGameState.playerInfo.waitingForQuestion)
                  Text(
                    "La prochaine question commence dans ${playerGameState.time} seconde${playerGameState.time == 1 ? '' : 's'}.",
                    style:
                        TextStyle(color: colorScheme.onSurface, fontSize: 20),
                  ),
                if (!playerGameState.playerInfo.waitingForQuestion)
                  Expanded(
                    child: Text(playerGameState.currentQuestion.text,
                        style: TextStyle(fontSize: 20)),
                  ),
                Column(
                  children: [
                    if (!playerGameState.playerInfo.waitingForQuestion)
                      Text(
                        playerGameState.time.toString(),
                        style: TextStyle(fontSize: 20),
                      ),
                    if (playerGameState.gamePaused)
                      Text(
                        "Jeu en pause",
                        style: TextStyle(fontSize: 20),
                      ),
                  ],
                )
              ],
            ),
            SizedBox(height: 16),
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
                          fontSize: 20,
                          color: playerGameState.realShowAnswers
                              ? (choice.isCorrect! ? Colors.green : Colors.red)
                              : colorScheme.onSurface)),
                  leading: Checkbox(
                    value:
                        playerGameState.playerInfo.choiceSelected[choiceIndex],
                    onChanged: (value) {
                      setState(() {
                        playerGameNotifier.selectChoice(choiceIndex);
                      });
                    },
                  ),
                );
              }),
            if (playerGameState.currentQuestion.type == QuestionType.QRL.name &&
                !playerGameState.playerInfo.submitted)
              Text(
                'Caractères restants : ${MAX_CHARACTERS - _QRLanswerController.text.length}',
                style: TextStyle(color: colorScheme.onSurface, fontSize: 16),
              ),
            if (playerGameState.currentQuestion.type == QuestionType.QRL.name)
              TextField(
                controller: _QRLanswerController,
                maxLength: MAX_CHARACTERS,
                enabled: !playerGameState.playerInfo.submitted,
                decoration: InputDecoration(
                  hintText: 'Votre réponse',
                  border: OutlineInputBorder(),
                ),
                onChanged: (value) {
                  setState(() {});
                },
              ),
            if (playerGameState.currentQuestion.type == QuestionType.QRE.name &&
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
                  style: TextStyle(fontSize: 20)),
              Text(
                  'Borne maximale: ${playerGameState.currentQuestion.qreAttributes!.maxBound}',
                  style: TextStyle(fontSize: 20)),
              Text('Votre réponse: ${playerGameState.qreAnswer}',
                  style: TextStyle(fontSize: 20)),
              Text(
                  'Marge de tolérance: ${playerGameState.currentQuestion.qreAttributes!.tolerance}',
                  style: TextStyle(fontSize: 20)),
              if (playerGameState.realShowAnswers)
                Text(
                    'Bonne réponse: ${playerGameState.currentQuestion.qreAttributes!.goodAnswer}',
                    style: TextStyle(fontSize: 20)),
              SizedBox(height: 16),
            ],
            buildFeedbackMessage(playerGameState.choiceFeedback,
                playerGameState.currentQuestion),
            ElevatedButton(
              onPressed: playerGameState.playerInfo.submitted ||
                      playerGameState.time == 0
                  ? null
                  : () {
                      playerGameNotifier.finalizeAnswer();
                      if (playerGameState.currentQuestion.type ==
                          QuestionType.QRL.name) {
                        playerGameNotifier
                            .sendAnswerForCorrection(_QRLanswerController.text);
                        _QRLanswerController.clear();
                      }
                    },
              child: Text("Soumettre", style: TextStyle(fontSize: 20)),
            ),
            Spacer(),
            Align(
              alignment: Alignment.bottomRight,
              child: ElevatedButton(
                onPressed: () {
                  abandonGame(playerGameNotifier);
                },
                child: Text("Abandonner", style: TextStyle(fontSize: 20)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ...
}
