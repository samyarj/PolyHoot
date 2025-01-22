import 'package:client_leger/UI/coins/coins_page.dart';
import 'package:client_leger/UI/equipped/equipped_page.dart';
import 'package:client_leger/UI/play/creategamepage.dart';
import 'package:client_leger/UI/play/playbutton.dart';
import 'package:client_leger/UI/play/playpage.dart';
import 'package:client_leger/UI/quiz/quiz_page.dart';
import 'package:client_leger/UI/sidebar/sidebar.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _playShellNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter router = GoRouter(
  initialLocation: '/play',
  navigatorKey: _rootNavigatorKey,
  debugLogDiagnostics: true,
  routes: [
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
                onPressed: () => statefulNavigationShell.goBranch(0),  // Go to the Play branch (without clearing nav stack; saves the state!)
              ),
            ]),
            iconTheme: const IconThemeData(color: Colors.white),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit),
                iconSize: 34,
                onPressed: () => context.go('/quiz'),
              ),
              IconButton(
                icon: const Icon(Icons.backpack),
                iconSize: 34,
                onPressed: () => context.go('/equipped'),
              ),
              IconButton(
                icon: const Icon(Icons.attach_money),
                iconSize: 34,
                onPressed: () => context.go('/coins'),
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
              path: '/play',
              builder: (context, state) => const PlayPage(),
              routes: [
                GoRoute(
                  path: 'game_creation',
                  builder: (context, state) => const GameCreationPage(),
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/quiz',
              builder: (context, state) => const QuizPage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/equipped',
              builder: (context, state) => const EquippedPage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/coins',
              builder: (context, state) => const CoinsPage(),
            ),
          ],
        ),
      ],
    ),
  ],
);
