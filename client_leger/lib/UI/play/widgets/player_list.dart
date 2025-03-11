import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Player list widget
class PlayerList extends ConsumerWidget {
  const PlayerList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;
    final playerList = ref.watch(organizerProvider).playerList;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Joueurs',
            style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: colorScheme.primary),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 150,
            child: ListView.builder(
              itemCount: playerList.length,
              itemBuilder: (context, index) {
                final player = playerList[index];
                return ListTile(
                  dense: true,
                  title: Text(player.name,
                      style: TextStyle(color: colorScheme.primary)),
                  subtitle: Text('Points: ${player.points.toStringAsFixed(1)}',
                      style: TextStyle(color: colorScheme.primary)),
                  leading: Icon(
                    Icons.person,
                    color: player.isInGame ? Colors.green : Colors.red,
                  ),
                  trailing: player.submitted
                      ? const Icon(Icons.check_circle, color: Colors.green)
                      : const Icon(Icons.hourglass_empty, color: Colors.orange),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
