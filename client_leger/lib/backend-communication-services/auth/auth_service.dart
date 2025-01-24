import 'dart:convert';
import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;

const String baseUrl = '${Environment.serverUrl}/users';
const String getProfileUrl = '$baseUrl/profile';
const String createUserUrl = '$baseUrl/create-user';

Future<user_model.User> fetchUser(
  UserCredential userCredential,
  String endpoint,
) async {
  final idToken = await userCredential.user!.getIdToken();
  final headers = {
    'Authorization': 'Bearer $idToken',
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

Future<user_model.User> signUp(
  String username,
  String email,
  String password,
) async {
  UserCredential userCredential = await FirebaseAuth.instance
      .createUserWithEmailAndPassword(email: email, password: password);

  await userCredential.user!.updateProfile(displayName: username);

  final idToken = await userCredential.user!.getIdToken();
  final headers = {
    'Authorization': 'Bearer $idToken',
  };

  final http.Response response =
      await http.post(Uri.parse(createUserUrl), headers: headers);

  if (response.statusCode == 201) {
    final userJson = jsonDecode(response.body);
    print("userJson successfully fetched: $userJson");
    return user_model.User.fromJson(userJson);
  } else {
    throw Exception('Failed to fetch user: ${response.reasonPhrase}');
  }
}

Future signIn(String email, String password) async {
  try {
    await FirebaseAuth.instance.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
  } on FirebaseAuthException catch (e) {
    throw Exception("Failed to sign in user: ${e.message}");
  }
}
