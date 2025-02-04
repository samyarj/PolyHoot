import 'dart:async';
import 'dart:convert';
import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;
import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
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
  final idToken = await userCredential.user?.getIdToken();
  final headers = {
    'Authorization': 'Bearer $idToken',
  };

  final http.Response response = await http.get(Uri.parse(getProfileUrl),
      headers: headers); // it puts isOnline: true

  if (response.statusCode == 200) {
    final userJson = jsonDecode(response.body);
    try {
      currentSignedInUserCompleter.complete(user_model.User.fromJson(userJson));
    } catch (e) {
      AppLogger.e("Error while parsing userJson: $e");
      throw Exception(
          "Une erreur est survenue en essayant de traiter l'utilisateur courant");
    }
    return currentSignedInUser;
  } else {
    throw Exception(
        'Une erreur est survenue au niveau du serveur : ${response.reasonPhrase}');
  }
}

Future<user_model.User?> createAndFetchUser(
    UserCredential userCredential, String endpoint) async {
  // with email or Google
  AppLogger.d("in createAndFetchUser");

  final idToken = await userCredential.user?.getIdToken();

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
      throw Exception(
          "Une erreur est survenue en essayant de traiter l'utilisateur courant");
    }

    return currentSignedInUser;
  } else {
    AppLogger.e(
        "Failed to fetch/create user: ${response.reasonPhrase} ${response.statusCode}");
    throw Exception(
        "Une erreur serveur est survenue lors de la création de l'utilisateur");
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

  try {
    await userCredential.user!.updateProfile(displayName: username);

    final user = await createAndFetchUser(userCredential, createUserUrl);

    AppLogger.d("About to refresh the listenable");
    isLoggedIn.value = true;
    return user;
  } catch (e) {
    await userCredential.user
        ?.delete(); // on annule la creation du compte avec FireBase
    rethrow;
  }
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

  if (response.statusCode != 200) {
    throw Exception(
        "Une erreur serveur est survenue lors de la récupération de l'email à partir de l'identifiant.");
  }

  final jsonResponse = jsonDecode(response.body);

  return jsonResponse['email'];
}

Future<user_model.User?> signIn(String identifier, String password) async {
  AppLogger.d("in signIn");

  try {
    final email = await getEmailFromIdentifier(identifier);

    final userCredential =
        await FirebaseAuth.instance.signInWithEmailAndPassword(
      email: email,
      password: password,
    );

    final isOnline = await isUserOnline(email);

    if (isOnline) {
      AppLogger.e("Cet utilisateur est déjà connecté.");
      throw Exception('Cet utilisateur est déjà connecté.');
    }

    final user = await fetchUser(userCredential);
    AppLogger.d("About to change the listenable");
    isLoggedIn.value = true;
    return user;
  } catch (e) {
    await FirebaseAuth.instance.signOut();
    AppLogger.e("Erreur de sign in : ${e.toString()}");
    throw Exception(getCustomError(e));
  }
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

Future<void> logout() async {
  try {
    AppLogger.d("in logout");

    User? currentUser = FirebaseAuth.instance.currentUser;

    if (currentUser == null) {
      throw Exception("Utilisateur courant non identifié.");
    }

    await FirebaseFirestore.instance
        .collection('users')
        .doc(currentUser.uid)
        .update({'isOnline': false});

    await FirebaseAuth.instance.signOut();
  } catch (e) {
    throw Exception(getCustomError(e));
  } finally {
    isLoggedIn.value = false;
    currentSignedInUserCompleter = Completer<user_model.User>();
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
