import 'package:client_leger/models/game_info.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Question header with timer and points
class QuestionSection extends ConsumerWidget {
  const QuestionSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(organizerProvider);
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Points display
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Points',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.primary),
                  ),
                  Text(
                    '${state.currentQuestion.points}',
                    style: TextStyle(fontSize: 18, color: colorScheme.primary),
                  ),
                ],
              ),

              // Question text
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    state.currentQuestion.text,
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: colorScheme.primary),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),

              // Timer display
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Temps Restant',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.primary),
                  ),
                  if (state.gameStatus != GameStatus.WaitingForNextQuestion)
                    Text(
                      '${state.gameInfo.time}',
                      style:
                          TextStyle(fontSize: 18, color: colorScheme.primary),
                    ),
                  if (state.gameModifiers.paused &&
                      state.gameStatus != GameStatus.WaitingForNextQuestion)
                    Text(
                      'PAUSE',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: colorScheme.primary),
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
