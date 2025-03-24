import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/models/game-related/partial_player.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum SortField { name, points, status }

enum SortOrder { ascending, descending }

class ImprovedPlayerList extends ConsumerStatefulWidget {
  const ImprovedPlayerList({super.key});

  @override
  ConsumerState<ImprovedPlayerList> createState() => _ImprovedPlayerListState();
}

class _ImprovedPlayerListState extends ConsumerState<ImprovedPlayerList> {
  SortField _sortField = SortField.name;
  SortOrder _sortOrder = SortOrder.ascending;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final playerList = ref.watch(organizerProvider).playerList;

    // Create a copy of the player list for sorting
    final sortedPlayers = _sortPlayers(List.from(playerList));

    return Column(
      children: [
        // Sorting controls (20% height)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Sort field selector
              DropdownButton<SortField>(
                value: _sortField,
                dropdownColor: colorScheme.primary,
                style: TextStyle(color: colorScheme.onPrimary),
                underline: Container(
                  height: 2,
                  color: colorScheme.tertiary,
                ),
                onChanged: (SortField? newValue) {
                  if (newValue != null) {
                    setState(() {
                      _sortField = newValue;
                    });
                  }
                },
                items: <SortField>[
                  SortField.name,
                  SortField.points,
                  SortField.status
                ].map<DropdownMenuItem<SortField>>((SortField value) {
                  return DropdownMenuItem<SortField>(
                    value: value,
                    child: Text(_getSortFieldName(value)),
                  );
                }).toList(),
              ),

              // Two separate buttons for sort order
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Ascending button
                  IconButton(
                    icon: Icon(
                      Icons.arrow_upward,
                      color: _sortOrder == SortOrder.ascending
                          ? colorScheme.tertiary
                          : colorScheme.onPrimary.withOpacity(0.6),
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() {
                        _sortOrder = SortOrder.ascending;
                      });
                    },
                    tooltip: 'Croissant',
                    padding: EdgeInsets.zero,
                    constraints: BoxConstraints(minWidth: 36, minHeight: 36),
                  ),

                  // Descending button
                  IconButton(
                    icon: Icon(
                      Icons.arrow_downward,
                      color: _sortOrder == SortOrder.descending
                          ? colorScheme.tertiary
                          : colorScheme.onPrimary.withOpacity(0.6),
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() {
                        _sortOrder = SortOrder.descending;
                      });
                    },
                    tooltip: 'Décroissant',
                    padding: EdgeInsets.zero,
                    constraints: BoxConstraints(minWidth: 36, minHeight: 36),
                  ),
                ],
              ),
            ],
          ),
        ),

        // List headers
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
          child: Row(
            children: [
              // Avatar space
              SizedBox(width: 40),

              // Name column
              Expanded(
                flex: 5,
                child: Text(
                  'Nom',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: colorScheme.onPrimary,
                  ),
                ),
              ),

              // Points column
              Expanded(
                flex: 3,
                child: Text(
                  'Points',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: colorScheme.onPrimary,
                  ),
                ),
              ),

              // Status column
              Expanded(
                flex: 2,
                child: Text(
                  'Statut',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: colorScheme.onPrimary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),

        // Divider
        Divider(
          color: colorScheme.tertiary.withOpacity(0.3),
          thickness: 1,
          height: 8,
        ),

        // Player list (80% height)
        Expanded(
          child: ListView.builder(
            itemCount: sortedPlayers.length,
            padding: EdgeInsets.zero,
            itemBuilder: (context, index) {
              final player = sortedPlayers[index];
              return _buildPlayerListItem(player, colorScheme, index);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPlayerListItem(
      PartialPlayer player, ColorScheme colorScheme, int index) {
    final isEvenRow = index % 2 == 0;

    return Container(
      color:
          isEvenRow ? colorScheme.primary.withOpacity(0.3) : Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            // Avatar with online status
            Stack(
              children: [
                AvatarBannerWidget(
                  avatarUrl: player.avatarEquipped,
                  bannerUrl: player.bannerEquipped,
                  size: 32,
                  avatarFit: BoxFit.cover,
                ),
                if (player.isInGame)
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: colorScheme.surface,
                          width: 1.5,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 8),

            // Name column
            Expanded(
              flex: 5,
              child: Text(
                player.name,
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                  color: colorScheme.onPrimary,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),

            // Points column
            Expanded(
              flex: 3,
              child: Text(
                player.points.toStringAsFixed(1),
                style: TextStyle(
                  color: colorScheme.onPrimary,
                ),
              ),
            ),

            // Status column (in game + submitted status)
            Expanded(
              flex: 2,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Show submission status icon
                  Icon(
                    player.submitted
                        ? Icons.check_circle
                        : Icons.hourglass_empty,
                    color: player.submitted ? Colors.green : Colors.orange,
                    size: 20,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<PartialPlayer> _sortPlayers(List<PartialPlayer> players) {
    // First sort by activity (in game vs not in game)
    players
        .sort((a, b) => a.isInGame == b.isInGame ? 0 : (a.isInGame ? -1 : 1));

    // Then apply user-selected sorting
    switch (_sortField) {
      case SortField.name:
        players.sort((a, b) {
          final comparison =
              a.name.toLowerCase().compareTo(b.name.toLowerCase());
          return _sortOrder == SortOrder.ascending ? comparison : -comparison;
        });
        break;
      case SortField.points:
        players.sort((a, b) {
          final comparison = a.points.compareTo(b.points);
          return _sortOrder == SortOrder.ascending ? comparison : -comparison;
        });
        break;
      case SortField.status:
        players.sort((a, b) {
          // Sort by submission status
          final comparison =
              a.submitted == b.submitted ? 0 : (a.submitted ? -1 : 1);
          return _sortOrder == SortOrder.ascending ? comparison : -comparison;
        });
        break;
    }

    return players;
  }

  String _getSortFieldName(SortField field) {
    switch (field) {
      case SortField.name:
        return 'Nom';
      case SortField.points:
        return 'Points';
      case SortField.status:
        return 'Statut';
    }
  }
}
