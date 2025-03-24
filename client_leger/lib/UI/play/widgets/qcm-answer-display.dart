import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';

class QCMAnswerDisplay extends StatelessWidget {
  final OrganizerState state;

  const QCMAnswerDisplay({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Get answer choices from the current question
    final choices = state.currentQuestion.choices ?? [];
    if (choices.isEmpty) {
      return Center(
        child: Text(
          'Aucune option disponible pour cette question',
          style: TextStyle(color: colorScheme.onPrimary),
        ),
      );
    }

    return LayoutBuilder(builder: (context, constraints) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title - "Choix de réponses" - take minimal height
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
            decoration: BoxDecoration(
              color: colorScheme.tertiary.withOpacity(0.5),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                  color: colorScheme.tertiary.withValues(alpha: 0.8)),
            ),
            child: Text(
              'Solution des choix de réponses',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: colorScheme.onPrimary,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
          ),

          const SizedBox(height: 8),

          // 2x2 grid for answers - take remaining space
          Expanded(
            child: _buildAnswerGrid(choices, colorScheme, constraints),
          ),
        ],
      );
    });
  }

  Widget _buildAnswerGrid(List<dynamic> choices, ColorScheme colorScheme,
      BoxConstraints constraints) {
    // Calculate the optimal size for each grid cell based on available space
    final availableHeight =
        constraints.maxHeight - 60; // Subtract header and padding
    final itemHeight = availableHeight / 2; // We want 2 rows

    // Create a grid of 2x2 = 4 cells
    final gridCells = List.generate(4, (index) {
      // If index is beyond the choices length, return an empty cell with grey background
      if (index >= choices.length) {
        return _buildEmptyCell(colorScheme);
      }

      // Otherwise, return a cell with the choice
      final choice = choices[index];
      final isCorrect = choice.isCorrect == true;

      return _buildAnswerCell(choice.text, isCorrect, colorScheme);
    });

    return GridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: (constraints.maxWidth / 2 - 8) /
          itemHeight, // Adjust aspect ratio to fit height
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: gridCells,
    );
  }

  Widget _buildAnswerCell(
      String text, bool isCorrect, ColorScheme colorScheme) {
    final backgroundColor = isCorrect
        ? const Color.fromRGBO(76, 175, 80, 0.85)
        : const Color.fromRGBO(244, 67, 54, 0.85);

    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min, // Take minimum space needed
        children: [
          // Icon
          Icon(
            isCorrect ? Icons.check : Icons.close,
            color: Colors.white,
            size: 20,
          ),
          const SizedBox(height: 4),
          // Text
          Flexible(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Text(
                text,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.normal,
                  fontSize: 12,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyCell(ColorScheme colorScheme) {
    return Container(
      decoration: BoxDecoration(
        color:
            const Color.fromRGBO(50, 50, 50, 0.7), // Dark grey for empty cells
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
