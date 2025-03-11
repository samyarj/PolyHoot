import 'package:client_leger/models/game-related/partial_player.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum SortField { name, points }

enum SortOrder { ascending, descending }

class SortablePlayerList extends ConsumerStatefulWidget {
  const SortablePlayerList({super.key});

  @override
  ConsumerState<SortablePlayerList> createState() => _SortablePlayerListState();
}

class _SortablePlayerListState extends ConsumerState<SortablePlayerList> {
  SortField _sortField = SortField.name;
  SortOrder _sortOrder = SortOrder.ascending;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final playerList = ref.watch(organizerProvider).playerList;

    // Create a copy of the player list for sorting
    final sortedPlayers = _sortPlayers(List.from(playerList));

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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Joueurs',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: colorScheme.primary,
                ),
              ),
              _buildSortControls(context, colorScheme),
            ],
          ),
          const SizedBox(height: 8),
          _buildSortingHeader(colorScheme),
          const SizedBox(height: 4),
          SizedBox(
            height: 150,
            child: ListView.builder(
              itemCount: sortedPlayers.length,
              itemBuilder: (context, index) {
                final player = sortedPlayers[index];
                return ListTile(
                  dense: true,
                  title: Text(
                    player.name,
                    style: TextStyle(color: colorScheme.primary),
                  ),
                  subtitle: Text(
                    'Points: ${player.points.toStringAsFixed(1)}',
                    style: TextStyle(color: colorScheme.primary),
                  ),
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

  Widget _buildSortControls(BuildContext context, ColorScheme colorScheme) {
    return PopupMenuButton<Map<String, dynamic>>(
      icon: Icon(
        Icons.sort,
        color: colorScheme.primary,
      ),
      tooltip: 'Trier la liste',
      onSelected: (Map<String, dynamic> result) {
        setState(() {
          _sortField = result['field'];
          _sortOrder = result['order'];
        });
      },
      itemBuilder: (BuildContext context) =>
          <PopupMenuEntry<Map<String, dynamic>>>[
        PopupMenuItem<Map<String, dynamic>>(
          value: {'field': SortField.name, 'order': SortOrder.ascending},
          child: Row(
            children: [
              Icon(
                Icons.arrow_upward,
                color: _isSelected(SortField.name, SortOrder.ascending)
                    ? colorScheme.primary
                    : Colors.grey,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Nom (A-Z)',
                style: TextStyle(color: colorScheme.primary),
              ),
            ],
          ),
        ),
        PopupMenuItem<Map<String, dynamic>>(
          value: {'field': SortField.name, 'order': SortOrder.descending},
          child: Row(
            children: [
              Icon(
                Icons.arrow_downward,
                color: _isSelected(SortField.name, SortOrder.descending)
                    ? colorScheme.primary
                    : Colors.grey,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Nom (Z-A)',
                style: TextStyle(color: colorScheme.primary),
              ),
            ],
          ),
        ),
        const PopupMenuDivider(),
        PopupMenuItem<Map<String, dynamic>>(
          value: {'field': SortField.points, 'order': SortOrder.descending},
          child: Row(
            children: [
              Icon(
                Icons.arrow_downward,
                color: _isSelected(SortField.points, SortOrder.descending)
                    ? colorScheme.primary
                    : Colors.grey,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Points (Élevé-Bas)',
                style: TextStyle(color: colorScheme.primary),
              ),
            ],
          ),
        ),
        PopupMenuItem<Map<String, dynamic>>(
          value: {'field': SortField.points, 'order': SortOrder.ascending},
          child: Row(
            children: [
              Icon(
                Icons.arrow_upward,
                color: _isSelected(SortField.points, SortOrder.ascending)
                    ? colorScheme.primary
                    : Colors.grey,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Points (Bas-Élevé)',
                style: TextStyle(color: colorScheme.primary),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSortingHeader(ColorScheme colorScheme) {
    return Row(
      children: [
        const SizedBox(width: 40), // Space for leading icon
        Expanded(
          child: Row(
            children: [
              Text(
                'Nom',
                style: TextStyle(
                  fontWeight: _sortField == SortField.name
                      ? FontWeight.bold
                      : FontWeight.normal,
                  fontSize: 12,
                  color: colorScheme.primary,
                ),
              ),
              if (_sortField == SortField.name)
                Icon(
                  _sortOrder == SortOrder.ascending
                      ? Icons.arrow_upward
                      : Icons.arrow_downward,
                  size: 14,
                  color: colorScheme.primary,
                ),
            ],
          ),
        ),
        Expanded(
          child: Row(
            children: [
              Text(
                'Points',
                style: TextStyle(
                  fontWeight: _sortField == SortField.points
                      ? FontWeight.bold
                      : FontWeight.normal,
                  fontSize: 12,
                  color: colorScheme.primary,
                ),
              ),
              if (_sortField == SortField.points)
                Icon(
                  _sortOrder == SortOrder.ascending
                      ? Icons.arrow_upward
                      : Icons.arrow_downward,
                  size: 14,
                  color: colorScheme.primary,
                ),
            ],
          ),
        ),
        const SizedBox(width: 40), // Space for trailing icon
      ],
    );
  }

  bool _isSelected(SortField field, SortOrder order) {
    return _sortField == field && _sortOrder == order;
  }

  List<PartialPlayer> _sortPlayers(List<PartialPlayer> players) {
    // First sort by activity (in game vs not in game)
    players.sort((a, b) => b.isInGame ? 1 : -1);

    // Then apply user-selected sorting
    if (_sortField == SortField.name) {
      players.sort((a, b) {
        final comparison = a.name.toLowerCase().compareTo(b.name.toLowerCase());
        return _sortOrder == SortOrder.ascending ? comparison : -comparison;
      });
    } else {
      players.sort((a, b) {
        final comparison = a.points.compareTo(b.points);
        return _sortOrder == SortOrder.ascending ? comparison : -comparison;
      });
    }

    return players;
  }
}
