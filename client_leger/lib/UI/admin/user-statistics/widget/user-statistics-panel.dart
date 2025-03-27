import 'package:flutter/material.dart';

class UserStatisticsPanel extends StatelessWidget {
  final int totalGamesPlayed;
  final int gamesWon;
  final String winRate;
  final String averageTimePerGame;

  const UserStatisticsPanel({
    Key? key,
    required this.totalGamesPlayed,
    required this.gamesWon,
    required this.winRate,
    required this.averageTimePerGame,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 16.0),
          child: Text(
            'Statistiques',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: colorScheme.onPrimary,
            ),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: colorScheme.secondary.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(4),
            ),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatCard(
                    context,
                    icon: Icons.gamepad,
                    title: 'Parties jouées',
                    value: totalGamesPlayed.toString(),
                    colorScheme: colorScheme,
                  ),
                  const SizedBox(height: 16),
                  _buildStatCard(
                    context,
                    icon: Icons.emoji_events,
                    title: 'Parties gagnées',
                    value: gamesWon.toString(),
                    colorScheme: colorScheme,
                  ),
                  const SizedBox(height: 16),
                  _buildStatCard(
                    context,
                    icon: Icons.check_circle,
                    title: 'Moyenne de bonnes réponses',
                    value: '$winRate%',
                    colorScheme: colorScheme,
                  ),
                  const SizedBox(height: 16),
                  _buildStatCard(
                    context,
                    icon: Icons.timer,
                    title: 'Temps moyen par partie',
                    value: averageTimePerGame,
                    colorScheme: colorScheme,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String value,
    required ColorScheme colorScheme,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colorScheme.primary,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: colorScheme.tertiary.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: colorScheme.onPrimary,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: colorScheme.onPrimary.withValues(alpha: 0.8),
                    fontSize: 12,
                  ),
                ),
                Text(
                  value,
                  style: TextStyle(
                    color: colorScheme.onPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
