import 'package:client_leger/models/game-log-entry-model.dart';
import 'package:intl/intl.dart';

String getAverageTimePerGame(List<GameLogEntry> gameLogs) {
  // Parse the date format
  final dateFormat = DateFormat("dd/MM/yyyy HH:mm:ss");

  // Calculate total duration in seconds
  int totalDurationInSeconds = 0;
  for (final log in gameLogs) {
    if (log.startTime != null && log.endTime != null) {
      final startTime = dateFormat.parse(log.startTime!);
      final endTime = dateFormat.parse(log.endTime!);
      totalDurationInSeconds += endTime.difference(startTime).inSeconds;
    }
  }

  // Calculate average duration
  if (gameLogs.isEmpty) return "0:00";
  final averageDurationInSeconds = totalDurationInSeconds ~/ gameLogs.length;

  // Convert to minutes and seconds
  final minutes = averageDurationInSeconds ~/ 60;
  final seconds = averageDurationInSeconds % 60;

  return "$minutes:$seconds";
}
