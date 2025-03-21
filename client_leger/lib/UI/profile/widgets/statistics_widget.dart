import 'package:flutter/material.dart';

class StatisticsWidget extends StatelessWidget {
  final int totalGamesPlayed;
  final int gamesWon;
  final double averageCorrectAnswers;
  final String averageTimePerGame;
  final Function() onViewLogs;

  const StatisticsWidget({
    Key? key,
    required this.totalGamesPlayed,
    required this.gamesWon,
    required this.averageCorrectAnswers,
    required this.averageTimePerGame,
    required this.onViewLogs,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Statistiques',
              style: theme.textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            
            ListTile(
              leading: Icon(Icons.gamepad, color: colorScheme.primary),
              title: const Text('Parties jouées'),
              trailing: Text(
                '$totalGamesPlayed',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.primary,
                ),
              ),
            ),
            
            ListTile(
              leading: Icon(Icons.emoji_events, color: colorScheme.primary),
              title: const Text('Parties gagnées'),
              trailing: Text(
                '$gamesWon',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.primary,
                ),
              ),
            ),
            
            ListTile(
              leading: Icon(Icons.check_circle, color: colorScheme.primary),
              title: const Text('Moyenne de bonnes réponses'),
              trailing: Text(
                '${averageCorrectAnswers.toStringAsFixed(1)}%',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.primary,
                ),
              ),
            ),
            
            ListTile(
              leading: Icon(Icons.timer, color: colorScheme.primary),
              title: const Text('Temps moyen par partie'),
              trailing: Text(
                averageTimePerGame,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.primary,
                ),
              ),
            ),
            
            const SizedBox(height: 8),
            
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onViewLogs,
                style: ElevatedButton.styleFrom(
                  backgroundColor: colorScheme.primary,
                  foregroundColor: colorScheme.onPrimary,
                ),
                child: const Text('Voir les logs'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
