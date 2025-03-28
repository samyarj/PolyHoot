import 'package:client_leger/UI/admin/admin-home-page.dart';
import 'package:client_leger/UI/admin/admin-users-page.dart';
import 'package:client_leger/UI/coins/coins_page.dart';
import 'package:client_leger/UI/equipped/equipped_page.dart';
import 'package:client_leger/UI/forgot-password/password_reset_page.dart';
import 'package:client_leger/UI/inventory/inventory_page.dart';
import 'package:client_leger/UI/login/login_page.dart';
import 'package:client_leger/UI/luck/luck_page.dart';
import 'package:client_leger/UI/main-view/admin-scaffold.dart';
import 'package:client_leger/UI/main-view/main_scaffold.dart';
import 'package:client_leger/UI/play/pages/creategamepage.dart';
import 'package:client_leger/UI/play/pages/join_game.dart';
import 'package:client_leger/UI/play/pages/organizer_game_page.dart';
import 'package:client_leger/UI/play/pages/player_game_page.dart';
import 'package:client_leger/UI/play/pages/playpage.dart';
import 'package:client_leger/UI/play/pages/result_page.dart';
import 'package:client_leger/UI/play/pages/waiting_page.dart';
import 'package:client_leger/UI/profile/profile_page.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/UI/shop/shop-page.dart';
import 'package:client_leger/UI/signup/signup_page.dart';
import 'package:client_leger/UI/user-statistics/game-logs-page.dart';
import 'package:client_leger/UI/user-statistics/user-stats-logs-page.dart';
import 'package:client_leger/backend-communication-services/report/report_service.dart';
import 'package:client_leger/models/player_data.dart';
import 'package:client_leger/providers/play/game_player_provider.dart';
import 'package:client_leger/providers/play/join_game_provider.dart';
import 'package:client_leger/providers/play/waiting_page_provider.dart';
import 'package:client_leger/providers/user_provider.dart' as user_provider;
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>();
final _playShellNavigatorKey = GlobalKey<NavigatorState>();
final _adminShellNavigatorKey = GlobalKey<NavigatorState>();
final ReportService _reportService = ReportService();

final GoRouter router = GoRouter(
  refreshListenable: Listenable.merge([
    user_provider.isLoggedIn,
    _reportService.nbReport,
  ]),
  initialLocation: Paths.play,
  navigatorKey: rootNavigatorKey,
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

    // User routes inside MainScaffold
    StatefulShellRoute.indexedStack(
      parentNavigatorKey: rootNavigatorKey,
      builder: (context, state, statefulNavigationShell) {
        return MainScaffold(statefulNavigationShell: statefulNavigationShell);
      },
      branches: [
        StatefulShellBranch(
          navigatorKey: _playShellNavigatorKey,
          routes: [
            GoRoute(
                path: Paths.profile,
                builder: (context, state) {
                  return ProfilePage();
                }),
            GoRoute(
                path: Paths.userStats,
                builder: (context, state) {
                  return UserStatsAndLogsPage();
                }),
            GoRoute(
                path: Paths.gamesLogs,
                builder: (context, state) {
                  return GameLogsPage();
                }),
            GoRoute(
              path: Paths.play,
              builder: (context, state) => const PlayPage(),
              routes: [
                GoRoute(
                  path: Paths.gameCreation,
                  builder: (context, state) => const GameCreationPage(),
                ),
                GoRoute(
                  path: Paths.joinGame,
                  builder: (context, state) => JoinGame(),
                  onExit: (context, state) {
                    final container = ProviderScope.containerOf(context);
                    container.read(joinGameProvider.notifier).dispose();
                    return true;
                  },
                ),
                GoRoute(
                  path: Paths.waitingPage,
                  builder: (context, state) => WaitingPage(),
                  onExit: (context, state) async {
                    final container = ProviderScope.containerOf(context);
                    container.read(waitingPageProvider.notifier).dispose();
                    return true;
                  },
                ),
                GoRoute(
                  path: Paths.playerVue,
                  builder: (context, state) => const PlayerGamePage(),
                  onExit: (context, state) async {
                    AppLogger.i(
                        "onExit of PlayerGamePage: gameClientProvider will be disposed");
                    final container = ProviderScope.containerOf(context);
                    container.read(gameClientProvider.notifier).dispose();
                    return true;
                  },
                ),
                GoRoute(
                  path: Paths.organizerVue,
                  builder: (context, state) => const OrganizerGamePage(),
                ),
                GoRoute(
                  path: Paths.resultsView,
                  builder: (context, state) {
                    final playerList = state.extra as List<PlayerData>;
                    return ResultsPage(playerList: playerList);
                  },
                )
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: Paths.luck,
              builder: (context, state) => const LuckPage(),
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
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: Paths.inventory,
              builder: (context, state) => const InventoryPage(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: Paths.shop,
              builder: (context, state) => const ShopPage(),
            ),
          ],
        ),
      ],
    ),

    // Admin routes inside AdminScaffold
    StatefulShellRoute.indexedStack(
      parentNavigatorKey: rootNavigatorKey,
      builder: (context, state, statefulNavigationShell) {
        return AdminScaffold(statefulNavigationShell: statefulNavigationShell);
      },
      branches: [
        StatefulShellBranch(
          navigatorKey: _adminShellNavigatorKey,
          routes: [
            GoRoute(
              path: Paths.adminHome,
              builder: (context, state) => const AdminHomePage(),
            ),
            GoRoute(
              path: Paths.adminUsers,
              builder: (context, state) => const AdminUsersPage(),
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
        "IN REDIRECT loggedIn = $loggedIn and loggingIn = $loggingIn and isLoggedIn = ${user_provider.isLoggedIn.value} and state.matchedlocation = ${state.matchedLocation}");

    if (!loggedIn && !loggingIn) return Paths.logIn;

    if (loggedIn) {
      // Get the current user
      final containerRef = ProviderScope.containerOf(context);
      final currentUserState = containerRef.read(user_provider.userProvider);

      if (_reportService.nbReport.value != null &&
          _reportService.nbReport.value! > 2) {
        AppLogger.e("User has been reported more than 2 times");
        _reportService.behaviourWarning(context);
        final reportState =
            await _reportService.getReportState(currentUserState.value?.uid);
        if (reportState != null && reportState.isBanned) {
          _reportService.banInfo(reportState.message, context);
          WidgetsBinding.instance.addPostFrameCallback((_) {
            containerRef.read(user_provider.userProvider.notifier).logout();
          });
        }
      }

      final isAdmin = currentUserState.value?.role == 'admin';

      // Check if admin is trying to access normal user routes or vice versa
      final isAdminRoute = state.matchedLocation.startsWith(Paths.adminHome) ||
          state.matchedLocation.startsWith(Paths.adminUsers);

      if (loggingIn) {
        // Redirect to appropriate home after login
        return isAdmin ? Paths.adminHome : Paths.play;
      }

      // If admin trying to access user routes, redirect to admin home
      if (isAdmin &&
          !isAdminRoute &&
          !state.matchedLocation.startsWith('/admin')) {
        return Paths.adminHome;
      }

      // If user trying to access admin routes, redirect to user home
      if (!isAdmin && isAdminRoute) {
        return Paths.play;
      }
    }

    return null;
  },
);
