import 'dart:async';
import 'dart:convert';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/chat/firebase_chat_service.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/report/report_service.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/report/report_state.dart';
import 'package:client_leger/models/user.dart' as user_model;
import 'package:client_leger/push-notif-api/firebase_api_push_notif.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:toastification/toastification.dart';

// User state provider
final userProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<user_model.User?>>((ref) {
  return AuthNotifier();
});

// Login state provider (keeping ValueNotifier)
ValueNotifier<bool> isLoggedIn = ValueNotifier<bool>(false);

class AuthNotifier extends StateNotifier<AsyncValue<user_model.User?>> {
  StreamSubscription<DocumentSnapshot>? _userDocSubscription;
  StreamSubscription<User?>? _tokenSubscription;
  final ReportService _reportService = ReportService();
  final FirebaseChatService _firebaseChatService = FirebaseChatService();
  String? currentToken;
  final FirebasePushApi _firebasePushApi = FirebasePushApi();
  final _webSocketManager = WebSocketManager();

  AuthNotifier() : super(const AsyncValue.loading()) {
    fetchUser();
  }

  void listenToTokenChanges() {
    _tokenSubscription?.cancel();
    AppLogger.w("Declaring the token changes listener...");
    _tokenSubscription =
        FirebaseAuth.instance.idTokenChanges().listen((User? user) async {
      if (user != null) {
        // When the user is signed in or the token is refreshed
        final newToken = await user.getIdToken();
        currentToken = newToken;
        AppLogger.w(
            "current token has expired or user just signed in, will call initializeSocketConnection");
        _webSocketManager.initializeSocketConnection(currentToken, user.uid);
      }
    });
  }

