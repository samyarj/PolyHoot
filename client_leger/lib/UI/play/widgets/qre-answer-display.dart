import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';

class QREAnswerDisplay extends StatelessWidget {
  final OrganizerState state;

  const QREAnswerDisplay({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final qreAttributes = state.currentQuestion.qreAttributes;

    // Get the answer from QRE attributes
    final goodAnswer = qreAttributes?.goodAnswer.toString() ?? "N/A";

    return LayoutBuilder(builder: (context, constraints) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
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
              child: Text(
                'Bonnes réponses estimées',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onPrimary,
                  fontSize: 16,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            const SizedBox(height: 8),

            // Correct answer display
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
              decoration: BoxDecoration(
                color: colorScheme.surface.withOpacity(0.3),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  'Réponse exacte: $goodAnswer',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onPrimary,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 8),

            // Tolerance range info
            if (qreAttributes != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                decoration: BoxDecoration(
                  color: colorScheme.surface.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: colorScheme.tertiary.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildRangeItem(
                        'Min', '${qreAttributes.minBound}', colorScheme),
                    _buildRangeItem(
                        'Max', '${qreAttributes.maxBound}', colorScheme),
                    _buildRangeItem('Tolérance', '±${qreAttributes.tolerance}',
                        colorScheme),
                  ],
                ),
              ),

            const SizedBox(height: 80),
          ],
        ),
      );
    });
  }

  Widget _buildRangeItem(String label, String value, ColorScheme colorScheme) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 12,
            color: colorScheme.onPrimary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            color: colorScheme.onPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildPointButton(String value, ColorScheme colorScheme) {
    return Container(
      width: 65,
      height: 40,
      decoration: BoxDecoration(
        color: colorScheme.primary,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Center(
        child: Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: colorScheme.onPrimary,
          ),
        ),
      ),
    );
  }
}
