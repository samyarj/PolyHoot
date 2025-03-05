import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/main-view/sidebar/sidebar.dart';
import 'package:client_leger/UI/play/playbutton.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key, required this.statefulNavigationShell});

  final StatefulNavigationShell statefulNavigationShell;

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  bool _isLoggingOut = false;
  late Future<user_model.User?> _user;

  @override
  void initState() {
    _user = auth_service.currentSignedInUser;
    WebSocketManager.instance.initializeSocketConnection();
    super.initState();
  }

  _logout() async {
    if (_isLoggingOut) return;

    setState(() {
      _isLoggingOut = true;
    });
    try {
      await auth_service.logout();
    } catch (e) {
      if (!mounted) return;
      showErrorDialog(context, getCustomError(e));
    } finally {
      if (!mounted) return;
      setState(() {
        _isLoggingOut = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<user_model.User?>(
        future: _user,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else {
            WebSocketManager.instance
                .webSocketSender("identifyMobileClient", snapshot.data?.uid);

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
                          child: Text('Déconnexion'),
                        ),
                      ],
                      offset: Offset(0, 48),
                      child: CircleAvatar(
                        radius: 23,
                        backgroundImage: snapshot.data?.avatarEquipped != null
                            ? NetworkImage(snapshot.data!.avatarEquipped!)
                            : AssetImage('assets/default_avatar.png'),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    snapshot.data?.username ?? 'Guest',
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
                  SizedBox(width: 400, child: SideBar(user: snapshot.data)),
                ],
              ),
            );
          }
        });
  }
}
