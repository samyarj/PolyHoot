import 'package:client_leger/models/game_info.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class OrganizerControls extends ConsumerWidget {
  const OrganizerControls({super.key});

  // Define a fixed height for the entire widget
  static const double _totalFixedHeight = 210.0;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(organizerProvider);
    final notifier = ref.read(organizerProvider.notifier);
    final colorScheme = Theme.of(context).colorScheme;

    // Standard button spacing - no need for dynamic calculation now
    const double buttonSpacing = 8.0;

    return Container(
      height: _totalFixedHeight,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Status message
          _buildStatusMessage(state, colorScheme),
          const SizedBox(height: 12.0),

          // Control buttons in a column for the narrow space
          Expanded(
            child: Container(
              width: double.infinity,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Pause/Resume button
                  _buildControlButton(
                    onPressed: state.gameStatus == GameStatus.WaitingForAnswers
                        ? () => _safelyCallMethod(() => notifier.pauseGame())
                        : null,
                    icon: state.gameModifiers.paused
                        ? Icons.play_arrow
                        : Icons.pause,
                    label: state.gameModifiers.paused ? 'Reprendre' : 'Pause',
                    color: state.gameModifiers.paused
                        ? colorScheme.secondary
                        : colorScheme.primary,
                    context: context,
                  ),
                  const SizedBox(height: buttonSpacing),

                  // Alert button
                  _buildControlButton(
                    onPressed: state.gameStatus ==
                                GameStatus.WaitingForAnswers &&
                            !state.gameModifiers.alertMode &&
                            ((state.currentQuestion.type == 'QRE' &&
                                    state.gameInfo.time > 10) ||
                                (state.currentQuestion.type == 'QCM' &&
                                    state.gameInfo.time > 10) ||
                                (state.currentQuestion.type == 'QRL' &&
                                    state.gameInfo.time > 20))
                        ? () =>
                            _safelyCallMethod(() => notifier.startAlertMode())
                        : null,
                    icon: Icons.notifications_active,
                    label: state.gameModifiers.alertMode &&
                            state.gameStatus !=
                                GameStatus.WaitingForNextQuestion
                        ? 'EN ALERTE'
                        : 'Alerte',
                    color: Colors.red.withAlpha(204), // For 0.8 opacity
                    context: context,
                  ),
                  const SizedBox(height: buttonSpacing),

                  // Next question button (always visible, sometimes disabled)
                  _buildControlButton(
                    onPressed: state.gameStatus == GameStatus.CorrectionFinished
                        ? () => notifier.nextQuestion()
                        : state.gameStatus == GameStatus.GameFinished
                            ? () => notifier.showResults()
                            : null,
                    icon: state.gameStatus == GameStatus.GameFinished
                        ? Icons.leaderboard
                        : Icons.navigate_next,
                    label: state.gameStatus == GameStatus.GameFinished
                        ? 'Résultats'
                        : 'Prochaine question',
                    color: colorScheme.secondary,
                    context: context,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusMessage(OrganizerState state, ColorScheme colorScheme) {
    String message;
    IconData icon;
    Color color;

    switch (state.gameStatus) {
      case GameStatus.WaitingForAnswers:
        message = 'En attente des réponses';
        icon = Icons.hourglass_empty;
        color = Colors.orange;
        break;
      case GameStatus.OrganizerCorrecting:
        message = 'Correction en cours';
        icon = Icons.edit;
        color = Colors.blue;
        break;
      case GameStatus.CorrectionFinished:
        message = 'Correction terminée';
        icon = Icons.check_circle;
        color = Colors.green;
        break;
      case GameStatus.WaitingForNextQuestion:
        message = 'Prochaine question: ${state.gameInfo.time}s';
        icon = Icons.timer;
        color = Colors.blue;
        break;
      case GameStatus.GameFinished:
        message = 'Partie terminée';
        icon = Icons.emoji_events;
        color = Colors.purple;
        break;
      default:
        message = 'Statut inconnu';
        icon = Icons.help;
        color = Colors.grey;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  message,
                  style: TextStyle(
                    color: colorScheme.onPrimary,
                    fontWeight: FontWeight.w500,
                    fontSize: 12,
                  ),
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 2,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required VoidCallback? onPressed,
    required IconData icon,
    required String label,
    required Color color,
    required BuildContext context,
  }) {
    final colorScheme = Theme.of(context).colorScheme;
    final isEnabled = onPressed != null;

    return Container(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(
          icon,
          color: isEnabled
              ? colorScheme.onSecondary
              : colorScheme.onSecondary.withOpacity(0.5),
          size: 16,
        ),
        label: Text(
          label,
          style: TextStyle(
            color: isEnabled
                ? colorScheme.onSecondary
                : colorScheme.onSecondary.withOpacity(0.5),
            fontSize: 13,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: isEnabled ? color : color.withOpacity(0.3),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }

  // Safely call any method that might throw an exception
  void _safelyCallMethod(Function methodToCall) {
    try {
      methodToCall();
    } catch (e) {
      AppLogger.e("Error calling method: $e");
    }
  }
}
