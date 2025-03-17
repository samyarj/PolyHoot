import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';

// QRL correction panel
class QRLCorrectionPanel extends StatelessWidget {
  final OrganizerState state;
  final OrganizerNotifier notifier;

  const QRLCorrectionPanel(
      {super.key, required this.state, required this.notifier});

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

          // Player name
          Text(
            state.gameInfo.currentIndex < state.answersQRL.length
                ? state.answersQRL[state.gameInfo.currentIndex].playerName
                : "",
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: colorScheme.primary),
          ),
          const SizedBox(height: 10),
          Text(
            'Réponse:',
            style: TextStyle(fontSize: 15, color: colorScheme.primary),
          ),
          const SizedBox(height: 5),

          // Answer display
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
              style: TextStyle(fontSize: 16, color: colorScheme.primary),
            ),
          ),
          const SizedBox(height: 20),

          // Grading buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton(
                onPressed: () => notifier.gradeAnswer(0),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red[400],
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child:
                    Text('0 %', style: TextStyle(color: colorScheme.primary)),
              ),
              ElevatedButton(
                onPressed: () => notifier.gradeAnswer(50),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber,
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child:
                    Text('50 %', style: TextStyle(color: colorScheme.primary)),
              ),
              ElevatedButton(
                onPressed: () => notifier.gradeAnswer(100),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child:
                    Text('100 %', style: TextStyle(color: colorScheme.primary)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
