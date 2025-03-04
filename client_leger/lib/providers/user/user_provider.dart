import 'dart:convert';

import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;
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
  AuthNotifier() : super(const AsyncValue.loading()) {
    fetchUser();
  }

  // Fetch user from API
  Future<void> fetchUser() async {
    try {
      AppLogger.d("Fetching user...");
      final firebaseUser = FirebaseAuth.instance.currentUser;

      AppLogger.d("Firebase user: $firebaseUser");
      if (firebaseUser == null) {
        state = const AsyncValue.data(null);
        return;
      }
      if (await auth_service.isUserOnline(firebaseUser.email!)) {
        FirebaseAuth.instance.signOut();
        throw Exception("Cet utilisateur est déjà connecté.");
      }

      final idToken = await firebaseUser.getIdToken();
      final headers = {'Authorization': 'Bearer $idToken'};

      final http.Response response = await http
          .get(Uri.parse(auth_service.getProfileUrl), headers: headers);

      if (response.statusCode == 200) {
        final userJson = jsonDecode(response.body);
        final user = user_model.User.fromJson(userJson);
        state = AsyncValue.data(user);
        isLoggedIn.value = true;
      } else {
        throw Exception('Server error: ${response.reasonPhrase}');
      }
    } catch (e, stack) {
      AppLogger.e("Error fetching user: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
      throw Exception(getCustomError(e));
    }
  }

  // Create a new user
  Future<void> createAndFetchUser(
      UserCredential userCredential, String endpoint) async {
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
      } else {
        throw Exception("Failed to create user: ${response.reasonPhrase}");
      }
    } catch (e, stack) {
      AppLogger.e("Error creating user: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
    }
  }

  Future<void> signIn(String identifier, String password) async {
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
    try {
      AppLogger.d("Signing up...");
      final userCredential =
          await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      await userCredential.user!.updateProfile(displayName: username);
      await createAndFetchUser(userCredential, auth_service.createUserUrl);
    } catch (e, stack) {
      AppLogger.e("Sign-up error: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
    }
  }

  Future<void> signWithGoogle({bool isLogin = true}) async {
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
    }
  }

  Future<void> logout() async {
    try {
      AppLogger.d("Logging out...");
      final currentUser = FirebaseAuth.instance.currentUser;

      if (currentUser != null) {
        await FirebaseFirestore.instance
            .collection('users')
            .doc(currentUser.uid)
            .update({'isOnline': false});
      }

      await FirebaseAuth.instance.signOut();
      state = const AsyncValue.data(null);
      isLoggedIn.value = false;
    } catch (e, stack) {
      AppLogger.e("Logout error: $e");
      state = AsyncValue.error(e, stack);
      throw Exception(getCustomError(e));
    }
  }
}
