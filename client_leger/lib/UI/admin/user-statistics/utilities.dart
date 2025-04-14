import 'dart:convert';

import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/environment_config.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:http/http.dart' as http;

Future<String> fetchAverageTimePerGame() async {
  try {
    final currentUser = firebase_auth.FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      throw Exception('User not authenticated');
    }

    final token = await currentUser.getIdToken();

    final response = await http.get(
      Uri.parse('${EnvironmentConfig.serverUrl}/users/average-time-per-game'),
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer $token'
      },
    );

    if (response.statusCode == 200) {
      // Parse the response
      final Map<String, dynamic> responseBody = json.decode(response.body);

      final String rawAverageTime =
          responseBody['averageTimePerGame'] ?? '0m:00s';

      // Convert the "x:y" format to "xmin:ysec" format
      final String formattedTime = _formatTimeToMinSec(rawAverageTime);

      return formattedTime;
    } else {
      AppLogger.w('Failed to fetch average time per game: ${response.body}');
      throw Exception('Failed to fetch average time per game');
    }
  } catch (e) {
    AppLogger.e('Error fetching average time per game: ${e.toString()}');
    throw Exception(getCustomError(e));
  }
}

/// Converts a time string in "x:y" format to "xmin:ysec" format
String _formatTimeToMinSec(String timeString) {
  try {
    // Split the time string by ":"
    final parts = timeString.split(':');

    if (parts.length == 2) {
      final minutes = parts[0];
      final seconds = parts[1];

      return '${minutes}m:${seconds}s';
    }

    // If the format is unexpected, return the original string
    return timeString;
  } catch (e) {
    AppLogger.e('Error formatting time: ${e.toString()}');
    return timeString; // Return original if there's an error
  }
}
