import 'package:client_leger/models/game-log-entry-model.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:intl/intl.dart';

String getAverageTimePerGame(List<GameLogEntry> gameLogs) {
  // Parse the date format
  final dateFormat = DateFormat("dd/MM/yyyy HH:mm:ss");

  // Calculate total duration in seconds
  int totalDurationInSeconds = 0;
  int skippedLogs = 0;
  for (final log in gameLogs) {
    try {
      if (log.startTime != null && log.endTime != null) {
        final startTime = dateFormat.parse(log.startTime!);
        final endTime = dateFormat.parse(log.endTime!);
        totalDurationInSeconds += endTime.difference(startTime).inSeconds;
      }
    } catch (e) {
      AppLogger.e(
          "Error parsing date: $e log = $log, startTime = ${log.startTime}, endTime = ${log.endTime}");
      skippedLogs++;
      continue;
    }
  }

  // Calculate average duration
  if (gameLogs.isEmpty) return "0:00";
  final averageDurationInSeconds =
      totalDurationInSeconds ~/ (gameLogs.length - skippedLogs);

  // Convert to minutes and seconds
  final minutes = averageDurationInSeconds ~/ 60;
  final seconds = averageDurationInSeconds % 60;

  return "$minutes:$seconds";
}
