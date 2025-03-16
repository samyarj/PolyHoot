import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/main-view/sidebar/sidebar.dart';
import 'package:client_leger/UI/play/widgets/playbutton.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class MainScaffold extends ConsumerStatefulWidget {
  const MainScaffold({super.key, required this.statefulNavigationShell});

  final StatefulNavigationShell statefulNavigationShell;

  @override
  ConsumerState<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends ConsumerState<MainScaffold> {
  bool _isLoggingOut = false;

  @override
  void initState() {
    WebSocketManager.instance.initializeSocketConnection();
    super.initState();
  }

  _logout() async {
    if (_isLoggingOut) return;

    setState(() {
      _isLoggingOut = true;
    });

    try {
      // Disconnect socket first
      WebSocketManager.instance.disconnectFromSocket();

      // Navigate first, *then* logout
      // This ensures we're completely off the page before state changes
      if (mounted) {
        // First set the flag to prevent rebuilds
        isLoggedIn.value = false;

        // Direct navigation override to login page
        context.go(Paths.logIn);

        // Use a slightly delayed logout to ensure navigation completes
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
      if (user != null) {
        WebSocketManager.instance
            .webSocketSender("identifyMobileClient", user.uid);
      }

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
              onPressed: () => widget.statefulNavigationShell.goBranch(
                  0), // Go to the Play branch (without clearing nav stack; saves the state!)
            ),
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
            Spacer(),
            IconButton(
              icon: const Icon(Icons.notifications),
              iconSize: 34,
              onPressed: () => {},
            ),
            const SizedBox(width: 200),
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: PopupMenuButton<int>(
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
                      style: TextStyle(
                          color: Theme.of(context)
                              .colorScheme
                              .onSurface), // Dynamic text color
                    ),
                  ),
                ],
                color: Theme.of(context)
                    .colorScheme
                    .surface, // Dynamic background color
                shadowColor: Theme.of(context)
                    .colorScheme
                    .shadow, // Dynamic shadow color
                offset: Offset(0, 48),
                child: CircleAvatar(
                  radius: 23,
                  backgroundImage: user?.avatarEquipped != null
                      ? NetworkImage(user!.avatarEquipped!)
                      : AssetImage('assets/default-avatar.png'),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              user?.username ?? 'Guest',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ]),
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: widget.statefulNavigationShell),
            SizedBox(width: 400, child: SideBar(user: user)),
          ],
        ),
      );
    }, loading: () {
      return const Scaffold(
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