  // Fetch user from API and setup listener
  Future<void> fetchUser() async {
    state = const AsyncValue.loading();
    try {
      AppLogger.d("Fetching user...");
      final firebaseUser = FirebaseAuth.instance.currentUser;

      if (firebaseUser == null) {
        state = const AsyncValue.data(null);
        _webSocketManager.playerName = null;
        return;
      }

      if (await auth_service.isUserOnline(firebaseUser.email!)) {
        FirebaseAuth.instance.signOut();
        throw Exception("Cet utilisateur est déjà connecté.");
      }

      listenToTokenChanges(); // it will call  connect socket

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
    _userDocSubscription?.cancel();

    _userDocSubscription = FirebaseFirestore.instance
        .collection('users')
        .doc(uid)
        .snapshots()
        .listen((docSnapshot) async {
      if (docSnapshot.exists) {
        final userData = docSnapshot.data() as Map<String, dynamic>;
        final user = user_model.User.fromJson(userData);
        state = AsyncValue.data(user);

        if (user.nbReport != _reportService.nbReport.value ||
            _reportService.nbReport.value == null) {
          AppLogger.w(
              "User report count changed: ${_reportService.nbReport.value} -> ${user.nbReport}");
          _reportService.nbReport.value = user.nbReport;
        }

        if (user.unBanDate != _reportService.unBanDate.value ||
            _reportService.unBanDate.value == null) {
          AppLogger.w(
              "User unban date changed: ${_reportService.unBanDate.value} -> ${user.unBanDate}");
          _reportService.unBanDate.value = user.unBanDate;
        }

        isLoggedIn.value = true;
        _webSocketManager.playerName = user.username;
        AppLogger.d("User data updated in real-time: ${user.username}");

        // for the chat notifs
      } else {
        throw Exception("User document not found in Firestore");
      }
    }, onError: (e, stack) {
      AppLogger.e("Error in Firestore user document listener: $e");
      state = AsyncValue.error(e, stack);
    });
  }

  // Create a new user sign up normal ET sign up with google
  Future<void> createAndFetchUser(
      UserCredential userCredential, String endpoint,
      {bool isLogin = false, String? body}) async {
    state = const AsyncValue.loading();
    try {
      final idToken = await userCredential.user?.getIdToken();
      final headers = {
        'Authorization': 'Bearer $idToken',
        'Content-Type': 'application/json',
      };
      final http.Response response;

      if (isLogin) {
        response = await http.post(Uri.parse(endpoint), headers: headers);
      } else {
        final fcmToken =
            await _firebasePushApi.onSignUp(userCredential.user?.uid ?? '');
        final body = jsonEncode({'fcmToken': fcmToken});
        response =
            await http.post(Uri.parse(endpoint), headers: headers, body: body);
      }

      if (response.statusCode == 201) {
        final userJson = jsonDecode(response.body);
        final user = user_model.User.fromJson(userJson);
        state = AsyncValue.data(user);
        isLoggedIn.value = true;
        _webSocketManager.playerName = user.username;

        if (userCredential.user != null) {
          listenToTokenChanges();
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

  Future<void> signIn(
      String identifier, String password, BuildContext context) async {
    state = const AsyncValue.loading();
    try {
      AppLogger.d("Signing in...");
      final email = await auth_service.getEmailFromIdentifier(identifier);

      final userCredential =
          await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final reportState = await isUserBanned(userCredential.user?.uid);

      if (reportState != null && reportState.isBanned) {
        await FirebaseAuth.instance.signOut();

        WidgetsBinding.instance.addPostFrameCallback((_) {
          showToast(
            context,
            reportState.message,
            type: ToastificationType.error,
            duration: const Duration(seconds: 5),
          );
        });

        state = const AsyncValue.data(null);

        return;
      }

      await fetchUser();
      isLoggedIn.value = true;
    } catch (e, stack) {
      AppLogger.e("Sign-in error: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
      throw Exception(getCustomError(e));
    }
  }

  Future<ReportState?> isUserBanned(String? uid) async {
    if (uid == null) {
      return null;
    }
    try {
      final reportState = await _reportService.getReportState(uid);
      return reportState;
    } catch (e) {
      AppLogger.e("Error fetching report state: $e");
      return ReportState(isBanned: false, message: "");
    }
  }

  Future<void> signUp(
      String username, String email, String password, String? avatarURL) async {
    state = const AsyncValue.loading();
    AppLogger.d("Signing up...");
    final userCredential =
        await FirebaseAuth.instance.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    try {
      await userCredential.user!.updateProfile(displayName: username);

      // Create body with FCM token and avatar URL
      final fcmToken =
          await _firebasePushApi.onSignUp(userCredential.user?.uid ?? '');
      final body = jsonEncode({
        'fcmToken': fcmToken,
        'avatarURL': avatarURL, // Add this line
      });

      await createAndFetchUser(userCredential, auth_service.createUserUrl,
          body: body);
    } catch (e, stack) {
      AppLogger.e("Sign-up error: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
      await userCredential.user?.delete();
      rethrow;
    }
  }

  Future<void> signWithGoogle(
      {bool isLogin = true, BuildContext? context}) async {
    state = const AsyncValue.loading();
    try {
      AppLogger.d("Signing in with Google...");

      final userCredential =
          await auth_service.signInWithGoogle(isLogin: isLogin);

      if (isLogin && context != null) {
        final reportState = await isUserBanned(userCredential.user?.uid);

        if (reportState != null && reportState.isBanned) {
          AppLogger.w(
              "User is banned: ${reportState.message}, will terminate sign in process");
          WidgetsBinding.instance.addPostFrameCallback((_) async {
            await FirebaseAuth.instance.signOut();
            await GoogleSignIn().signOut();
            showToast(
              context,
              reportState.message,
              type: ToastificationType.error,
              duration: const Duration(seconds: 5),
            );
          });
          state = const AsyncValue.data(null);

          return;
        }
      }

      if (isLogin && userCredential.user?.email != null) {
        final bool isOnline =
            await auth_service.isUserOnline(userCredential.user!.email!);
        if (isOnline) throw Exception("Vous êtes déjà connecté ailleurs.");
      }

      if (!isLogin) {
        AppLogger.d("about to update profile");
        await userCredential.user!
            .updateProfile(displayName: userCredential.user?.displayName);
      }

      // attention, si le compte existe déjà, le backend ne va pas créer un nouveau user et le fcm ne sera pas écrit dans la bd
      await createAndFetchUser(userCredential, auth_service.googleSignInUrl,
          isLogin: isLogin);
    } catch (e, stack) {
      AppLogger.e("Google sign-in error: $e");
      state = AsyncValue.error(e, stack);
      isLoggedIn.value = false;
      rethrow;
    }
  }

  Future<bool> updateUsername(String newUsername) async {
    try {
      //state = const AsyncValue.loading();

      // Get current Firebase user
      final currentUser = FirebaseAuth.instance.currentUser;
      AppLogger.w('Current user: $currentUser');
      if (currentUser == null) {
        throw Exception('User not authenticated');
      }

      // First update Firebase Auth display name
      await currentUser.updateDisplayName(newUsername);

      // Get a fresh ID token
      final token = await currentUser.getIdToken();
      AppLogger.w('ID token: $token');

      // Then update Firestore through backend
      final response = await http.patch(
        Uri.parse(auth_service.updateUserNameUrl),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json'
        },
        body: jsonEncode({'username': newUsername}),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        throw Exception(jsonDecode(response.body)['message'] ??
            'Failed to update username');
      }
    } catch (e) {
      AppLogger.e('Error updating username: ${e.toString()}');

      if (state is! AsyncError) {
        state = AsyncError(getCustomError(e), StackTrace.current);
      }

      throw Exception(getCustomError(e));
    }
  }

  Future<void> logout() async {
    state = const AsyncValue.loading();
    try {
      AppLogger.d("Logging out...");

      // Cancel the Firestore listener first
      _userDocSubscription?.cancel();
      _userDocSubscription = null;
      _tokenSubscription?.cancel();
      _tokenSubscription = null;
      currentToken = null;

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
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        await FirebaseAuth.instance.signOut();
      });

      // Update state
      state = const AsyncValue.data(null);
      _webSocketManager.disconnectFromSocket();
      isLoggedIn.value = false;
      _reportService.resetParam();
      _firebaseChatService.clearUserDetailsCache();
    } catch (e, stack) {
      AppLogger.e("Logout error: $e");

      // Even if there's an error, try to sign out and clean up state
      try {
        WidgetsBinding.instance.addPostFrameCallback((_) async {
          await FirebaseAuth.instance.signOut();
        });
      } catch (_) {
        // Ignore any error here
      }

      state = const AsyncValue.data(null);
      _webSocketManager.disconnectFromSocket();
      isLoggedIn.value = false;
      _reportService.resetParam();
      _firebaseChatService.clearUserDetailsCache();

      throw Exception(getCustomError(e));
    }
  }
}
