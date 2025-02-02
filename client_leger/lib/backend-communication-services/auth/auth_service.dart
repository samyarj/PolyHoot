import 'dart:async';
import 'dart:convert';
import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;

const String baseUrl = '${Environment.serverUrl}/users';
const String getProfileUrl = '$baseUrl/profile';
const String createUserUrl = '$baseUrl/create-user';
const String logOutUrl = '$baseUrl/logout';
const String checkEmailUrl = '$baseUrl/check-email';
const String googleSignInUrl = '$baseUrl/signin-google';
const String checkUsernameUrl = '$baseUrl/check-username';
const String getEmailUrl = '$baseUrl/get-email';
const String googleProvider = "google.com";
const String passwordProvider = 'password';

Completer<user_model.User> currentSignedInUserCompleter =
    Completer<user_model.User>();
Future<user_model.User> get currentSignedInUser =>
    currentSignedInUserCompleter.future;
ValueNotifier<bool> isLoggedIn = ValueNotifier<bool>(false);

Future<user_model.User?> fetchUser(
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
    try {
      currentSignedInUserCompleter.complete(user_model.User.fromJson(userJson));
    } catch (e) {
      AppLogger.e("Error while parsing userJson: $e");
      throw Exception("Error while parsing userJson: $e");
    }
    AppLogger.d("just updated the currentSignedInUser");
    return currentSignedInUser;
  } else {
    throw Exception('Failed to fetch user: ${response.reasonPhrase}');
  }
}

Future<user_model.User?> createAndFetchUser(
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

    try {
      currentSignedInUserCompleter.complete(user_model.User.fromJson(userJson));
      AppLogger.d("just updated the currentSignedInUser $currentSignedInUser");
    } catch (e) {
      AppLogger.e("Error while parsing userJson: $e");
      logout();
      throw Exception("Error while parsing userJson: $e");
    }

    return currentSignedInUser;
  } else {
    await userCredential.user!.delete();
    AppLogger.e(
        "Failed to fetch/create user: ${response.reasonPhrase} ${response.statusCode}");
    throw Exception('Failed to fetch/create user: ${response.reasonPhrase}');
  }
}

Future<user_model.User?> signUp(
  String username,
  String email,
  String password,
) async {
  AppLogger.d("in signUp auth_service");

  UserCredential userCredential = await FirebaseAuth.instance
      .createUserWithEmailAndPassword(email: email, password: password);

  await userCredential.user!.updateProfile(displayName: username);

  final user = await createAndFetchUser(userCredential, createUserUrl);

  AppLogger.d("About to refresh the listenable");
  isLoggedIn.value = true;
  return user;
}

Future<String> getEmailFromIdentifier(String identifier) async {
  if (identifier.contains('@')) {
    return identifier;
  }

  final response = await http.get(
    Uri.parse(getEmailUrl).replace(
      queryParameters: {'username': identifier},
    ),
  );
  final jsonResponse = jsonDecode(response.body);
  AppLogger.d("getEmailFromIdentifier response is $jsonResponse");
  return jsonResponse['email'];
}

Future<user_model.User?> signIn(String identifier, String password) async {
  AppLogger.d("in signIn");

  final email = await getEmailFromIdentifier(identifier);

  final isOnline = await isUserOnline(email);

  if (isOnline) {
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
    AppLogger.d("About to change the listenable");
    isLoggedIn.value = true;
    return user;
  } on Exception catch (e) {
    logout();
    AppLogger.e("Failed to sign in user: ${e.toString()}  ");
    throw Exception("Failed to sign in user: ${e.toString()}");
  }
}

Future<bool> isUserOnline(String email) async {
  AppLogger.d("in isUserOnline here is the url $baseUrl/check-online-status");

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

Future<bool> isUsernameTaken(String username) async {
  final http.Response response = await http.get(
    Uri.parse(checkUsernameUrl).replace(
      queryParameters: {'username': username},
    ),
  );

  final jsonResponse = jsonDecode(response.body);
  AppLogger.d("in isUsernameTaken json response is $jsonResponse");
  return jsonResponse['usernameExists'] as bool? ?? false;
}

Future<bool> isEmailTaken(String email) async {
  // for signUp
  final http.Response response = await http.get(
    Uri.parse(checkEmailUrl).replace(
      queryParameters: {'email': email},
    ),
  );
  bool emailTaken = false;
  if (response.statusCode == 200) {
    final responseJson = jsonDecode(response.body);
    AppLogger.d('responseJson of isEmailTaken is $responseJson');
    emailTaken = responseJson['emailExists'];
  }
  return emailTaken;
}

void logout() async {
  AppLogger.d("in logout");

  User? currentUser = FirebaseAuth.instance.currentUser;

  if (currentUser == null) throw Exception("No current user identified");

  final idToken = await currentUser.getIdToken();

  if (idToken == null) {
    AppLogger.e("idToken is null");
    await FirebaseAuth.instance.signOut();
    AppLogger.d(
        "token is null but still signing out and about to refresh the listenable");
    isLoggedIn.value = false;
    currentSignedInUserCompleter = Completer<user_model.User>();
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
    isLoggedIn.value = false;
    currentSignedInUserCompleter = Completer<user_model.User>();
  } else {
    AppLogger.e(
        "Error during backend logout ${response.reasonPhrase} ${response.statusCode}");
    throw Exception("Error during backend logout");
  }
}

Future<void> forgotPassword(String email) async {
  await FirebaseAuth.instance.setLanguageCode('fr');
  await FirebaseAuth.instance.sendPasswordResetEmail(email: email);
}

Future<bool> emailCheck(String email) async {
  // for the forgot password functionality
  AppLogger.d("in emailCheck");

  final http.Response response = await http.get(
    Uri.parse(checkEmailUrl).replace(
      queryParameters: {'email': email},
    ),
  );
  if (response.statusCode == 200) {
    final responseJson = jsonDecode(response.body);
    AppLogger.d('responseJson of emailCheck is $responseJson');
    final bool emailExists = responseJson['emailExists'];
    final String? provider = responseJson['provider'];
    if (emailExists && provider == passwordProvider) {
      return true;
    } else if (provider == googleProvider) {
      throw Exception(
          "This functionnality is not available with Google sign-in");
    } else if (!emailExists) {
      throw Exception("This email is not registered.");
    }
  } else {
    AppLogger.e(
        "Error in emailCheck : ${response.statusCode}  ${response.reasonPhrase}");
    throw Exception("An error occured ${response.reasonPhrase}");
  }
  return false;
}

signWithGoogle() async {
  final userCredential = await signInWithGoogle();

  bool isOnline = false;
  if (userCredential.user?.email != null) {
    AppLogger.d("about to check if user is online");
    isOnline = await isUserOnline(userCredential.user!.email!);
  }

  if (isOnline) throw Exception("User is already logged in on another device.");

  AppLogger.d("about to update profile");

  await userCredential.user!
      .updateProfile(displayName: userCredential.user?.displayName);

  await createAndFetchUser(userCredential, googleSignInUrl);
  isLoggedIn.value = true;
}

Future<UserCredential> signInWithGoogle() async {
  final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();

  if (googleUser == null) {
    throw Exception("Google Sign-In aborted");
  }

  final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

  final OAuthCredential credential = GoogleAuthProvider.credential(
    accessToken: googleAuth.accessToken,
    idToken: googleAuth.idToken,
  );

  AppLogger.d("about to call Firebase signInWithCredential");

  final userCredential =
      await FirebaseAuth.instance.signInWithCredential(credential);
  return userCredential;
}
