import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';

class ImprovedQRLCorrectionPanel extends StatelessWidget {
  final OrganizerState state;
  final OrganizerNotifier notifier;

  const ImprovedQRLCorrectionPanel({
    super.key,
    required this.state,
    required this.notifier,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // No answers to correct
    if (state.answersQRL.isEmpty) {
      return Center(
        child: Text(
          'Aucune réponse à corriger',
          style: TextStyle(
            fontSize: 18,
            color: colorScheme.onPrimary,
          ),
        ),
      );
    }

    // Get current answer
    final currentAnswerIndex = state.gameInfo.currentIndex;
    if (currentAnswerIndex >= state.answersQRL.length) {
      return Center(
        child: Text(
          'Toutes les réponses ont été corrigées',
          style: TextStyle(
            fontSize: 18,
            color: colorScheme.onPrimary,
          ),
        ),
      );
    }

    final currentAnswer = state.answersQRL[currentAnswerIndex];

    return LayoutBuilder(builder: (context, constraints) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Title container
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
              decoration: BoxDecoration(
                color: colorScheme.tertiary.withOpacity(0.5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                    color: colorScheme.tertiary.withValues(alpha: 0.8)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Correction de réponses (QRL)',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onPrimary,
                    ),
                  ),
                  Text(
                    '${currentAnswerIndex + 1}/${state.answersQRL.length}',
                    style: TextStyle(
                      fontSize: 14,
                      color: colorScheme.onPrimary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 6),

            // Progress indicator
            LinearProgressIndicator(
              value: (currentAnswerIndex + 1) / state.answersQRL.length,
              backgroundColor: colorScheme.primary.withOpacity(0.2),
              color: colorScheme.tertiary,
            ),

            const SizedBox(height: 8),

            // Player name
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: colorScheme.tertiary.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Réponse de ${currentAnswer.playerName}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onPrimary,
                ),
              ),
            ),

            const SizedBox(height: 8),

            // Answer display area (take most of the space)
            Expanded(
              flex: 3,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: currentAnswer.playerAnswer.isEmpty
                      ? Colors.yellow.withOpacity(0.1)
                      : colorScheme.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: currentAnswer.playerAnswer.isEmpty
                          ? Colors.yellow.withOpacity(0.5)
                          : colorScheme.tertiary.withOpacity(0.3)),
                ),
                child: SingleChildScrollView(
                  child: currentAnswer.playerAnswer.isEmpty
                      ? Center(
                          child: Text(
                            'Aucune réponse',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.yellow.shade800,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        )
                      : Text(
                          currentAnswer.playerAnswer,
                          style: TextStyle(
                            fontSize: 14,
                            color: colorScheme.onPrimary,
                          ),
                        ),
                ),
              ),
            ),

            const SizedBox(height: 8),

            // Grading section
            Container(
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              decoration: BoxDecoration(
                color: colorScheme.surface.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Évaluation',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Grading buttons in a row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildGradeButton(
                        onPressed: () => notifier.gradeAnswer(0),
                        grade: '0%',
                        label: 'Incorrect',
                        color: Colors.red,
                        colorScheme: colorScheme,
                      ),
                      _buildGradeButton(
                        onPressed: () => notifier.gradeAnswer(50),
                        grade: '50%',
                        label: 'Partiel',
                        color: Colors.amber,
                        colorScheme: colorScheme,
                      ),
                      _buildGradeButton(
                        onPressed: () => notifier.gradeAnswer(100),
                        grade: '100%',
                        label: 'Parfait',
                        color: Colors.green,
                        colorScheme: colorScheme,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildGradeButton({
    required VoidCallback onPressed,
    required String grade,
    required String label,
    required Color color,
    required ColorScheme colorScheme,
  }) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            grade,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: colorScheme.surface,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: colorScheme.surface,
            ),
          ),
        ],
      ),
    );
  }
}
