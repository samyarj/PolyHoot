import 'package:client_leger/models/connection-log-entry-model.dart';
import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';

class ConnectionLogsTable extends StatefulWidget {
  final List<ConnectionLogEntry> connectionLogs;

  const ConnectionLogsTable({
    Key? key,
    required this.connectionLogs,
  }) : super(key: key);

  @override
  State<ConnectionLogsTable> createState() => _ConnectionLogsTableState();
}

class _ConnectionLogsTableState extends State<ConnectionLogsTable> {
  int _currentPage = 0;
  final int _rowsPerPage = 5;
  bool _sortAscending = false;
  int _sortColumnIndex = 0; // 0 for timestamp, 1 for action

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Create a sorted copy of the logs
    final sortedLogs = List<ConnectionLogEntry>.from(widget.connectionLogs);

    // Apply sorting
    if (sortedLogs.isNotEmpty) {
      sortedLogs.sort((a, b) {
        if (_sortColumnIndex == 0) {
          // Sort by timestamp
          return _sortAscending
              ? a.timestamp.compareTo(b.timestamp)
              : b.timestamp.compareTo(a.timestamp);
        } else {
          // Sort by action
          return _sortAscending
              ? a.action.compareTo(b.action)
              : b.action.compareTo(a.action);
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
        Padding(
          padding: const EdgeInsets.only(bottom: 16.0),
          child: Text(
            'Logs d\'activité',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: colorScheme.onPrimary,
            ),
            textAlign: TextAlign.center,
          ),
        ),
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: colorScheme.secondary.withOpacity(0.2),
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
                    colorScheme.secondary.withOpacity(0.4)),
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
                        'Horodatage',
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
                        'Action',
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
                ],
                rows: displayedLogs.isEmpty
                    ? List.generate(
                        5,
                        (index) =>
                            _buildEmptyRow(colorScheme)) // Always show 5 rows
                    : displayedLogs.map((log) {
                        return DataRow2(
                          color: WidgetStateProperty.all(Colors.transparent),
                          cells: [
                            DataCell(
                              Text(
                                log.timestamp,
                                style: TextStyle(
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                            ),
                            DataCell(
                              Text(
                                log.action == 'connect'
                                    ? 'Connection'
                                    : 'Déconnection',
                                style: TextStyle(
                                  color: colorScheme.onPrimary,
                                  fontWeight: log.action == 'connect'
                                      ? FontWeight.normal
                                      : FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                empty: Center(
                  child: Text(
                    'Aucun log disponible',
                    style: TextStyle(color: colorScheme.onPrimary),
                  ),
                ),
              ),
            ),
          ),
        ),
        // Pagination controls - always show
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
                disabledColor: colorScheme.onPrimary.withOpacity(0.3),
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
                disabledColor: colorScheme.onPrimary.withOpacity(0.3),
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
      ],
    );
  }
}
