import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Abandon button widget
class AbandonButton extends ConsumerWidget {
  const AbandonButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(organizerProvider.notifier);
    final colorScheme = Theme.of(context).colorScheme;
    return ElevatedButton(
      onPressed: () async {
        final shouldAbandon = await _showAbandonConfirmationDialog(context);
        if (shouldAbandon) {
          notifier.abandonGame();
          context.go(Paths.play);
        }
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
      child: Text('Abandonner', style: TextStyle(color: colorScheme.primary)),
    );
  }

  Future<bool> _showAbandonConfirmationDialog(BuildContext context) async {
    final colorScheme = Theme.of(context).colorScheme;

    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text("Abandonner la partie ?",
                style: TextStyle(color: colorScheme.primary)),
            content: Text("Êtes-vous sûr de vouloir abandonner cette partie ?",
                style: TextStyle(color: colorScheme.primary)),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: Text("Annuler",
                    style: TextStyle(color: colorScheme.primary)),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: Text("Abandonner",
                    style: TextStyle(color: colorScheme.primary)),
              ),
            ],
          ),
        ) ??
        false;
  }
}
