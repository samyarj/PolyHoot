import 'package:client_leger/UI/play/widgets/leave_game_button.dart';
import 'package:client_leger/UI/play/widgets/player-section.dart';
import 'package:client_leger/UI/play/widgets/question_content.dart';
import 'package:client_leger/UI/play/widgets/question_section.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ImprovedGameArea extends ConsumerWidget {
  const ImprovedGameArea({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(organizerProvider.notifier);

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // First row: Question section (points, question text, timer)
            ImprovedQuestionSection(),
            const SizedBox(height: 16),

            // Second row: Main content area with two panels side by side
            Container(
              height: 300, // Reduced from 400 to match your screenshot better
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left panel: Player list (40% width)
                  Expanded(
                    flex: 45,
                    child: PlayerSection(),
                  ),
                  const SizedBox(width: 16),

                  // Right panel: Question content and organizer controls (60% width)
                  Expanded(
                    flex: 55,
                    child: QuestionContentSection(),
                  ),
                ],
              ),
            ),

            // Third row: Leave game button
            const SizedBox(height: 16),
            LeaveGameButton(
              text: 'Abandonner',
              onPressed: () async {
                final shouldAbandon =
                    await _showAbandonConfirmationDialog(context);
                if (shouldAbandon) {
                  notifier.abandonGame();
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                }
              },
              fontSize: 18,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            ),
          ],
        ),
      ),
    );
  }

  Future<bool> _showAbandonConfirmationDialog(BuildContext context) async {
    final colorScheme = Theme.of(context).colorScheme;

    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: colorScheme.surface,
            title: Text("Abandonner la partie ?",
                style: TextStyle(color: colorScheme.onPrimary)),
            content: Text("Êtes-vous sûr de vouloir abandonner cette partie ?",
                style: TextStyle(color: colorScheme.onPrimary)),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: Text("Annuler",
                    style: TextStyle(color: colorScheme.onPrimary)),
              ),
              TextButton(
                onPressed: () {
                  WebSocketManager.instance.isPlaying = false;
                  Navigator.pop(context, true);
                },
                child: Text("Abandonner",
                    style: TextStyle(color: colorScheme.onPrimary)),
              ),
            ],
          ),
        ) ??
        false;
  }
}
