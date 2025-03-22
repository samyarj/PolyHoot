import 'package:client_leger/models/game-log-entry-model.dart';
import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';

class GameLogsTable extends StatefulWidget {
  final List<GameLogEntry> gameLogs;

  const GameLogsTable({
    Key? key,
    required this.gameLogs,
  }) : super(key: key);

  @override
  State<GameLogsTable> createState() => _GameLogsTableState();
}

class _GameLogsTableState extends State<GameLogsTable> {
  int _currentPage = 0;
  final int _rowsPerPage = 5;
  bool _sortAscending = false;
  int _sortColumnIndex = 0;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Create a sorted copy of game logs
    final sortedLogs = List<GameLogEntry>.from(widget.gameLogs);
    if (sortedLogs.isNotEmpty) {
      sortedLogs.sort((a, b) {
        switch (_sortColumnIndex) {
          case 0: // Début
            return _compareNullableStrings(
                a.startTime, b.startTime, _sortAscending);
          case 1: // Fin
            return _compareNullableStrings(
                a.endTime, b.endTime, _sortAscending);
          case 2: // Nom du jeu
            return _compareNullableStrings(
                a.gameName, b.gameName, _sortAscending);
          case 3: // Statut
            return _compareNullableStrings(a.status, b.status, _sortAscending);
          case 4: // Résultat
            return _compareNullableStrings(a.result, b.result, _sortAscending);
          default:
            return 0;
        }
      });
    }

    // Calculate total pages
    final int totalPages = (sortedLogs.length / _rowsPerPage).ceil();

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
    final endIndex = startIndex + _rowsPerPage > sortedLogs.length
        ? sortedLogs.length
        : startIndex + _rowsPerPage;

    final displayedLogs =
        sortedLogs.isEmpty ? [] : sortedLogs.sublist(startIndex, endIndex);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: colorScheme.secondary.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: DataTable2(
                columnSpacing: 6,
                horizontalMargin: 8,
                minWidth: 600,
                dividerThickness: 1,
                headingRowHeight: 40,
                headingRowColor: WidgetStateProperty.all(
                    colorScheme.secondary.withValues(alpha: 0.4)),
                dataRowColor: WidgetStateProperty.all(Colors.transparent),
                sortAscending: _sortAscending,
                sortColumnIndex: _sortColumnIndex,
                border: TableBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                columns: [
                  DataColumn2(
                    label: Padding(
                      padding: const EdgeInsets.only(right: 10.0),
                      child: Text(
                        'Début',
                        style: TextStyle(
                          color: colorScheme.onPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    size: ColumnSize.M,
                    onSort: (columnIndex, ascending) {
                      setState(() {
                        _sortColumnIndex = columnIndex;
                        _sortAscending = ascending;
                      });
                    },
                  ),
                  DataColumn2(
                    label: Padding(
                      padding: const EdgeInsets.only(right: 10.0),
                      child: Text(
                        'Fin',
                        style: TextStyle(
                          color: colorScheme.onPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    size: ColumnSize.M,
                    onSort: (columnIndex, ascending) {
                      setState(() {
                        _sortColumnIndex = columnIndex;
                        _sortAscending = ascending;
                      });
                    },
                  ),
                  DataColumn2(
                    label: Padding(
                      padding: const EdgeInsets.only(right: 10.0),
                      child: Text(
                        'Nom du jeu',
                        style: TextStyle(
                          color: colorScheme.onPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    size: ColumnSize.L,
                    onSort: (columnIndex, ascending) {
                      setState(() {
                        _sortColumnIndex = columnIndex;
                        _sortAscending = ascending;
                      });
                    },
                  ),
                  DataColumn2(
                    label: Padding(
                      padding: const EdgeInsets.only(right: 10.0),
                      child: Text(
                        'Statut',
                        style: TextStyle(
                          color: colorScheme.onPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    size: ColumnSize.S,
                    onSort: (columnIndex, ascending) {
                      setState(() {
                        _sortColumnIndex = columnIndex;
                        _sortAscending = ascending;
                      });
                    },
                  ),
                  DataColumn2(
                    label: Padding(
                      padding: const EdgeInsets.only(right: 10.0),
                      child: Text(
                        'Résultat',
                        style: TextStyle(
                          color: colorScheme.onPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    size: ColumnSize.S,
                    onSort: (columnIndex, ascending) {
                      setState(() {
                        _sortColumnIndex = columnIndex;
                        _sortAscending = ascending;
                      });
                    },
                  ),
                ],
                rows: displayedLogs.isEmpty
                    ? List.generate(
                        5,
                        (index) =>
                            _buildEmptyRow(colorScheme)) // Always show 5 rows
                    : displayedLogs.map((log) {
                        return DataRow2(
                          color: MaterialStateProperty.all(Colors.transparent),
                          cells: [
                            DataCell(
                              Text(
                                log.startTime ?? '--',
                                style: TextStyle(
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                            ),
                            DataCell(
                              Text(
                                log.endTime ?? '--',
                                style: TextStyle(
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                            ),
                            DataCell(
                              Text(
                                log.gameName ?? '--',
                                style: TextStyle(
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                            ),
                            DataCell(
                              Text(
                                log.status == 'complete'
                                    ? 'Complété'
                                    : 'Abandonné',
                                style: TextStyle(
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                            ),
                            DataCell(
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: log.result == 'win'
                                      ? Colors.green.withValues(alpha: 0.3)
                                      : Colors.red.withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  log.result == 'win' ? 'Gagné' : 'Perdu',
                                  style: TextStyle(
                                    color: colorScheme.onPrimary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                empty: Center(
                  child: Text(
                    'Aucune partie disponible',
                    style: TextStyle(color: colorScheme.onPrimary),
                  ),
                ),
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
                icon: Icon(Icons.arrow_back, color: colorScheme.onPrimary),
                onPressed: _currentPage > 0
                    ? () {
                        setState(() {
                          _currentPage--;
                        });
                      }
                    : null,
                disabledColor: colorScheme.onPrimary.withValues(alpha: 0.3),
              ),
              Text(
                'Page ${_currentPage + 1} / $displayTotalPages',
                style: TextStyle(color: colorScheme.onPrimary),
              ),
              IconButton(
                icon: Icon(Icons.arrow_forward, color: colorScheme.onPrimary),
                onPressed: _currentPage < totalPages - 1 && totalPages > 0
                    ? () {
                        setState(() {
                          _currentPage++;
                        });
                      }
                    : null,
                disabledColor: colorScheme.onPrimary.withValues(alpha: 0.3),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Helper method to create empty rows
  DataRow2 _buildEmptyRow(ColorScheme colorScheme) {
    return DataRow2(
      color: WidgetStateProperty.all(Colors.transparent),
      cells: [
        DataCell(
          Text(
            '',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
        ),
        DataCell(
          Text(
            '',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
        ),
        DataCell(
          Text(
            '',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
        ),
        DataCell(
          Text(
            '',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
        ),
        DataCell(
          Text(
            '',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
        ),
      ],
    );
  }

  // Helper for comparing nullable strings
  int _compareNullableStrings(String? a, String? b, bool ascending) {
    if (a == null && b == null) return 0;
    if (a == null) return ascending ? -1 : 1;
    if (b == null) return ascending ? 1 : -1;

    return ascending ? a.compareTo(b) : b.compareTo(a);
  }
}
