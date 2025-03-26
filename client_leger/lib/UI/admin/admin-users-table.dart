import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/models/user.dart';
import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

class AdminUsersTable extends ConsumerStatefulWidget {
  final List<UserWithId> users;
  final Function(String userId, int durationInDays) onBanUser;
  final Function(String userId) onUnbanUser;

  const AdminUsersTable({
    Key? key,
    required this.users,
    required this.onBanUser,
    required this.onUnbanUser,
  }) : super(key: key);

  @override
  ConsumerState<AdminUsersTable> createState() => _AdminUsersTableState();
}

class _AdminUsersTableState extends ConsumerState<AdminUsersTable> {
  int _currentPage = 0;
  final int _rowsPerPage = 10;
  bool _sortAscending = false;
  int _sortColumnIndex = 0;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Create a sorted copy of users
    final sortedUsers = List<UserWithId>.from(widget.users);
    if (sortedUsers.isNotEmpty) {
      sortedUsers.sort((a, b) {
        switch (_sortColumnIndex) {
          case 0: // Username
            return _compareUsernames(a.user, b.user, _sortAscending);
          case 1: // Status
            return _compareOnlineStatus(a.user, b.user, _sortAscending);
          case 2: // Coins
            return _compareCoins(a.user, b.user, _sortAscending);
          case 3: // Victories
            return _compareVictories(a.user, b.user, _sortAscending);
          case 4: // Reports
            return _compareReports(a.user, b.user, _sortAscending);
          default:
            return 0;
        }
      });
    }

    // Calculate total pages
    final int totalPages = (sortedUsers.length / _rowsPerPage).ceil();

    // Ensure we have at least 1 page even if empty
    final int displayTotalPages = totalPages > 0 ? totalPages : 1;

    // Ensure current page is valid
    if (_currentPage >= totalPages && totalPages > 0) {
      _currentPage = totalPages - 1;
    }
    if (_currentPage < 0) {
      _currentPage = 0;
    }

    // Get paginated data
    final startIndex = _currentPage * _rowsPerPage;
    final endIndex = startIndex + _rowsPerPage > sortedUsers.length
        ? sortedUsers.length
        : startIndex + _rowsPerPage;

