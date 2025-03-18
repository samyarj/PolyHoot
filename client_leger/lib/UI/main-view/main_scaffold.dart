import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/main-view/sidebar/sidebar.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
                          icon: Icon(Icons.backpack),
                          iconSize: 28,
                          color: colorScheme.tertiary,
                          onPressed: () => context.go(Paths.equipped),
                        ),
                        IconButton(
                          icon: Icon(Icons.attach_money),
                          iconSize: 28,
                          color: colorScheme.tertiary,
                          onPressed: () => context.go(Paths.coins),
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
                                }
                              },
                              itemBuilder: (context) => [
                                PopupMenuItem<int>(
                                  value: 1,
                                  child: Text(
                                    'Déconnexion',
                                    style:
                                        TextStyle(color: colorScheme.onSurface),
                                  ),
                                ),
                              ],
                              color: colorScheme.surface,
                              shadowColor: colorScheme.shadow,
                              offset: Offset(0, 48),
                              child: CircleAvatar(
                                radius: 22,
                                backgroundImage: user?.avatarEquipped != null
                                    ? NetworkImage(user!.avatarEquipped!)
                                    : AssetImage('assets/default-avatar.png')
                                        as ImageProvider,
                                backgroundColor: Colors.transparent,
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
        //),
        //),
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
