import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/UI/user-statistics/utilities.dart';
import 'package:client_leger/UI/user-statistics/widget/connection-logs-table.dart';
import 'package:client_leger/UI/user-statistics/widget/user-statistics-panel.dart';
import 'package:client_leger/models/connection-log-entry-model.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class UserStatsAndLogsPage extends ConsumerWidget {
  const UserStatsAndLogsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.watch(userProvider);
    final colorScheme = Theme.of(context).colorScheme;

    // Fixed height for both containers
    final containerHeight = 450.0;

    return userState.when(
      data: (user) {
        if (user == null) {
          return Center(
            child: Text(
              'Utilisateur non connecté',
              style: TextStyle(color: colorScheme.onPrimary),
            ),
          );
        }

        // Create connection log entries
        final connectionLogs = user.cxnLogs
                ?.map((log) => ConnectionLogEntry.fromJson(log))
                .toList() ??
            [];

        // Calculate statistics
        final totalGamesPlayed = user.nGames ?? 0;
        final gamesWon = user.nWins ?? 0;

        return Scaffold(
          backgroundColor: colorScheme.primary,
          body: SafeArea(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Center(
                      child: const AnimatedTitleWidget(
                          title: 'Statistiques et logs'),
                    ),
                    const SizedBox(height: 32),
                    Row(
                      children: [
                        Expanded(
                          flex: 4,
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: colorScheme.tertiary,
                                width: 2,
                              ),
                              borderRadius: BorderRadius.circular(8),
                              color: colorScheme.primary,
                            ),
                            height: containerHeight,
                            padding: const EdgeInsets.all(16.0),
                            child: UserStatisticsPanel(
                              totalGamesPlayed: totalGamesPlayed,
                              gamesWon: gamesWon,
                              winRate: user.stats?.rightAnswerPercentage
                                      ?.toString() ??
                                  '0.0',
                              averageTimePerGame:
                                  getAverageTimePerGame(user.gameLogs),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          flex: 6,
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: colorScheme.tertiary,
                                width: 2,
                              ),
                              borderRadius: BorderRadius.circular(8),
                              color: colorScheme.primary,
                            ),
                            height: containerHeight,
                            padding: const EdgeInsets.all(16.0),
                            child: Theme(
                              data: Theme.of(context).copyWith(
                                dividerColor:
                                    colorScheme.onPrimary.withOpacity(0.1),
                                cardColor: Colors.transparent,
                                scaffoldBackgroundColor: Colors.transparent,
                                dataTableTheme: DataTableThemeData(
                                  headingTextStyle:
                                      TextStyle(color: colorScheme.onPrimary),
                                  dataTextStyle:
                                      TextStyle(color: colorScheme.onPrimary),
                                ),
                              ),
                              child: ConnectionLogsTable(
                                connectionLogs: connectionLogs,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
      loading: () => Scaffold(
        backgroundColor: colorScheme.primary,
        body: Center(
          child: CircularProgressIndicator(
            color: colorScheme.onPrimary,
          ),
        ),
      ),
      error: (error, stack) => Scaffold(
        backgroundColor: colorScheme.primary,
        body: Center(
          child: Text(
            'Erreur: $error',
            style: TextStyle(color: colorScheme.onPrimary),
          ),
        ),
      ),
    );
  }
}