    final displayedUsers =
        sortedUsers.isEmpty ? [] : sortedUsers.sublist(startIndex, endIndex);
    final headerStyle = TextStyle(
      fontWeight: FontWeight.bold,
      color: Theme.of(context).colorScheme.tertiary,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: DataTable2(
            columnSpacing: 6,
            horizontalMargin: 7,
            minWidth: 600,
            dividerThickness: 1,
            headingRowHeight: 50,
            dataRowHeight: 75,
            headingRowColor:
                WidgetStateProperty.all(colorScheme.secondary.withOpacity(0.8)),
            dataRowColor: WidgetStateProperty.all(Colors.transparent),
            sortAscending: _sortAscending,
            sortColumnIndex: _sortColumnIndex,
            border: TableBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            columns: [
              DataColumn2(
                label: Text('JOUEUR', style: headerStyle),
                size: ColumnSize.L,
                onSort: (columnIndex, ascending) {
                  setState(() {
                    _sortColumnIndex = columnIndex;
                    _sortAscending = ascending;
                  });
                },
              ),
              DataColumn2(
                label: Center(child: Text('STATUT', style: headerStyle)),
                size: ColumnSize.M,
                onSort: (columnIndex, ascending) {
                  setState(() {
                    _sortColumnIndex = columnIndex;
                    _sortAscending = ascending;
                  });
                },
              ),
              DataColumn2(
                label: Center(child: Text('COINS', style: headerStyle)),
                size: ColumnSize.S,
                numeric: true,
                onSort: (columnIndex, ascending) {
                  setState(() {
                    _sortColumnIndex = columnIndex;
                    _sortAscending = ascending;
                  });
                },
              ),
              DataColumn2(
                label: Center(child: Text('VICTOIRES', style: headerStyle)),
                size: ColumnSize.S,
                numeric: true,
                onSort: (columnIndex, ascending) {
                  setState(() {
                    _sortColumnIndex = columnIndex;
                    _sortAscending = ascending;
                  });
                },
              ),
              DataColumn2(
                label: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text('SIGNALEMENTS', style: headerStyle),
                  ),
                ),
                size: ColumnSize.M,
                numeric: true,
                onSort: (columnIndex, ascending) {
                  setState(() {
                    _sortColumnIndex = columnIndex;
                    _sortAscending = ascending;
                  });
                },
              ),
              DataColumn2(
                label: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [Text('BANNIR', style: headerStyle)],
                ),
                size: ColumnSize.M,
              ),
            ],
            rows: displayedUsers.isEmpty
                ? List.generate(
                    7,
                    (index) => _buildEmptyRow(colorScheme),
                  )
                : displayedUsers.map((userWithId) {
                    final user = userWithId.user;
                    final isBanned = user.unBanDate != null &&
                        user.unBanDate!.toDate().isAfter(DateTime.now());

                    return DataRow2(
                      cells: [
                        DataCell(
                          Row(
                            children: [
                              AvatarBannerWidget(
                                avatarUrl: user.avatarEquipped,
                                bannerUrl: user.borderEquipped,
                                size: 50,
                              ),
                              SizedBox(width: 8),
                              Text(
                                user.username,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.onSurface,
                                ),
                              ),
                            ],
                          ),
                        ),
                        DataCell(
                          Center(
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: user.isOnline == true
                                    ? Colors.green.withOpacity(0.2)
                                    : Colors.red.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                user.isOnline == true
                                    ? 'En ligne'
                                    : 'Hors ligne',
                                style: TextStyle(
                                  color: user.isOnline == true
                                      ? Colors.green
                                      : Colors.red,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ),
                        DataCell(
                          Center(
                            child: Text(
                              '${user.coins ?? 0}',
                              style: TextStyle(
                                color: colorScheme.onSurface,
                              ),
                            ),
                          ),
                        ),
                        DataCell(
                          Center(
                            child: Text(
                              '${user.nWins ?? 0}',
                              style: TextStyle(
                                color: colorScheme.onSurface,
                              ),
                            ),
                          ),
                        ),
                        DataCell(
                          Center(
                            child: Text(
                              '${user.nbReport ?? 0}',
                              style: TextStyle(
                                color: colorScheme.onSurface,
                              ),
                            ),
                          ),
                        ),
                        DataCell(
                          Align(
                            alignment: Alignment.centerRight,
                            child: isBanned
                                ? Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Flexible(
                                        child: Text(
                                          'Banni jusqu\'au ${DateFormat('dd/MM/yyyy').format(user.unBanDate!.toDate())}',
                                          style: TextStyle(
                                            color: Colors.red,
                                            fontSize: 14,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      IconButton(
                                        icon: Icon(Icons.lock_open,
                                            color: colorScheme.secondary),
                                        onPressed: () =>
                                            widget.onUnbanUser(user.uid),
                                        tooltip: 'Débannir',
                                        constraints: BoxConstraints(
                                          minWidth: 40,
                                          minHeight: 40,
                                        ),
                                        iconSize: 26,
                                        padding: EdgeInsets.zero,
                                      ),
                                    ],
                                  )
                                : IconButton(
                                    icon: Icon(Icons.block, color: Colors.red),
                                    onPressed: () =>
                                        _showBanDialog(context, user),
                                    tooltip: 'Bannir',
                                  ),
                          ),
                        ),
                      ],
                    );
                  }).toList(),
            empty: Center(
              child: Text(
                'Aucun utilisateur disponible',
                style: TextStyle(color: colorScheme.onSurface),
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.arrow_back, color: colorScheme.onSurface),
                onPressed: _currentPage > 0
                    ? () {
                        setState(() {
                          _currentPage--;
                        });
                      }
                    : null,
                disabledColor: colorScheme.onSurface.withOpacity(0.3),
              ),
              Text(
                'Page ${_currentPage + 1} / $displayTotalPages',
                style: TextStyle(color: colorScheme.onSurface),
              ),
              IconButton(
                icon: Icon(Icons.arrow_forward, color: colorScheme.onSurface),
                onPressed: _currentPage < totalPages - 1 && totalPages > 0
                    ? () {
                        setState(() {
                          _currentPage++;
                        });
                      }
                    : null,
                disabledColor: colorScheme.onSurface.withOpacity(0.3),
              ),
            ],
          ),
        ),
      ],
    );
  }

  DataRow2 _buildEmptyRow(ColorScheme colorScheme) {
    return DataRow2(
      cells: List.generate(
        10,
        (index) => DataCell(
          Text(
            '',
            style: TextStyle(color: colorScheme.onSurface),
          ),
        ),
      ),
    );
  }

  void _showBanDialog(BuildContext context, User user) {
    final colorScheme = Theme.of(context).colorScheme;
    int selectedDuration = 15;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          backgroundColor: colorScheme.surface,
          title: Text('Bannir ${user.username}',
              style: TextStyle(color: colorScheme.onPrimary)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Choisir la durée du bannissement:',
                  style: TextStyle(color: colorScheme.onPrimary)),
              SizedBox(height: 16),
              DropdownButton<int>(
                value: selectedDuration,
                isExpanded: true,
                items: [
                  DropdownMenuItem(value: 15, child: Text('15 minutes')),
                  DropdownMenuItem(value: 60, child: Text('1 heure')),
                  DropdownMenuItem(value: 180, child: Text('3 heures')),
                  DropdownMenuItem(value: 1440, child: Text('1 jour')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      selectedDuration = value;
                    });
                  }
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              child: Text('Annuler',
                  style: TextStyle(color: colorScheme.onPrimary)),
              onPressed: () => Navigator.of(context).pop(),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: colorScheme.secondary.withValues(alpha: 0.7),
                foregroundColor: colorScheme.onSecondary,
              ),
              child: Text('Bannir',
                  style: TextStyle(color: colorScheme.onPrimary)),
              onPressed: () {
                Navigator.of(context).pop();
                widget.onBanUser(user.uid, selectedDuration);
              },
            ),
          ],
        ),
      ),
    );
  }

  int _compareUsernames(User a, User b, bool ascending) {
    return ascending
        ? a.username.compareTo(b.username)
        : b.username.compareTo(a.username);
  }

  int _compareOnlineStatus(User a, User b, bool ascending) {
    final bool aOnline = a.isOnline ?? false;
    final bool bOnline = b.isOnline ?? false;
    return ascending
        ? (aOnline == bOnline ? 0 : (aOnline ? -1 : 1))
        : (aOnline == bOnline ? 0 : (aOnline ? 1 : -1));
  }

  int _compareCoins(User a, User b, bool ascending) {
    final int aCoins = a.coins ?? 0;
    final int bCoins = b.coins ?? 0;
    return ascending ? aCoins.compareTo(bCoins) : bCoins.compareTo(aCoins);
  }

  int _compareVictories(User a, User b, bool ascending) {
    final int aVictories = a.nWins ?? 0;
    final int bVictories = b.nWins ?? 0;
    return ascending
        ? aVictories.compareTo(bVictories)
        : bVictories.compareTo(aVictories);
  }

  int _compareReports(User a, User b, bool ascending) {
    final int aReports = a.nbReport ?? 0;
    final int bReports = b.nbReport ?? 0;
    return ascending
        ? aReports.compareTo(bReports)
        : bReports.compareTo(aReports);
  }
}
