import 'package:client_leger/UI/play/widgets/qrl_correction_panel.dart';
import 'package:client_leger/UI/play/widgets/qrl_status_panel.dart';
import 'package:client_leger/models/game_info.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Content specific to question type
class QuestionContent extends ConsumerWidget {
  const QuestionContent({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;

    final state = ref.watch(organizerProvider);
    final notifier = ref.read(organizerProvider.notifier);
    // QRL questions - waiting for answers
    if (state.currentQuestion.type == 'QRL' &&
        state.gameStatus == GameStatus.WaitingForAnswers) {
      return _buildInfoContainer(
        Center(
          child: Text(
            'En attente des réponses des joueurs',
            style: TextStyle(fontSize: 18, color: colorScheme.primary),
          ),
        ),
      );
    }

    // QRL questions - correction mode
    if (state.currentQuestion.type == 'QRL' &&
        state.gameStatus == GameStatus.OrganizerCorrecting) {
      return QRLCorrectionPanel(state: state, notifier: notifier);
    }

    // QRL questions - correction finished or waiting for next question
    if (state.currentQuestion.type == 'QRL' &&
        (state.gameStatus == GameStatus.CorrectionFinished ||
            state.gameStatus == GameStatus.WaitingForNextQuestion ||
            state.gameStatus == GameStatus.GameFinished)) {
      return QRLStatusPanel(state: state);
    }

    // Default for QCM and other question types
    return _buildInfoContainer(
      Center(
        child: Text(
          'Vue de la question',
          style: TextStyle(fontSize: 18, color: colorScheme.primary),
        ),
      ),
    );
  }

  Widget _buildInfoContainer(Widget child) {
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
      child: child,
    );
  }
}
