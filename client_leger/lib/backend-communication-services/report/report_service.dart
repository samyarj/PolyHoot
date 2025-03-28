import 'dart:convert';
import 'package:client_leger/environment_config.dart';
import 'package:client_leger/models/report/report_state.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:toastification/toastification.dart';
import 'package:http/http.dart' as http;

class ReportService {
  static final ReportService _instance = ReportService._();

  // Private constructor to prevent external instantiation
  ReportService._();

  factory ReportService() {
    return _instance;
  }

  final baseUrl = "${EnvironmentConfig.serverUrl}/report";
  bool isWarned = false;
  ValueNotifier<int?> nbReport = ValueNotifier<int?>(null);

  behaviourWarning(BuildContext context) {
    if (!isWarned) {
      isWarned = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showToast(
          context,
          "Attention à votre comportement !",
          type: ToastificationType.warning,
          description:
              "Plusieurs personnes vous ont signalé. Vous serez banni si vous continuez.",
          duration: const Duration(
            seconds: 6,
          ),
        );
      });
    }
  }

  resetParam() {
    isWarned = false;
    nbReport.value = null;
  }

  banInfo(String message, BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      showToast(
        context,
        message,
        type: ToastificationType.error,
        duration: const Duration(
          seconds: 5,
        ),
      );
    });
  }

  Future<bool?> reportPlayer(String uid) async {
    AppLogger.i("Reporting player with uid: $uid");
    final tokenValue = await FirebaseAuth.instance.currentUser?.getIdToken();
    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $tokenValue',
    };

    final response = await http.post(
      Uri.parse('$baseUrl/report'),
      headers: headers,
      body: jsonEncode({"reportedUID": uid}),
    );

    AppLogger.w(
        "Response: ${response.body} status code: ${response.statusCode}");

    //throw une erreur sur le status code est pas 200?

    return jsonDecode(response.body);
  }

  Future<ReportState?> getReportState(String? uid) async {
    AppLogger.i("Getting report state for uid: $uid");

    if (uid == null) return null;

    final tokenValue = await FirebaseAuth.instance.currentUser?.getIdToken();
    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $tokenValue',
    };

    final response = await http.post(
      Uri.parse('$baseUrl/state'),
      headers: headers,
      body: jsonEncode({"uid": uid}),
    );

    AppLogger.w(
        "Response: ${response.body} status code: ${response.statusCode}");

    if (response.statusCode == 200) {
      final reportStateJson = jsonDecode(response.body);
      return ReportState.fromJson(reportStateJson);
    } else {
      AppLogger.e("Failed to fetch report state: ${response.statusCode}");
      throw Exception(
          "Une erreur a eu lieu lors d'une tentative de récupération de l'état du report");
    }
  }
}
