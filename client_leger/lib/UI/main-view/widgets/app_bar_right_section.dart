import 'package:client_leger/UI/friend-system/friend-request-notification.dart';
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/models/user.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';

class AppBarRightSection extends StatefulWidget {
  final User? user;
  final double sidebarWidth;
  final dynamic currentSidebar;
  final Function toggleSidebar;
  final Function() logout;

  const AppBarRightSection({
    Key? key,
    required this.user,
    required this.sidebarWidth,
    required this.currentSidebar,
    required this.toggleSidebar,
    required this.logout,
  }) : super(key: key);

  @override
  _AppBarRightSectionState createState() => _AppBarRightSectionState();
}

class _AppBarRightSectionState extends State<AppBarRightSection> {
  bool _notificationActive = false;
  bool _pollActive = false;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    final user = widget.user;
    final sidebarWidth = widget.sidebarWidth;
    final currentSidebar = widget.currentSidebar;
    final toggleSidebar = widget.toggleSidebar;
    final logout = widget.logout;

    return Container(
      width: sidebarWidth - 26,
      padding: const EdgeInsets.symmetric(horizontal: 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: colorScheme.tertiary,
                width: 2,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // User info part
                Flexible(
                  child: PopupMenuButton<int>(
                    onSelected: (value) {
                      if (value == 1) {
                        logout();
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
                                size: 68,
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
                                  color: colorScheme.onSurface.withOpacity(0.7),
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
                            color: colorScheme.tertiary.withOpacity(0.5)),
                      ),
                      // Regular menu items
                      PopupMenuItem<int>(
                        value: 2,
                        child: Text(
                          'Modifier le profil',
                          style: TextStyle(
                              color: colorScheme.onSurface, fontSize: 16),
                        ),
                      ),
                      PopupMenuItem<int>(
                        value: 3,
                        child: Text(
                          'Mes statistiques & Logs',
                          style: TextStyle(
                              color: colorScheme.onSurface, fontSize: 16),
                        ),
                      ),
                      PopupMenuItem<int>(
                        value: 4,
                        child: Text(
                          'Historique des parties',
                          style: TextStyle(
                              color: colorScheme.onSurface, fontSize: 16),
                        ),
                      ),
                      PopupMenuItem<int>(
                        value: 1,
                        child: Text(
                          'Déconnexion',
                          style: TextStyle(
                              color: colorScheme.onSurface, fontSize: 16),
                        ),
                      ),
                    ],
                    color: colorScheme.surface,
                    shadowColor: colorScheme.shadow,
                    position: PopupMenuPosition.under,
                    offset: Offset(95, 6.5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(
                        color: colorScheme.tertiary.withValues(alpha: 0.5),
                        width: 2.0,
                      ),
                    ),
                    child: Container(
                      height: 42,
                      decoration: BoxDecoration(
                        color: colorScheme.secondary.withOpacity(0.2),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(6),
                          bottomLeft: Radius.circular(6),
                        ),
                      ),
                      padding: EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2), // Reduced vertical padding
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          AvatarBannerWidget(
                            avatarUrl: user?.avatarEquipped,
                            bannerUrl: user?.borderEquipped,
                            size: 36, // Slightly smaller
                            avatarFit: BoxFit.cover,
                          ),
                          SizedBox(width: 8),
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment:
                                MainAxisAlignment.center, // Center vertically
                            children: [
                              Text(
                                user?.username ?? 'Guest',
                                style: TextStyle(
                                  fontSize: 15, // Slightly smaller
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                              Text(
                                'Coins: ${user?.coins ?? 0}',
                                style: TextStyle(
                                  fontSize: 13, // Slightly smaller
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Divider between user info and friend list button
                SizedBox(
                  height: 36,
                  child: VerticalDivider(
                    color: colorScheme.tertiary,
                    thickness: 1.5,
                    width: 8,
                  ),
                ),

                IconButton(
                  icon: Icon(
                    FontAwesomeIcons.userGroup,
                    size: 16,
                    color: currentSidebar == SidebarContent.friends
                        ? colorScheme.secondary
                        : colorScheme.tertiary,
                  ),
                  constraints: BoxConstraints(
                    minWidth: 40,
                    minHeight: 40,
                  ),
                  padding: EdgeInsets.zero,
                  onPressed: () => toggleSidebar(SidebarContent.friends),
                ),
                SizedBox(width: 4),
              ],
            ),
          ),
          Spacer(),
          Container(
            height: 46,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: colorScheme.tertiary,
                width: 2,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                FriendRequestNotification(
                  onTap: () {
                    setState(() {
                      _notificationActive = !_notificationActive;
                      _pollActive = false;
                    });
                  },
                  isActive: _notificationActive,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: SizedBox(
                    height: 24,
                    child: VerticalDivider(
                      color: colorScheme.tertiary,
                      thickness: 1.5,
                      width: 10,
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    FontAwesomeIcons.bullhorn,
                    size: 18,
                    color: _pollActive
                        ? colorScheme.secondary
                        : colorScheme.tertiary,
                  ),
                  constraints: BoxConstraints(
                    minWidth: 36,
                    minHeight: 36,
                  ),
                  padding: EdgeInsets.zero,
                  onPressed: () {
                    setState(() {
                      _pollActive = !_pollActive;
                      _notificationActive = false;
                    });
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
