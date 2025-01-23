import 'dart:convert';
import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;

const String baseUrl = '${Environment.serverUrl}/users';
const String getProfileUrl = '$baseUrl/profile';

Future<user_model.User> fetchUser(
  UserCredential userCredential,
  String endpoint,
) async {
  final idToken = await userCredential.user!.getIdToken();
  final headers = {
    'Authorization': 'Bearer $idToken',
    'Content-Type': 'application/json',
  };

  final http.Response response =
      await http.get(Uri.parse(endpoint), headers: headers);

  if (response.statusCode == 200) {
    final userJson = jsonDecode(response.body);
    print("userJson successfully fetched: $userJson");
    return user_model.User.fromJson(userJson);
  } else {
    throw Exception('Failed to fetch user: ${response.reasonPhrase}');
  }
}
