import 'package:client_leger/UI/play/widgets/organizer-controls.dart';
import 'package:client_leger/models/game_info.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ImprovedQuestionSection extends ConsumerWidget {
  const ImprovedQuestionSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(organizerProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      // No fixed height - will adapt to content
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.tertiary,
          width: 2,
        ),
      ),
      child: IntrinsicHeight(
        // This makes both sides match in height
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              flex: 75,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 22),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Points (20% of left section)
                    Expanded(
                      flex: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Points',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: colorScheme.onPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${state.currentQuestion.points}',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: colorScheme.onPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Question text (60% of left section)
                    Expanded(
                      flex: 6,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Question type indicator
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: _getQuestionTypeColor(
                                  state.currentQuestion.type, colorScheme),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              state.currentQuestion.type,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: colorScheme.onPrimary,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Question text
                          Flexible(
                            child: Text(
                              state.currentQuestion.text,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: colorScheme.onPrimary,
                              ),
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 3,
                            ),
                          ),

                          // Question image would go here if available
                          if (state.currentQuestion.image != null &&
                              state.currentQuestion.image!.isNotEmpty)
                            Flexible(
                              child: Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Image.network(
                                  state.currentQuestion.image!,
                                  height: 90, // Reduced height
                                  fit: BoxFit.contain,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),

                    // Timer (20% of left section)
                    Expanded(
                      flex: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Temps restant',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: colorScheme.onPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (state.gameStatus ==
                                  GameStatus.WaitingForNextQuestion)
                                Icon(
                                  Icons.timer,
                                  color: colorScheme.onPrimary,
                                ),
                              const SizedBox(width: 4),
                              Text(
                                '${state.gameInfo.time}',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: _getTimerColor(state),
                                ),
                              ),
                            ],
                          ),

                          // Pause indicator
                          if (state.gameModifiers.paused &&
                              state.gameStatus !=
                                  GameStatus.WaitingForNextQuestion)
                            Container(
                              margin: const EdgeInsets.only(top: 4),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: colorScheme.tertiary.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'PAUSE',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                            ),

                          // Alert mode indicator
                          if (state.gameModifiers.alertMode &&
                              state.gameStatus !=
                                  GameStatus.WaitingForNextQuestion)
                            Container(
                              margin: const EdgeInsets.only(top: 4),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.red.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'ALERTE',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Vertical divider
            Container(
              width: 2,
              margin: const EdgeInsets.symmetric(vertical: 8),
              color: colorScheme.tertiary.withOpacity(0.5),
            ),

            // Right side: Organizer controls (30% width)
            Expanded(
              flex: 25,
              child: Container(
                padding: const EdgeInsets.all(12),
                child: const OrganizerControls(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getQuestionTypeColor(String type, ColorScheme colorScheme) {
    switch (type) {
      case 'QCM':
        return Colors.blue.shade700;
      case 'QRL':
        return Colors.purple.shade700;
      case 'QRE':
        return Colors.orange.shade700;
      default:
        return colorScheme.tertiary;
    }
  }

  Color _getTimerColor(OrganizerState state) {
    if (state.gameStatus == GameStatus.WaitingForNextQuestion) {
      return Colors.blue;
    }

    if (state.gameModifiers.alertMode) {
      return Colors.red;
    }

    // Normal timer color logic
    if (state.gameInfo.time <= 10) {
      return Colors.red;
    } else if (state.gameInfo.time <= 20) {
      return Colors.orange;
    } else {
      return Colors.green;
    }
  }
}
