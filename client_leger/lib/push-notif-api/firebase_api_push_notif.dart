import 'dart:async';
import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

/*
Since the handler runs in its own isolate outside your applications context, 
it is not possible to update application state or execute any UI impacting logic. 
You can, however, perform logic such as HTTP requests, perform IO operations (e.g. updating local storage), 
communicate with other plugins etc.
*/
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  //  await Firebase.initializeApp();

  AppLogger.w("Handling a background message: ${message.messageId}");
  AppLogger.w("Title: ${message.notification?.title}");
  AppLogger.w("Body: ${message.notification?.body}");
  AppLogger.w("Payload: ${message.data}");
}

class FirebasePushApi {
  static final FirebasePushApi _instance = FirebasePushApi._();

  // Private constructor to prevent external instantiation
  FirebasePushApi._();

  factory FirebasePushApi() {
    return _instance;
  }

  final _firebaseMessaging = FirebaseMessaging.instance;

  String _fcmToken =
      ''; // représente le fcmToken actuel dans la BD, unique par dispositif (et non par utilisateur)

  get fcmToken {
    return _fcmToken;
  }

  String currentUserId = '';

  StreamSubscription<String>? _fcmTokenSubscription;

  Future<String> onSignUp(String userUid) async {
    // backend will write the fcmToken in the database
    currentUserId = userUid;
    _fcmToken = await _firebaseMessaging.getToken() ?? '';
    return _fcmToken;
  }

  Future<void> onLogin() async {
    final newFcmToken = await _firebaseMessaging.getToken() ?? '';
    await setAndSaveFcmToken(newFcmToken);
    setupFcmTokenListener();
  }

  setAndSaveFcmToken(String newFcmToken) async {
    String userId = FirebaseAuth.instance.currentUser?.uid ?? '';
    if (userId.isNotEmpty &&
        (newFcmToken != _fcmToken || currentUserId != userId)) {
      AppLogger.w("Setting FCM token to: $newFcmToken for userId: $userId");
      _fcmToken = newFcmToken;
      currentUserId = userId;
      try {
        await FirebaseFirestore.instance
            .collection('users')
            .doc(userId)
            .update({
          'fcmToken': newFcmToken,
        });
      } catch (e) {
        AppLogger.e("Error updating FCM token in Firestore: $e");
      }
    }
  }

// so that the server always has access to up-to-date fcmToken to send push notifications
  void setupFcmTokenListener() {
    if (_fcmTokenSubscription != null) return;
    AppLogger.w("Setting up FCM token listener");
    _fcmTokenSubscription =
        FirebaseMessaging.instance.onTokenRefresh.listen((newFCMToken) async {
      AppLogger.w("FCM token refreshed to: $newFCMToken");
      await setAndSaveFcmToken(newFCMToken);
    });
  }

  Future<void> initNotifications() async {
    // returns if app notifications are enabled or disabled by the OS
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: true,
      sound: true,
    );

    AppLogger.w('User granted permission: ${settings.authorizationStatus}');

    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }
}
