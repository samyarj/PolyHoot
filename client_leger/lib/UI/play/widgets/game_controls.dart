import 'package:client_leger/models/game_info.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Game control buttons (pause and alert)
class GameControls extends ConsumerWidget {
  const GameControls({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(organizerProvider);
    final notifier = ref.read(organizerProvider.notifier);
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Pause button
        ElevatedButton(
          onPressed: state.gameStatus == GameStatus.WaitingForAnswers
              ? () => _safelyCallMethod(() => notifier.pauseGame())
              : null,
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            backgroundColor: state.gameModifiers.paused ? Colors.green : null,
          ),
          child: Text(state.gameModifiers.paused ? 'Reprendre' : 'Pause',
              style: TextStyle(color: colorScheme.primary)),
        ),
        const SizedBox(width: 16),

        // Alert button
        ElevatedButton(
          onPressed: state.gameStatus == GameStatus.WaitingForAnswers &&
                  !state.gameModifiers.alertMode &&
                  ((state.currentQuestion.type == 'QCM' &&
                          state.gameInfo.time > 10) ||
                      (state.currentQuestion.type == 'QRL' &&
                          state.gameInfo.time > 20))
              ? () => _safelyCallMethod(() => notifier.startAlertMode())
              : null,
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            backgroundColor: state.gameModifiers.alertMode &&
                    state.gameStatus != GameStatus.WaitingForNextQuestion
                ? Colors.red
                : null,
          ),
          child: Text(
              state.gameModifiers.alertMode &&
                      state.gameStatus != GameStatus.WaitingForNextQuestion
                  ? 'EN ALERTE'
                  : 'Alerte',
              style: TextStyle(color: colorScheme.primary)),
        ),
      ],
    );
  }

  // Safely call any method that might throw an exception
  void _safelyCallMethod(Function methodToCall) {
    try {
      methodToCall();
    } catch (e) {
      AppLogger.e("Error calling method: $e");
    }
  }
}
