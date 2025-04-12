import 'dart:async';
import 'dart:convert';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/environment_config.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;

final String baseUrl = '${EnvironmentConfig.serverUrl}/users';
final String getProfileUrl = '$baseUrl/profile';
final String createUserUrl = '$baseUrl/create-user';
final String updateUserNameUrl = '$baseUrl/update-username';
final String logOutUrl = '$baseUrl/logout';
final String checkEmailUrl = '$baseUrl/check-email';
final String googleSignInUrl = '$baseUrl/signin-google';
final String checkUsernameUrl = '$baseUrl/check-username';
final String getEmailUrl = '$baseUrl/get-email';
const String googleProvider = "google.com";
const String passwordProvider = 'password';

Future<String> getEmailFromIdentifier(String identifier) async {
  if (identifier.contains('@')) {
    return identifier;
  }

  final response = await http.get(
    Uri.parse(getEmailUrl).replace(
      queryParameters: {'username': identifier},
    ),
  );

  if (response.statusCode != 200) {
    throw Exception(
        "Les informations d'identification sont invalides. Veuillez vérifier vos données.");
  }

  final jsonResponse = jsonDecode(response.body);

  return jsonResponse['email'];
}

Future<bool> isUserOnline(String email) async {
  try {
    // Reference the `users` collection and query by email
    final usersRef = FirebaseFirestore.instance.collection('users');
    final querySnapshot =
        await usersRef.where('email', isEqualTo: email).limit(1).get();

    if (querySnapshot.docs.isEmpty) {
      return false; // User not found, return false
    }

    // Extract the `isOnline` field from the user document
    final userDoc = querySnapshot.docs.first.data();
    AppLogger.d("in isUserOnline = ${userDoc['isOnline']}");
    return userDoc['isOnline'] ?? false;
  } catch (e) {
    AppLogger.e(e.toString());
    throw Exception(getCustomError(e));
  }
}

Future<bool> isUsernameTaken(String username) async {
  final http.Response response = await http.get(
    Uri.parse(checkUsernameUrl).replace(
      queryParameters: {'username': username},
    ),
  );

  if (response.statusCode != 200) {
    throw Exception(
        "Une erreur serveur a eu lieu lors de la vérification du pseudonyme.");
  }

  final jsonResponse = jsonDecode(response.body);
  AppLogger.d("in isUsernameTaken json response is $jsonResponse");
  return jsonResponse['usernameExists'] ?? false;
}

Future<bool> isEmailTaken(String email) async {
  // for signUp
  final http.Response response = await http.get(
    Uri.parse(checkEmailUrl).replace(
      queryParameters: {'email': email},
    ),
  );
  if (response.statusCode == 200) {
    final responseJson = jsonDecode(response.body);
    AppLogger.d('responseJson of isEmailTaken is $responseJson');
    return responseJson['emailExists'] ?? false;
  } else {
    throw Exception(
        "Une erreur serveur a eu lieu lors de la verification de l'email.");
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
      throw "Ce courriel n'est pas enregistré.";
    } else if (!emailExists) {
      throw "Ce courriel n'est pas enregistré.";
    }
  } else {
    AppLogger.e(
        "Error in emailCheck : ${response.statusCode}  ${response.reasonPhrase}");
    throw "Une erreur est survenue ${response.reasonPhrase}";
  }
  return false;
}

Future<UserCredential> signInWithGoogle({bool isLogin = true}) async {
  await GoogleSignIn().signOut();

  GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();

  if (googleUser == null) {
    throw Exception("La connexion avec Google a été annulée.");
  }

  bool isTaken = await isEmailTaken(googleUser.email);
  if (!isLogin && isTaken) {
    throw Exception(
        "Ce email est déjà associé avec un compte. Veuillez choisir un autre email.");
  } else if (isLogin && !isTaken) {
    throw Exception(
        "Ce email n'est pas associé avec un compte. Veuillez créer un compte.");
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
