import 'package:client_leger/models/game_info.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';

// QRL status panel (after correction or when finished)
class QRLStatusPanel extends StatelessWidget {
  final OrganizerState state;

  const QRLStatusPanel({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.3),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'Correction des réponses',
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: colorScheme.primary),
          ),
          const SizedBox(height: 20),

          // Status messages depending on game state
          if (state.gameStatus == GameStatus.CorrectionFinished ||
              state.gameStatus == GameStatus.WaitingForNextQuestion)
            Column(
              children: [
                Text('La correction est finie!',
                    style: TextStyle(fontSize: 18, color: colorScheme.primary)),
                SizedBox(height: 5),
                Text('Les notes ont été envoyées aux joueurs.',
                    style: TextStyle(fontSize: 18, color: colorScheme.primary)),
                SizedBox(height: 5),
                Text('Vous pouvez passer à la prochaine question!',
                    style: TextStyle(fontSize: 18, color: colorScheme.primary)),
              ],
            ),

          if (state.gameStatus == GameStatus.GameFinished)
            Column(
              children: [
                Text('La partie est finie!',
                    style: TextStyle(fontSize: 18, color: colorScheme.primary)),
                SizedBox(height: 5),
                Text('Vous pouvez maintenant passer à la vue des résultats',
                    style: TextStyle(fontSize: 18, color: colorScheme.primary)),
              ],
            ),
        ],
      ),
    );
  }
}
