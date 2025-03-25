import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/friend-system/friend-sidebar.dart';
import 'package:client_leger/UI/main-view/sidebar/sidebar.dart';
import 'package:client_leger/UI/main-view/widgets/app_bar_right_section.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/enums.dart';
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

class _MainScaffoldState extends ConsumerState<MainScaffold>
    with SingleTickerProviderStateMixin {
  bool _isLoggingOut = false;
  final double sidebarWidth = 410;
  bool _isSidebarVisible = true;

  late AnimationController _animationController;
  late Animation<double> _sidebarAnimation;

  SidebarContent _currentSidebar = SidebarContent.chat;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _sidebarAnimation = Tween<double>(
      begin: 0,
      end: sidebarWidth,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

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

  void _toggleSidebar(SidebarContent content) {
    setState(() {
      _currentSidebar = content;

      if (!_isSidebarVisible) {
        _isSidebarVisible = true;
        _animationController.forward();
      }
    });
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
    final isInGame = WebSocketManager.instance.isPlaying;
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
                  decoration: isInGame
                      ? BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              colorScheme.secondary,
                              colorScheme.primary,
                            ],
                          ),
                        )
                      : BoxDecoration(color: colorScheme.primary),
                ),
                title: isInGame
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Image.asset(
                            'assets/logo.png',
                            width: 40,
                            height: 40,
                          ),
                        ),
                      )
                    : Row(
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
                                    color:
                                        colorScheme.onPrimary.withOpacity(0.5),
                                    thickness: 3,
                                    width: 1,
                                  ),
                                ),

                                TextButton(
                                  onPressed: () =>
                                      GoRouter.of(context).go(Paths.play),
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
                                          colorScheme.tertiary,
                                          BlendMode.srcIn),
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
                          SizedBox(
                            height: kToolbarHeight,
                            child: VerticalDivider(
                              color: colorScheme.secondary,
                              thickness: 2,
                              width: 20,
                            ),
                          ),
                          AppBarRightSection(
                              user: user,
                              sidebarWidth: sidebarWidth,
                              currentSidebar: _currentSidebar,
                              toggleSidebar: _toggleSidebar,
                              logout: _logout)
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
                  // Replace the AnimatedContainer in your MainScaffold with this:
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

                              // Render the appropriate sidebar
                              return _currentSidebar == SidebarContent.chat
                                  ? SideBar(user: user)
                                  : FriendSidebar(
                                      user: user,
                                      onClose: () =>
                                          _toggleSidebar(SidebarContent.chat),
                                    );
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
