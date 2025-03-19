import 'dart:convert';
import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/models/chance/dailyfree.dart';
import 'package:client_leger/models/chance/lootbox_container.dart';
import 'package:client_leger/models/chance/reward.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;

class LootboxService {
  LootboxService._privateConstructor()
      : baseUrl = Environment.serverUrl,
        lootboxUrl = "${Environment.serverUrl}/loot" {
    AppLogger.i("LootboxService created");
  }

  // Singleton instance
  static final LootboxService _instance = LootboxService._privateConstructor();

  // Factory constructor to return the same instance
  factory LootboxService() {
    return _instance;
  }

  String baseUrl;
  String lootboxUrl;
  // acces a l'objet user dans le widget en ecoutant

  Future<Reward> openBox(double id) async {
    final tokenValue = await FirebaseAuth.instance.currentUser?.getIdToken();
    final headers = {
      'Authorization': 'Bearer $tokenValue',
    };

    final response = await http.post(
      Uri.parse('$lootboxUrl/lootBox'),
      headers: headers,
      body: '{"id": "$id"}',
    );

    if (response.statusCode == 200) {
      final rewardJson = jsonDecode(response.body);
      return Reward.fromJson(rewardJson);
    } else {
      AppLogger.e('Failed to open lootbox: ${response.statusCode}');
      throw Exception(
          "Une erreur a eu lieu lors d'une tentative de récuperation auprès du serveur");
    }
  }

  Future<List<LootBoxContainer>> getBoxes() async {
    final tokenValue = await FirebaseAuth.instance.currentUser?.getIdToken();
    final headers = {
      'Authorization': 'Bearer $tokenValue',
    };

    final response = await http.get(
      Uri.parse('$lootboxUrl/lootBox'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> lootBoxListJson = jsonDecode(response.body);
      return lootBoxListJson
          .map((json) => LootBoxContainer.fromJson(json))
          .toList();
    } else {
      AppLogger.e('Failed to fetch loot boxes: ${response.statusCode}');
      throw Exception(
          "Une erreur a eu lieu lors d'une tentative de récuperation auprès du serveur");
    }
  }

  Future<Reward> openDailyFree() async {
    final tokenValue = await FirebaseAuth.instance.currentUser?.getIdToken();
    final headers = {
      'Authorization': 'Bearer $tokenValue',
    };

    final response = await http.post(
      Uri.parse('$baseUrl/dailyFree'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final rewardJson = jsonDecode(response.body);
      return Reward.fromJson(rewardJson);
    } else {
      AppLogger.e('Failed to open daily free loot: ${response.statusCode}');
      throw Exception(
          "Une erreur a eu lieu lors d'une tentative de récuperation auprès du serveur");
    }
  }

  Future<DailyFree> getDailyFree() async {
    final tokenValue = await FirebaseAuth.instance.currentUser?.getIdToken();
    final headers = {
      'Authorization': 'Bearer $tokenValue',
    };

    final response = await http.get(
      Uri.parse('$baseUrl/dailyFree'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final dailyFreeJson = jsonDecode(response.body);
      return DailyFree.fromJson(dailyFreeJson);
    } else {
      AppLogger.e(
          'Failed to fetch daily free loot info: ${response.statusCode}');
      throw Exception(
          "Une erreur a eu lieu lors d'une tentative de récuperation auprès du serveur");
    }
  }
}
