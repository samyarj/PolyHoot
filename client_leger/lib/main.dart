import 'package:client_leger/UI/router/router.dart';
import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/push-notif-api/firebase_api_push_notif.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:toastification/toastification.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
    await FirebasePushApi().initNotifications();
    AppLogger.i("Firebase initialized");
  } catch (e) {
    AppLogger.e("Firebase initialization failed: $e");
  }

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  await initializeDateFormatting('fr_CA', null);

  runApp(
    ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ref.watch(themeProvider);

    return ToastificationWrapper(
      child: MaterialApp.router(
        title: 'PolyHoot',
        theme: theme,
        routerConfig: router,
      ),
    );
  }
}
