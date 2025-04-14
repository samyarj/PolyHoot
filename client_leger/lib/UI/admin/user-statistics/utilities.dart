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

      // Assuming the backend returns a 'averageTimePerGame' field
      final String averageTime = responseBody['averageTimePerGame'] ?? '0:00';

      return averageTime;
    } else {
      AppLogger.w('Failed to fetch average time per game: ${response.body}');
      throw Exception('Failed to fetch average time per game');
    }
  } catch (e) {
    AppLogger.e('Error fetching average time per game: ${e.toString()}');
    throw Exception(getCustomError(e));
  }
}
