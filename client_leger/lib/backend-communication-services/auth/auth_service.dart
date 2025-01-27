import 'dart:convert';
import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;

const String baseUrl = '${Environment.serverUrl}/users';
const String getProfileUrl = '$baseUrl/profile';
const String createUserUrl = '$baseUrl/create-user';
const String logOutUrl = '$baseUrl/logout';
user_model.User? currentSignedInUser;
bool isLoggedInElsewhere = false;

Future<user_model.User> fetchUser(
  UserCredential userCredential,
) async {
  final idToken = await userCredential.user!.getIdToken();
  final headers = {
    'Authorization': 'Bearer $idToken',
  };

  final http.Response response =
      await http.get(Uri.parse(getProfileUrl), headers: headers);

  if (response.statusCode == 200) {
    final userJson = jsonDecode(response.body);
    print("userJson successfully fetched: $userJson");
    currentSignedInUser = user_model.User.fromJson(userJson);
    print("just updated the currentSignedInUser");
    return currentSignedInUser!;
  } else {
    throw Exception('Failed to fetch user: ${response.reasonPhrase}');
  }
}

Future<user_model.User> createAndFetchUser(
    UserCredential userCredential, String endpoint) async {
  // with email or Google

  final idToken = await userCredential.user!.getIdToken();
  final headers = {
    'Authorization': 'Bearer $idToken',
  };

  final http.Response response =
      await http.post(Uri.parse(endpoint), headers: headers);

  if (response.statusCode == 201) {
    final userJson = jsonDecode(response.body);
    print("userJson successfully fetched: $userJson");
    currentSignedInUser = user_model.User.fromJson(userJson);
    print("IN CREATE AND FETCH AND WE UPDATED CURRENTSIGNEDIN");
    return currentSignedInUser!;
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

  final user = await createAndFetchUser(userCredential, createUserUrl);

  return user;
}

Future<user_model.User> signIn(String email, String password) async {
  print('in sign in');
  final isOnline = await isUserOnline(email);

  if (isOnline) {
    isLoggedInElsewhere = true;
    throw Exception('User is already logged in on another device.');
  }

  isLoggedInElsewhere = false;

  try {
    final userCredential =
        await FirebaseAuth.instance.signInWithEmailAndPassword(
      email: email,
      password: password,
    );

    final user = await fetchUser(userCredential);
    return user;
  } on Exception catch (e) {
    throw Exception("Failed to sign in user: ${e.toString()}");
  }
}

Future<bool> isUserOnline(String email) async {
  final http.Response response = await http.get(
    Uri.parse('$baseUrl/check-online-status').replace(
      queryParameters: {'email': email},
    ),
  );

  if (response.statusCode == 200) {
    final jsonResponse = jsonDecode(response.body);
    return jsonResponse['isOnline'] as bool? ?? false;
  } else {
    print('isUserOnline : Internal server error');
    return false;
  }
}

void logout() async {
  User? currentUser = FirebaseAuth.instance.currentUser;

  if (currentUser == null) throw Exception("No current user identified");

  final idToken = await currentUser.getIdToken();

  if (idToken == null) {
    print("idToken is null");
    await FirebaseAuth.instance.signOut();
    currentSignedInUser = null;
    return;
  }

  final headers = {
    'Authorization': 'Bearer $idToken',
  };

  final http.Response response =
      await http.post(Uri.parse(logOutUrl), headers: headers);

  if (response.statusCode == 200) {
    print("logging out successfully on server");
    await FirebaseAuth.instance.signOut();
    currentSignedInUser = null;
  } else {
    throw Exception("Error during backend logout");
  }
}
