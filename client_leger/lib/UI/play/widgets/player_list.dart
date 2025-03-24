import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/models/game-related/partial_player.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum SortField { name, points }

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

    return LayoutBuilder(
      builder: (context, constraints) {
        // Check if we have a very tight constraint
        final isVeryConstrained = constraints.maxHeight < 100;

        // If extremely constrained, show minimal UI
        if (isVeryConstrained) {
          return Center(
            child: Text(
              '${sortedPlayers.length} joueurs',
              style: TextStyle(color: colorScheme.onPrimary),
            ),
          );
        }

        // Adjust heights based on available space
        final double headerHeight = constraints.maxHeight * 0.15;
        final double dividerHeight = 4;

        return Column(
          children: [
            // Sorting controls - compact for small spaces
            Container(
              height: headerHeight,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Sort field selector
                  DropdownButton<SortField>(
                    value: _sortField,
                    dropdownColor: colorScheme.primary,
                    style: TextStyle(color: colorScheme.onPrimary),
                    isDense: true, // More compact dropdown
                    iconSize: 18, // Smaller icon
                    underline: Container(
                      height: 1,
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
                    ].map<DropdownMenuItem<SortField>>((SortField value) {
                      return DropdownMenuItem<SortField>(
                        value: value,
                        child: Text(_getSortFieldName(value)),
                      );
                    }).toList(),
                  ),

                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Compact sort direction buttons
                      IconButton(
                        icon: Icon(
                          Icons.arrow_upward,
                          color: _sortOrder == SortOrder.ascending
                              ? colorScheme.tertiary
                              : colorScheme.onPrimary.withOpacity(0.6),
                          size: 16, // Smaller icon size
                        ),
                        onPressed: () {
                          setState(() {
                            _sortOrder = SortOrder.ascending;
                          });
                        },
                        tooltip: 'Croissant',
                        padding: EdgeInsets.zero,
                        constraints:
                            BoxConstraints(minWidth: 28, minHeight: 28),
                      ),
                      IconButton(
                        icon: Icon(
                          Icons.arrow_downward,
                          color: _sortOrder == SortOrder.descending
                              ? colorScheme.tertiary
                              : colorScheme.onPrimary.withOpacity(0.6),
                          size: 16, // Smaller icon size
                        ),
                        onPressed: () {
                          setState(() {
                            _sortOrder = SortOrder.descending;
                          });
                        },
                        tooltip: 'Décroissant',
                        padding: EdgeInsets.zero,
                        constraints:
                            BoxConstraints(minWidth: 28, minHeight: 28),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // List headers with minimal height
            Container(
              height: headerHeight,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
              child: Row(
                children: [
                  // Avatar space
                  SizedBox(width: 32), // Smaller width for avatar space

                  // Name column
                  Expanded(
                    flex: 6,
                    child: Text(
                      'Nom',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12, // Smaller text
                        color: colorScheme.onPrimary,
                      ),
                    ),
                  ),

                  // Points column
                  Expanded(
                    flex: 4,
                    child: Text(
                      'Points',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12, // Smaller text
                        color: colorScheme.onPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Minimal divider
            Container(
              height: dividerHeight,
              child: Divider(
                color: colorScheme.tertiary.withOpacity(0.3),
                thickness: 1,
                height: dividerHeight,
              ),
            ),

            // Player list using remaining space
            Expanded(
              child: sortedPlayers.isEmpty
                  ? Center(
                      child: Text(
                        'Aucun joueur',
                        style: TextStyle(color: colorScheme.onPrimary),
                      ),
                    )
                  : ListView.builder(
                      itemCount: sortedPlayers.length,
                      padding: EdgeInsets.zero,
                      itemExtent: 40, // Fixed height for each item
                      itemBuilder: (context, index) {
                        final player = sortedPlayers[index];
                        return _buildPlayerListItem(player, colorScheme, index);
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

// Modify your _buildPlayerListItem to be more compact
  Widget _buildPlayerListItem(
      PartialPlayer player, ColorScheme colorScheme, int index) {
    final isEvenRow = index % 2 == 0;
    final isActive = player.isInGame;

    return Container(
      height: 40, // Fixed height
      color:
          isEvenRow ? colorScheme.primary.withOpacity(0.3) : Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.symmetric(
            horizontal: 12, vertical: 4), // Reduced padding
        child: Row(
          children: [
            Stack(
              children: [
                Opacity(
                  opacity: isActive ? 1.0 : 0.5,
                  child: AvatarBannerWidget(
                    avatarUrl: player.avatarEquipped,
                    bannerUrl: player.bannerEquipped,
                    size: 28, // Smaller avatar
                    avatarFit: BoxFit.cover,
                  ),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 8, // Smaller indicator
                    height: 8, // Smaller indicator
                    decoration: BoxDecoration(
                      color: isActive ? Colors.green : Colors.grey,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: colorScheme.surface,
                        width: 1,
                      ),
                    ),
                  ),
                ),
                if (player.submitted)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      width: 8, // Smaller indicator
                      height: 8, // Smaller indicator
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: colorScheme.surface,
                          width: 1,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 6), // Reduced spacing

            // Name column - greyed out if player left
            Expanded(
              flex: 6,
              child: Text(
                player.name,
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                  fontSize: 12, // Smaller font
                  color: isActive
                      ? colorScheme.onPrimary
                      : colorScheme.onPrimary.withOpacity(0.5),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),

            // Points column
            Expanded(
              flex: 4,
              child: Text(
                player.points.toStringAsFixed(1),
                style: TextStyle(
                  fontSize: 12, // Smaller font
                  color: isActive
                      ? colorScheme.onPrimary
                      : colorScheme.onPrimary.withOpacity(0.5),
                ),
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
    }

    return players;
  }

  String _getSortFieldName(SortField field) {
    switch (field) {
      case SortField.name:
        return 'Nom';
      case SortField.points:
        return 'Points';
    }
  }
}
