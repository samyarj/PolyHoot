import 'package:client_leger/models/game_info.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Navigation controls (next question, show results)
class NavigationControls extends ConsumerWidget {
  const NavigationControls({
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;

    final state = ref.watch(organizerProvider);
    final notifier = ref.read(organizerProvider.notifier);
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (state.gameStatus == GameStatus.CorrectionFinished)
          ElevatedButton(
            onPressed: () => notifier.nextQuestion(),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: Text(
              'Prochaine question',
              style: TextStyle(color: colorScheme.primary),
            ),
          ),
        if (state.gameStatus == GameStatus.OrganizerCorrecting)
          Text(
            'Veuillez finir la correction avant de passer à la prochaine question',
            style: TextStyle(color: colorScheme.primary),
          ),
        if (state.gameStatus == GameStatus.WaitingForAnswers)
          Text(
            'En attente des réponses des joueurs',
            style: TextStyle(color: colorScheme.primary),
          ),
        if (state.gameStatus == GameStatus.WaitingForNextQuestion)
          Text(
            'La prochaine question s\'affichera dans ${state.gameInfo.time} secondes.',
            style: TextStyle(color: colorScheme.primary),
          ),
        if (state.gameStatus == GameStatus.GameFinished)
          ElevatedButton(
            onPressed: () => notifier.showResults(),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: Text(
              'Afficher les réponses',
              style: TextStyle(color: colorScheme.primary),
            ),
          ),
      ],
    );
  }
}
