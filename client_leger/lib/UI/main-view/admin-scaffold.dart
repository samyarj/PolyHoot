import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/main-view/sidebar/sidebar.dart';
import 'package:client_leger/UI/main-view/widgets/admin-app-bar.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';

class AdminScaffold extends ConsumerStatefulWidget {
  const AdminScaffold({super.key, required this.statefulNavigationShell});

  final StatefulNavigationShell statefulNavigationShell;

  @override
  ConsumerState<AdminScaffold> createState() => _AdminScaffoldState();
}

class _AdminScaffoldState extends ConsumerState<AdminScaffold>
    with SingleTickerProviderStateMixin {
  bool _isLoggingOut = false;
  final double sidebarWidth = 410;
  bool _isSidebarVisible = true;

  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    if (_isSidebarVisible) {
      _animationController.value = 1.0;
    } else {
      _animationController.value = 0.0;
    }

    _animationController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  _logout() async {
    if (_isLoggingOut) return;

    setState(() {
      _isLoggingOut = true;
    });

    try {
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

  void _toggleSidebarVisibility() {
    setState(() {
      _isSidebarVisible = !_isSidebarVisible;
      if (_isSidebarVisible) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return userState.when(
      data: (user) {
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
                  decoration: BoxDecoration(
                    color: colorScheme.primary,
                  ),
                ),
                title: Row(
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

                    // Accueil button
                    TextButton(
                      onPressed: () => GoRouter.of(context).go(Paths.adminHome),
                      style: TextButton.styleFrom(
                        foregroundColor: colorScheme.tertiary,
                        padding:
                            EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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

                    // Poll icon
                    IconButton(
                      icon: Icon(Icons.poll),
                      iconSize: 28,
                      color: colorScheme.tertiary,
                      onPressed: () => {}, // Navigate to polls page
                      tooltip: 'Sondages',
                    ),
                    SizedBox(width: 8),

                    IconButton(
                      icon: Icon(FontAwesomeIcons.users),
                      iconSize: 26,
                      color: colorScheme.tertiary,
                      onPressed: () =>
                          GoRouter.of(context).go(Paths.adminUsers),
                      tooltip: 'Administrer les utilisateurs',
                    ),
                    SizedBox(width: 16),

                    // Vertical divider
                    SizedBox(
                      height: kToolbarHeight,
                      child: VerticalDivider(
                        color: colorScheme.secondary,
                        thickness: 2,
                        width: 20,
                      ),
                    ),

                    // User profile section
                    AdminAppBarRightSection(
                      user: user,
                      logout: _logout,
                      sidebarWidth: sidebarWidth,
                    )
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
              Row(
                children: [
                  GestureDetector(
                    onTap: _toggleSidebarVisibility,
                    child: Container(
                      width: 24,
                      height: 64,
                      decoration: BoxDecoration(
                        color: colorScheme.secondary.withValues(alpha: 0.75),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(8),
                          bottomLeft: Radius.circular(8),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black26,
                            blurRadius: 4,
                            offset: Offset(-2, 0),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Icon(
                          _isSidebarVisible
                              ? Icons.chevron_right
                              : Icons.chevron_left,
                          color: colorScheme.onPrimary,
                          size: 28,
                        ),
                      ),
                    ),
                  ),

                  // Animated sidebar
                  AnimatedContainer(
                    duration: Duration(milliseconds: 300),
                    width: _isSidebarVisible ? sidebarWidth : 0,
                    curve: Curves.easeInOut,
                    child: _isSidebarVisible
                        ? LayoutBuilder(
                            builder: (context, constraints) {
                              // Only show sidebar if there's enough width
                              if (constraints.maxWidth < 100) {
                                // Threshold width for rendering
                                return Container(color: colorScheme.primary);
                              }

                              // Render the sidebar
                              return SideBar(user: user);
                            },
                          )
                        : null,
                  ),
                ],
              ),
            ],
          ),
        );
      },
      loading: () {
        return Scaffold(
          body: Center(
            child: ThemedProgressIndicator(),
          ),
        );
      },
      error: (error, stack) {
        return Scaffold(
          body: Center(
            child: Text('Error: $error'),
          ),
        );
      },
    );
  }
}
