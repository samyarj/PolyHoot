import 'package:client_leger/UI/coins/coins_page.dart';
import 'package:client_leger/UI/equipped/equipped_page.dart';
import 'package:client_leger/UI/login/login_page.dart';
import 'package:client_leger/UI/play/creategamepage.dart';
import 'package:client_leger/UI/play/playbutton.dart';
import 'package:client_leger/UI/play/playpage.dart';
import 'package:client_leger/UI/quiz/quiz_page.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/UI/sidebar/sidebar.dart';
import 'package:client_leger/UI/signup/signup_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _playShellNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter router = GoRouter(
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
    StatefulShellRoute.indexedStack(
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state, statefulNavigationShell) {
        return Scaffold(
          appBar: AppBar(
            flexibleSpace: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF00115A), Color(0xFF004080)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
              ),
            ),
            title: Row(children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Image.asset(
                  'assets/logo.png',
                  width: 50,
                  height: 50,
                ),
              ),
              PlayButton(
                onPressed: () => statefulNavigationShell.goBranch(
                    0), // Go to the Play branch (without clearing nav stack; saves the state!)
              ),
            ]),
            iconTheme: const IconThemeData(color: Colors.white),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit),
                iconSize: 34,
                onPressed: () => context.go(Paths.quiz),
              ),
              IconButton(
                icon: const Icon(Icons.backpack),
                iconSize: 34,
                onPressed: () => context.go(Paths.equipped),
              ),
              IconButton(
                icon: const Icon(Icons.attach_money),
                iconSize: 34,
                onPressed: () => context.go(Paths.coins),
              ),
              IconButton(
                icon: const Icon(Icons.logout),
                iconSize: 34,
                onPressed: () => auth_service.logout(),
              ),
            ],
          ),
          body: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: statefulNavigationShell),
              const SideBar(),
            ],
          ),
        );
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
        !auth_service.isLoggedInElsewhere;
    final bool loggingIn = state.matchedLocation == Paths.logIn ||
        state.matchedLocation == Paths.signUp;
    if (!loggedIn) {
      if (state.matchedLocation == Paths.signUp) return null;
      return Paths.logIn;
    }
    if (loggingIn) return Paths.play;
    return null;
  },
);
