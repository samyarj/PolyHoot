import 'package:client_leger/UI/play/widgets/player_list.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PlayerSection extends ConsumerWidget {
  const PlayerSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.tertiary,
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              'Joueurs',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: colorScheme.onPrimary,
              ),
            ),
          ),

          // Divider
          Divider(
            color: colorScheme.tertiary.withOpacity(0.3),
            thickness: 1,
          ),

          // Player list (takes remaining space)
          Expanded(
            child: ImprovedPlayerList(),
          ),
        ],
      ),
    );
  }
}
