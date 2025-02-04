import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/main-view/sidebar/sidebar.dart';
import 'package:client_leger/UI/play/playbutton.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
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
          _isLoggingOut
              ? const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 3,
                    ),
                  ),
                )
              : IconButton(
                  icon: const Icon(Icons.logout),
                  iconSize: 34,
                  onPressed: _logout,
                ),
        ],
      ),
      body: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: widget.statefulNavigationShell),
          const SideBar(),
        ],
      ),
    );
  }
}
