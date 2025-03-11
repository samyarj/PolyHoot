import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/models/player_data.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class OrganizerGamePage extends ConsumerStatefulWidget {
  const OrganizerGamePage({super.key});

  @override
  ConsumerState<OrganizerGamePage> createState() => _OrganizerGamePageState();
}

class _OrganizerGamePageState extends ConsumerState<OrganizerGamePage> {
  bool shouldDisconnect = true;
  List<PlayerData> resultPlayerList = [];

  @override
  void dispose() {
    if (shouldDisconnect) {
      AppLogger.i("Disconnecting organizer from game");
      ref.read(organizerProvider.notifier).signalUserDisconnect();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(organizerProvider);
    final notifier = ref.read(organizerProvider.notifier);

    ref.listen(organizerProvider, (previous, next) {
      if (next.shouldNavigateToResults) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          shouldDisconnect = false;
          // Convert playerList to PlayerData format
          resultPlayerList = next.playerList
              .map((player) => PlayerData(
                    name: player.name,
                    points: player.points,
                    isActive: player.isInGame,
                  ))
              .toList();
          context.go(Paths.resultsView, extra: resultPlayerList);
        });
      }
    });

    return PopScope(
      onPopInvoked: (didPop) {
        if (!didPop) {
          _handleAbandonGame(context, notifier);
        }
      },
      canPop: false,
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              // Title Section
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16.0),
                child: Text(
                  "Vue Organisateur",
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
              ),

              // Main Content - Takes remaining space
              Expanded(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Main content area (left)
                    Expanded(
                      flex: 3,
                      child: _buildMainContent(context, state, notifier),
                    ),

                    // Vertical divider
                    const VerticalDivider(width: 1, thickness: 1),

                    // Chat area (right)
                    Expanded(
                      flex: 1,
                      child: Container(
                        color: Colors.grey[100],
                        child: const Center(child: Text('Chat')),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMainContent(
      BuildContext context, OrganizerState state, OrganizerNotifier notifier) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Question Section with timer and points
            _buildQuestionSection(state),
            const SizedBox(height: 20),

            // QRL correction section or histogram
            _buildQuestionTypeSection(context, state, notifier),
            const SizedBox(height: 20),

            // Controls section
            _buildControlSection(context, state, notifier),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestionSection(OrganizerState state) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.3),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Points',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '${state.currentQuestion.points}',
                    style: const TextStyle(fontSize: 18),
                  ),
                ],
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    state.currentQuestion.text,
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'Temps Restant',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  if (state.gameStatus != GameStatus.WaitingForNextQuestion)
                    Text(
                      '${state.gameInfo.time}',
                      style: const TextStyle(fontSize: 18),
                    ),
                  if (state.gameModifiers.paused &&
                      state.gameStatus != GameStatus.WaitingForNextQuestion)
                    const Text(
                      'PAUSE',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.red),
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionTypeSection(
      BuildContext context, OrganizerState state, OrganizerNotifier notifier) {
    // For QRL questions when waiting for answers
    if (state.currentQuestion.type == 'QRL' &&
        state.gameStatus == GameStatus.WaitingForAnswers) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 3,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: const Center(
          child: Text(
            'En attente des réponses des joueurs',
            style: TextStyle(fontSize: 18),
          ),
        ),
      );
    }

    // For QRL questions when correcting
    if (state.currentQuestion.type == 'QRL' &&
        state.gameStatus == GameStatus.OrganizerCorrecting) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 3,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            const Text(
              'Correction des réponses',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Text(
              '${state.gameInfo.currentIndex < state.answersQRL.length ? state.answersQRL[state.gameInfo.currentIndex].playerName : ""}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'Réponse:',
              style: TextStyle(fontSize: 15),
            ),
            const SizedBox(height: 5),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Text(
                state.gameInfo.currentIndex < state.answersQRL.length
                    ? state.answersQRL[state.gameInfo.currentIndex].playerAnswer
                    : "",
                style: const TextStyle(fontSize: 16),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () => notifier.gradeAnswer(0),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red[400],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                  ),
                  child: const Text('0 %'),
                ),
                ElevatedButton(
                  onPressed: () => notifier.gradeAnswer(50),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                  ),
                  child: const Text('50 %'),
                ),
                ElevatedButton(
                  onPressed: () => notifier.gradeAnswer(100),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                  ),
                  child: const Text('100 %'),
                ),
              ],
            ),
          ],
        ),
      );
    }

    // For QRL questions when correction is finished or waiting for next question
    if (state.currentQuestion.type == 'QRL' &&
        (state.gameStatus == GameStatus.CorrectionFinished ||
            state.gameStatus == GameStatus.WaitingForNextQuestion ||
            state.gameStatus == GameStatus.GameFinished)) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 3,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            const Text(
              'Correction des réponses',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            if (state.gameStatus == GameStatus.CorrectionFinished ||
                state.gameStatus == GameStatus.WaitingForNextQuestion)
              const Column(
                children: [
                  Text('La correction est finie!',
                      style: TextStyle(fontSize: 18)),
                  SizedBox(height: 5),
                  Text('Les notes ont été envoyées aux joueurs.',
                      style: TextStyle(fontSize: 18)),
                  SizedBox(height: 5),
                  Text('Vous pouvez passer à la prochaine question!',
                      style: TextStyle(fontSize: 18)),
                ],
              ),
            if (state.gameStatus == GameStatus.GameFinished)
              const Column(
                children: [
                  Text('La partie est finie!', style: TextStyle(fontSize: 18)),
                  SizedBox(height: 5),
                  Text('Vous pouvez maintenant passer à la vue des résultats',
                      style: TextStyle(fontSize: 18)),
                ],
              ),
          ],
        ),
      );
    }

    // Default case for QCM or other question types
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.3),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: const Center(
        child: Text(
          'Vue de la question',
          style: TextStyle(fontSize: 18),
        ),
      ),
    );
  }

  Widget _buildControlSection(
      BuildContext context, OrganizerState state, OrganizerNotifier notifier) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.3),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Timer controls
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (state.gameStatus == GameStatus.CorrectionFinished)
                ElevatedButton(
                  onPressed: () => notifier.nextQuestion(),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                  ),
                  child: const Text('Prochaine question'),
                ),
              if (state.gameStatus == GameStatus.OrganizerCorrecting)
                const Text(
                    'Veuillez finir la correction avant de passer à la prochaine question'),
              if (state.gameStatus == GameStatus.WaitingForAnswers)
                const Text('En attente des réponses des joueurs'),
              if (state.gameStatus == GameStatus.WaitingForNextQuestion)
                Text(
                    'La prochaine question s\'affichera dans ${state.gameInfo.time} secondes.'),
              if (state.gameStatus == GameStatus.GameFinished)
                ElevatedButton(
                  onPressed: () => _handleShowResults(context, notifier),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                  ),
                  child: const Text('Afficher les réponses'),
                ),
            ],
          ),
          const SizedBox(height: 20),
          // Game control buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: state.gameStatus == GameStatus.WaitingForAnswers
                    ? () => notifier.pauseGame()
                    : null,
                style: ElevatedButton.styleFrom(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  backgroundColor:
                      state.gameModifiers.paused ? Colors.green : null,
                ),
                child: Text(state.gameModifiers.paused ? 'Reprendre' : 'Pause'),
              ),
              const SizedBox(width: 16),
              ElevatedButton(
                onPressed: state.gameStatus == GameStatus.WaitingForAnswers &&
                        !state.gameModifiers.alertMode &&
                        ((state.currentQuestion.type == 'QCM' &&
                                state.gameInfo.time > 10) ||
                            (state.currentQuestion.type == 'QRL' &&
                                state.gameInfo.time > 20))
                    ? () => notifier.startAlertMode()
                    : null,
                style: ElevatedButton.styleFrom(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  backgroundColor: state.gameModifiers.alertMode &&
                          state.gameStatus != GameStatus.WaitingForNextQuestion
                      ? Colors.red
                      : null,
                ),
                child: Text(state.gameModifiers.alertMode &&
                        state.gameStatus != GameStatus.WaitingForNextQuestion
                    ? 'EN ALERTE'
                    : 'Alerte'),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Player list (simplified)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Joueurs',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 150,
                  child: ListView.builder(
                    itemCount: state.playerList.length,
                    itemBuilder: (context, index) {
                      final player = state.playerList[index];
                      return ListTile(
                        dense: true,
                        title: Text(player.name),
                        subtitle:
                            Text('Points: ${player.points.toStringAsFixed(1)}'),
                        leading: Icon(
                          Icons.person,
                          color: player.isInGame ? Colors.green : Colors.grey,
                        ),
                        trailing: player.submitted
                            ? const Icon(Icons.check_circle,
                                color: Colors.green)
                            : const Icon(Icons.hourglass_empty,
                                color: Colors.orange),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Abandon button
          ElevatedButton(
            onPressed: () => _handleAbandonGame(context, notifier),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Text('Abandonner'),
          ),
        ],
      ),
    );
  }

  void _handleShowResults(BuildContext context, OrganizerNotifier notifier) {
    notifier.showResults();
    // Convert state.playerList to List<PlayerData> format
    // This is a simplified example. You'll need to adjust based on your actual data models
    final List<PlayerData> playerDataList = notifier.state.playerList
        .map((player) => PlayerData(
              name: player.name,
              points: player.points,
              isActive: player.isInGame,
            ))
        .toList();

    context.go(Paths.resultsView, extra: playerDataList);
  }

  void _handleAbandonGame(BuildContext context, OrganizerNotifier notifier) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Abandonner la partie'),
        content: const Text('Êtes-vous sûr de vouloir abandonner la partie?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              notifier.abandonGame();
              context.go(Paths.play);
            },
            child: const Text('Abandonner'),
          ),
        ],
      ),
    );
  }
}
