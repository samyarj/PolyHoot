import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/UI/main-view/sidebar/sidebar.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/svg-pics/svg_constants.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';

class MainScaffold extends ConsumerStatefulWidget {
  const MainScaffold({super.key, required this.statefulNavigationShell});

  final StatefulNavigationShell statefulNavigationShell;

  @override
  ConsumerState<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends ConsumerState<MainScaffold> {
  bool _isLoggingOut = false;
  final double sidebarWidth = 400;

  _logout() async {
    if (_isLoggingOut) return;

    setState(() {
      _isLoggingOut = true;
    });

    try {
      WebSocketManager.instance.disconnectFromSocket();

      if (mounted) {
        isLoggedIn.value = false;

        context.go(Paths.logIn);

        Future.delayed(Duration(milliseconds: 100), () {
          ref.read(userProvider.notifier).logout();
        });
      }
    } catch (e) {
      if (!mounted) return;
      showErrorDialog(context, e.toString());
    } finally {
      if (!mounted) return;
      setState(() {
        _isLoggingOut = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userProvider);

    final colorScheme = Theme.of(context).colorScheme;
    return userState.when(data: (user) {
      return Scaffold(
        appBar: PreferredSize(
          preferredSize: Size.fromHeight(kToolbarHeight),
          child: Container(
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: colorScheme.secondary,
                  width: 1.5,
                ),
              ),
            ),
            child: AppBar(
              automaticallyImplyLeading: false,
              flexibleSpace: Container(
                color: colorScheme.primary,
              ),
              title: Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        // Logo
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Image.asset(
                            'assets/logo.png',
                            width: 40,
                            height: 40,
                          ),
                        ),

                        TextButton(
                          onPressed: () => GoRouter.of(context)
                              .go('${Paths.play}/${Paths.joinGame}'),
                          style: TextButton.styleFrom(
                            foregroundColor: colorScheme.tertiary,
                            padding: EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                          ),
                          child: Text(
                            'Jouer',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),

                        SizedBox(
                          height: 24,
                          child: VerticalDivider(
                            color: colorScheme.onPrimary.withValues(alpha: 0.5),
                            thickness: 3,
                            width: 1,
                          ),
                        ),

                        TextButton(
                          onPressed: () => GoRouter.of(context).go(Paths.play),
                          style: TextButton.styleFrom(
                            foregroundColor: colorScheme.tertiary,
                            padding: EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                          ),
                          child: Text(
                            'Accueil',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),

                        Spacer(),
                        IconButton(
                          icon: Icon(Icons.person),
                          iconSize: 28,
                          color: colorScheme.tertiary,
                          onPressed: () => {},
                        ),
                        IconButton(
                          icon: Icon(FontAwesomeIcons.clover),
                          iconSize: 28,
                          color: colorScheme.tertiary,
                          onPressed: () => context.go(Paths.luck),
                        ),
                        IconButton(
                          icon: SizedBox(
                            width: 34,
                            height: 34,
                            child: SvgPicture.string(
                              getInventorySvg(),
                              colorFilter: ColorFilter.mode(
                                  colorScheme.tertiary, BlendMode.srcIn),
                            ),
                          ),
                          color: colorScheme.tertiary,
                          onPressed: () => context.go(Paths.inventory),
                        ),
                        IconButton(
                          icon: Icon(FontAwesomeIcons.sackDollar),
                          iconSize: 28,
                          color: colorScheme.tertiary,
                          onPressed: () => context.go(Paths.shop),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: sidebarWidth - 20,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            PopupMenuButton<int>(
                              onSelected: (value) {
                                if (value == 1) {
                                  _logout();
                                } else if (value == 2) {
                                  GoRouter.of(context).go(Paths.profile);
                                } else if (value == 3) {
                                  GoRouter.of(context).go(Paths.userStats);
                                } else if (value == 4) {
                                  GoRouter.of(context).go(Paths.gamesLogs);
                                }
                              },
                              itemBuilder: (context) => [
                                PopupMenuItem<int>(
                                  enabled: false,
                                  height: 80,
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 8, horizontal: 16),
                                  child: SizedBox(
                                    width: 180,
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        AvatarBannerWidget(
                                          avatarUrl: user?.avatarEquipped,
                                          bannerUrl: user?.borderEquipped,
                                          size: 48,
                                          avatarFit: BoxFit.cover,
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          user?.username ?? 'Username',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: colorScheme.onSurface,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                          maxLines: 1,
                                        ),
                                        Text(
                                          user?.email ?? 'email@example.com',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: colorScheme.onSurface
                                                .withValues(alpha: 0.7),
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                          maxLines: 1,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),

                                // Divider
                                PopupMenuItem<int>(
                                  enabled: false,
                                  height: 1,
                                  padding: EdgeInsets.zero,
                                  child: Divider(
                                      height: 1,
                                      color: colorScheme.onSurface
                                          .withValues(alpha: 0.2)),
                                ),
                                // Regular menu items
                                PopupMenuItem<int>(
                                  value: 2,
                                  child: Text(
                                    'Modifier le profil',
                                    style: TextStyle(
                                        color: colorScheme.onSurface,
                                        fontSize: 16),
                                  ),
                                ),
                                PopupMenuItem<int>(
                                  value: 3,
                                  child: Text(
                                    'Mes statistiques & Logs',
                                    style: TextStyle(
                                        color: colorScheme.onSurface,
                                        fontSize: 16),
                                  ),
                                ),
                                PopupMenuItem<int>(
                                  value: 4,
                                  child: Text(
                                    'Historique des parties',
                                    style: TextStyle(
                                        color: colorScheme.onSurface,
                                        fontSize: 16),
                                  ),
                                ),
                                PopupMenuItem<int>(
                                  value: 1,
                                  child: Text(
                                    'Déconnexion',
                                    style: TextStyle(
                                        color: colorScheme.onSurface,
                                        fontSize: 16),
                                  ),
                                ),
                              ],
                              color: colorScheme.surface,
                              shadowColor: colorScheme.shadow,
                              position: PopupMenuPosition.under,
                              offset: Offset(175, 6.5),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: AvatarBannerWidget(
                                avatarUrl: user?.avatarEquipped,
                                bannerUrl: user?.borderEquipped,
                                size: 44,
                                avatarFit: BoxFit.cover,
                              ),
                            ),
                            SizedBox(width: 10),
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user?.username ?? 'Guest',
                                  style: TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                    color: colorScheme.onPrimary,
                                  ),
                                ),
                                Text(
                                  'Coins: ${user?.coins ?? 0}',
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: colorScheme.onPrimary,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(width: 8),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 16.0),
                          child: IconButton(
                            icon: Icon(Icons.notifications),
                            iconSize: 28,
                            color: colorScheme.tertiary,
                            onPressed: () {},
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              iconTheme: IconThemeData(color: colorScheme.onPrimary),
            ),
          ),
        ),
        body: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: widget.statefulNavigationShell),
            SizedBox(width: sidebarWidth, child: SideBar(user: user)),
          ],
        ),
      );
    }, loading: () {
      return Scaffold(
        body: Center(
          child: ThemedProgressIndicator(),
        ),
      );
    }, error: (error, stack) {
      return Scaffold(
        body: Center(
          child: Text('Error: $error'),
        ),
      );
    });
  }
}
