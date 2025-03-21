import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/UI/user-statistics/widget/game-logs-table.dart';
import 'package:client_leger/models/game-log-entry-model.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class GameLogsPage extends ConsumerWidget {
  const GameLogsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.watch(userProvider);
    final colorScheme = Theme.of(context).colorScheme;
    final size = MediaQuery.of(context).size;

    // Fixed height for container
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

        // Create game log entries
        final gameLogs =
            user.gameLogs?.map((log) => GameLogEntry.fromJson(log)).toList() ??
                [];

        return Scaffold(
          backgroundColor: colorScheme.primary,
          body: SafeArea(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Title - Centered
                    Center(
                      child: const AnimatedTitleWidget(
                        title: 'Historique des parties',
                        fontSize: 50,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Game Logs Table
                    Container(
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
                              colorScheme.onPrimary.withValues(alpha: 0.1),
                          cardColor: Colors.transparent,
                          scaffoldBackgroundColor: Colors.transparent,
                          dataTableTheme: DataTableThemeData(
                            headingTextStyle:
                                TextStyle(color: colorScheme.onPrimary),
                            dataTextStyle:
                                TextStyle(color: colorScheme.onPrimary),
                          ),
                        ),
                        child: GameLogsTable(
                          gameLogs: gameLogs,
                        ),
                      ),
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
