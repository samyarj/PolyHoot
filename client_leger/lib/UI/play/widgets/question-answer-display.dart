import 'package:client_leger/UI/play/widgets/qcm-answer-display.dart';
import 'package:client_leger/UI/play/widgets/qre-answer-display.dart';
import 'package:client_leger/UI/play/widgets/qrl_correction_panel.dart';
import 'package:client_leger/models/game_info.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class QuestionAnswerDisplay extends ConsumerWidget {
  const QuestionAnswerDisplay({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(organizerProvider);
    final notifier = ref.read(organizerProvider.notifier);
    final colorScheme = Theme.of(context).colorScheme;

    // Use LayoutBuilder to get available constraints
    return LayoutBuilder(builder: (context, constraints) {
      // Ensure the content fits within available space
      return Container(
        constraints: BoxConstraints(
          maxHeight: constraints.maxHeight,
          maxWidth: constraints.maxWidth,
        ),
        child: _buildContent(state, notifier, colorScheme),
      );
    });
  }

  Widget _buildContent(OrganizerState state, OrganizerNotifier notifier,
      ColorScheme colorScheme) {
    // Choose the correct display based on question type and game status
    switch (state.currentQuestion.type) {
      case 'QCM':
        return QCMAnswerDisplay(state: state);

      case 'QRE':
        return QREAnswerDisplay(state: state);

      case 'QRL':
        // For QRL questions, we need to show different UI based on game status
        if (state.gameStatus == GameStatus.OrganizerCorrecting) {
          return ImprovedQRLCorrectionPanel(state: state, notifier: notifier);
        } else {
          // Show a status message for other states
          return _buildStatusMessage(state, colorScheme);
        }

      default:
        return Center(
          child: Text(
            'Type de question non pris en charge',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
        );
    }
  }

  Widget _buildStatusMessage(OrganizerState state, ColorScheme colorScheme) {
    // Different messages based on game status
    String message;
    IconData icon;

    if (state.gameStatus == GameStatus.WaitingForAnswers) {
      message = 'En attente des réponses QRL des joueurs...';
      icon = Icons.hourglass_empty;
    } else if (state.gameStatus == GameStatus.CorrectionFinished ||
        state.gameStatus == GameStatus.WaitingForNextQuestion) {
      message = 'Correction des QRL terminée! Les points ont été attribués.';
      icon = Icons.check_circle;
    } else if (state.gameStatus == GameStatus.GameFinished) {
      message = 'Partie terminée! Prêt pour afficher les résultats.';
      icon = Icons.emoji_events;
    } else {
      message = 'Statut de jeu non reconnu';
      icon = Icons.help_outline;
    }

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 36,
            color: colorScheme.onPrimary.withOpacity(0.7),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: TextStyle(
              fontSize: 14,
              color: colorScheme.onPrimary,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),

          // Show additional status info for QRL
          if (state.currentQuestion.type == 'QRL' &&
              state.pointsAfterCorrection.isNotEmpty &&
              (state.gameStatus == GameStatus.CorrectionFinished ||
                  state.gameStatus == GameStatus.WaitingForNextQuestion ||
                  state.gameStatus == GameStatus.GameFinished))
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                '${state.pointsAfterCorrection.length} réponses ont été corrigées',
                style: TextStyle(
                  fontSize: 12,
                  color: colorScheme.onPrimary.withOpacity(0.8),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
