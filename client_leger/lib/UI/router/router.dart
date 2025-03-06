import 'package:client_leger/UI/coins/coins_page.dart';
import 'package:client_leger/UI/equipped/equipped_page.dart';
import 'package:client_leger/UI/forgot-password/password_reset_page.dart';
import 'package:client_leger/UI/login/login_page.dart';
import 'package:client_leger/UI/main-view/main_scaffold.dart';
import 'package:client_leger/UI/play/creategamepage.dart';
import 'package:client_leger/UI/play/playpage.dart';
import 'package:client_leger/UI/quiz/quiz_page.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/UI/signup/signup_page.dart';
import 'package:client_leger/providers/user/user_provider.dart'
    as user_provider;
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _playShellNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter router = GoRouter(
  refreshListenable: user_provider.isLoggedIn,
  initialLocation: Paths.play,
  navigatorKey: _rootNavigatorKey,
  debugLogDiagnostics: true,
  routes: [
    GoRoute(
      path: Paths.logIn,
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: Paths.signUp,
      builder: (context, state) => const SignUpPage(),
    ),
    GoRoute(
      path: Paths.passwordReset,
      builder: (context, state) => const PasswordResetPage(),
    ),
    StatefulShellRoute.indexedStack(
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state, statefulNavigationShell) {
        return MainScaffold(statefulNavigationShell: statefulNavigationShell);
      },
      branches: [
        StatefulShellBranch(
          navigatorKey: _playShellNavigatorKey,
          routes: [
            GoRoute(
              path: Paths.play,
              builder: (context, state) => const PlayPage(),
              routes: [
                GoRoute(
                  path: Paths.gameCreation,
                  builder: (context, state) => const GameCreationPage(),
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: Paths.quiz,
              builder: (context, state) => const QuizPage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: Paths.equipped,
              builder: (context, state) => const EquippedPage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: Paths.coins,
              builder: (context, state) => const CoinsPage(),
            ),
          ],
        ),
      ],
    ),
  ],
  redirect: (BuildContext context, GoRouterState state) async {
    final bool loggedIn = FirebaseAuth.instance.currentUser != null &&
        !FirebaseAuth.instance.currentUser!.isAnonymous &&
        user_provider.isLoggedIn.value;
    final bool loggingIn = state.matchedLocation == Paths.logIn ||
        state.matchedLocation == Paths.signUp ||
        state.matchedLocation == Paths.passwordReset;

    AppLogger.d(
        "IN REDIRECT loggedIn = $loggedIn and loggingIn = $loggingIn  and isLoggedIn = ${user_provider.isLoggedIn.value} and state.matchedlocation = ${state.matchedLocation}");

    if (!loggedIn && !loggingIn) return Paths.logIn;
    if (loggedIn && loggingIn) return Paths.play;
    return null;
  },
);
