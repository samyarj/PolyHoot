import 'dart:async';
import 'dart:convert';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/user.dart' as user_model;
import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

// User state provider
final userProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<user_model.User?>>((ref) {
  return AuthNotifier();
});

// Login state provider (keeping ValueNotifier)
ValueNotifier<bool> isLoggedIn = ValueNotifier<bool>(false);

class AuthNotifier extends StateNotifier<AsyncValue<user_model.User?>> {
  StreamSubscription<DocumentSnapshot>? _userDocSubscription;
  AuthNotifier() : super(const AsyncValue.loading()) {
    fetchUser();
  }

  // Fetch user from API and setup listener
  Future<void> fetchUser() async {
    state = const AsyncValue.loading();
    try {
      AppLogger.d("Fetching user...");
      final firebaseUser = FirebaseAuth.instance.currentUser;

      AppLogger.d("Firebase user: $firebaseUser");
      if (firebaseUser == null) {
        state = const AsyncValue.data(null);
        WebSocketManager.instance.playerName = null;
        return;
      }

      if (await auth_service.isUserOnline(firebaseUser.email!)) {
        FirebaseAuth.instance.signOut();
        throw Exception("Cet utilisateur est déjà connecté.");
      }

      final idToken = await firebaseUser.getIdToken();
      final headers = {'Authorization': 'Bearer $idToken'};

      WebSocketManager.instance.initializeSocketConnection(idToken);

      WebSocketManager.instance
          .webSocketSender("identifyMobileClient", firebaseUser.uid);

      // Set up real-time listener for user document
      setupUserDocListener(firebaseUser.uid);

      // Mark user as online
      await FirebaseFirestore.instance
          .collection('users')
          .doc(firebaseUser.uid)
          .update({'isOnline': true});
    } catch (e, stack) {
      AppLogger.e("Error fetching user: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
      throw Exception(getCustomError(e));
    }
  }

  void setupUserDocListener(String uid) {
    // Cancel any existing subscription
    _userDocSubscription?.cancel();

    // Listen to the user document
    _userDocSubscription = FirebaseFirestore.instance
        .collection('users')
        .doc(uid)
        .snapshots()
        .listen((docSnapshot) async {
      if (docSnapshot.exists) {
        final userData = docSnapshot.data() as Map<String, dynamic>;
        final user = user_model.User.fromJson(userData);
        state = AsyncValue.data(user);
        isLoggedIn.value = true;
        WebSocketManager.instance.playerName = user.username;
        AppLogger.d("User data updated in real-time: ${user.username}");
      } else {
        throw Exception("User document not found in Firestore");
      }
    }, onError: (e, stack) {
      AppLogger.e("Error in Firestore user document listener: $e");
      state = AsyncValue.error(e, stack);
    });
  }

  // Create a new user
  Future<void> createAndFetchUser(
      UserCredential userCredential, String endpoint) async {
    state = const AsyncValue.loading();
    try {
      final idToken = await userCredential.user?.getIdToken();
      final headers = {'Authorization': 'Bearer $idToken'};

      final http.Response response =
          await http.post(Uri.parse(endpoint), headers: headers);

      if (response.statusCode == 201) {
        final userJson = jsonDecode(response.body);
        final user = user_model.User.fromJson(userJson);
        state = AsyncValue.data(user);
        isLoggedIn.value = true;
        WebSocketManager.instance.playerName = user.username;
        if (userCredential.user != null) {
          WebSocketManager.instance.initializeSocketConnection(idToken);

          WebSocketManager.instance.webSocketSender(
              "identifyMobileClient", userCredential.user!.uid);

          setupUserDocListener(userCredential.user!.uid);
        }
      } else {
        throw Exception("Failed to create user: ${response.reasonPhrase}");
      }
    } catch (e, stack) {
      AppLogger.e("Error creating user: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
      rethrow;
    }
  }

  Future<void> signIn(String identifier, String password) async {
    state = const AsyncValue.loading();
    try {
      AppLogger.d("Signing in...");
      final email = await auth_service.getEmailFromIdentifier(identifier);

      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final isOnline = await auth_service.isUserOnline(email);
      if (isOnline) throw Exception("Cet utilisateur est déjà connecté.");

      await fetchUser();
      isLoggedIn.value = true;
    } catch (e, stack) {
      AppLogger.e("Sign-in error: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
      throw Exception(getCustomError(e));
    }
  }

  Future<void> signUp(String username, String email, String password) async {
    state = const AsyncValue.loading();
    AppLogger.d("Signing up...");
    final userCredential =
        await FirebaseAuth.instance.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    try {
      await userCredential.user!.updateProfile(displayName: username);
      await createAndFetchUser(userCredential, auth_service.createUserUrl);
    } catch (e, stack) {
      AppLogger.e("Sign-up error: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
      await userCredential.user
          ?.delete(); // on annule la creation du compte avec FireBase
      rethrow;
    }
  }

  Future<void> signWithGoogle({bool isLogin = true}) async {
    state = const AsyncValue.loading();
    try {
      AppLogger.d("Signing in with Google...");
      final userCredential =
          await auth_service.signInWithGoogle(isLogin: isLogin);

      final isOnline =
          await auth_service.isUserOnline(userCredential.user!.email!);
      if (isOnline) throw Exception("Vous êtes déjà connecté ailleurs.");

      await fetchUser();
      isLoggedIn.value = true;
    } catch (e, stack) {
      AppLogger.e("Google sign-in error: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
      rethrow;
    }
  }

  Future<void> logout() async {
    state = const AsyncValue.loading();
    try {
      AppLogger.d("Logging out...");

      // Cancel the Firestore listener first
      _userDocSubscription?.cancel();
      _userDocSubscription = null;

      final currentUser = FirebaseAuth.instance.currentUser;

      if (currentUser != null) {
        try {
          // Try to update the online status, but don't fail if it doesn't work
          await FirebaseFirestore.instance
              .collection('users')
              .doc(currentUser.uid)
              .update({'isOnline': false}).timeout(
                  const Duration(seconds: 2)); // Add timeout
        } catch (e) {
          // Log the error but continue with logout
          AppLogger.w("Failed to update online status: $e");
        }
      }

      // Sign out regardless of whether the Firestore update succeeded
      await FirebaseAuth.instance.signOut();

      // Update state
      state = const AsyncValue.data(null);
      WebSocketManager.instance.playerName = null;
      isLoggedIn.value = false;
    } catch (e, stack) {
      AppLogger.e("Logout error: $e");

      // Even if there's an error, try to sign out and clean up state
      try {
        await FirebaseAuth.instance.signOut();
      } catch (_) {
        // Ignore any error here
      }

      state = const AsyncValue.data(null);
      WebSocketManager.instance.playerName = null;
      isLoggedIn.value = false;

      throw Exception(getCustomError(e));
    }
  }
}
