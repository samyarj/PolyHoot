import 'dart:convert';
import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;

const String baseUrl = '${Environment.serverUrl}/users';
const String getProfileUrl = '$baseUrl/profile';
const String createUserUrl = '$baseUrl/create-user';
const String logOutUrl = '$baseUrl/logout';
user_model.User? currentSignedInUser;
bool shouldBeRedirected = false;

Future<user_model.User> fetchUser(
  UserCredential userCredential,
) async {
  AppLogger.d("in fetchUser");
  final idToken = await userCredential.user!.getIdToken();
  final headers = {
    'Authorization': 'Bearer $idToken',
  };

  final http.Response response =
      await http.get(Uri.parse(getProfileUrl), headers: headers);

  if (response.statusCode == 200) {
    final userJson = jsonDecode(response.body);
    AppLogger.i("userJson successfully fetched: $userJson");
    currentSignedInUser = user_model.User.fromJson(userJson);
    AppLogger.d("just updated the currentSignedInUser");
    return currentSignedInUser!;
  } else {
    throw Exception('Failed to fetch user: ${response.reasonPhrase}');
  }
}

Future<user_model.User> createAndFetchUser(
    UserCredential userCredential, String endpoint) async {
  // with email or Google
  AppLogger.d("in createAndFetchUser");

  final idToken = await userCredential.user!.getIdToken();
  final headers = {
    'Authorization': 'Bearer $idToken',
  };

  final http.Response response =
      await http.post(Uri.parse(endpoint), headers: headers);

  if (response.statusCode == 201) {
    final userJson = jsonDecode(response.body);
    AppLogger.i("userJson successfully fetched: $userJson");
    currentSignedInUser = user_model.User.fromJson(userJson);
    return currentSignedInUser!;
  } else {
    await userCredential.user!.delete();
    AppLogger.e(
        "Failed to fetch user: ${response.reasonPhrase} ${response.statusCode}");
    throw Exception('Failed to fetch user: ${response.reasonPhrase}');
  }
}

Future<user_model.User> signUp(
  String username,
  String email,
  String password,
) async {
  AppLogger.d("in signUp");
  UserCredential userCredential = await FirebaseAuth.instance
      .createUserWithEmailAndPassword(email: email, password: password);

  await userCredential.user!.updateProfile(displayName: username);

  final user = await createAndFetchUser(userCredential, createUserUrl);

  shouldBeRedirected = true;

  return user;
}

Future<user_model.User> signIn(String email, String password) async {
  AppLogger.d("in signIn");
  final isOnline = await isUserOnline(email);

  if (isOnline) {
    shouldBeRedirected = false;
    AppLogger.e("User is already logged in on another device.");
    throw Exception('User is already logged in on another device.');
  }

  try {
    final userCredential =
        await FirebaseAuth.instance.signInWithEmailAndPassword(
      email: email,
      password: password,
    );

    final user = await fetchUser(userCredential);
    shouldBeRedirected = true;
    return user;
  } on Exception catch (e) {
    shouldBeRedirected = false;
    AppLogger.e("Failed to sign in user: ${e.toString()}  ");
    throw Exception("Failed to sign in user: ${e.toString()}");
  }
}

Future<bool> isUserOnline(String email) async {
  AppLogger.d("in isUserOnline");

  final http.Response response = await http.get(
    Uri.parse('$baseUrl/check-online-status').replace(
      queryParameters: {'email': email},
    ),
  );

  if (response.statusCode == 200) {
    final jsonResponse = jsonDecode(response.body);
    return jsonResponse['isOnline'] as bool? ?? false;
  } else {
    AppLogger.e('isUserOnline : Internal server error');
    return false;
  }
}

void logout() async {
  AppLogger.d("in logout");

  User? currentUser = FirebaseAuth.instance.currentUser;

  if (currentUser == null) throw Exception("No current user identified");

  final idToken = await currentUser.getIdToken();

  if (idToken == null) {
    AppLogger.e("idToken is null");
    await FirebaseAuth.instance.signOut();
    currentSignedInUser = null;
    shouldBeRedirected = false;
    return;
  }

  final headers = {
    'Authorization': 'Bearer $idToken',
  };

  final http.Response response =
      await http.post(Uri.parse(logOutUrl), headers: headers);

  if (response.statusCode == 200) {
    AppLogger.d("logging out successfully on server");
    await FirebaseAuth.instance.signOut();
    currentSignedInUser = null;
    shouldBeRedirected = false;
  } else {
    shouldBeRedirected = false;
    throw Exception("Error during backend logout");
  }
}
