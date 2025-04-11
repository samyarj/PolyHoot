import 'package:client_leger/UI/friend-system/friend-request-notification.dart';
import 'package:client_leger/UI/friend-system/qr-code-widget.dart';
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/UI/main-view/chat_message_notif/chat_messages_notif.dart';
import 'package:client_leger/UI/player-polls/player_polls_notification.dart';
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
      width: sidebarWidth + 24,
      padding: const EdgeInsets.symmetric(horizontal: 0),
      child: Row(
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
                      } else if (value == 5) {
                        showDialog(
                          context: context,
                          builder: (context) => UserQRCodeDialog(user: user!),
                        );
                      }
                    },
                    itemBuilder: (context) => [
                      PopupMenuItem<int>(
                        enabled: false,
                        height: 120,
                        padding: const EdgeInsets.symmetric(
                            vertical: 8, horizontal: 0),
                        child: Container(
                          width: double.infinity,
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Center(
                                child: AvatarBannerWidget(
                                  avatarUrl: user?.avatarEquipped,
                                  bannerUrl: user?.borderEquipped,
                                  size: 68,
                                  avatarFit: BoxFit.cover,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Container(
                                width: double.infinity,
                                alignment: Alignment.center,
                                child: Text(
                                  user?.username ?? 'Username',
                                  softWrap: false, // Keeps text in one line
                                  overflow: TextOverflow
                                      .ellipsis, // Prevents text overflow
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: colorScheme.onSurface,
                                    fontSize: 16,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                width: double.infinity,
                                alignment: Alignment.center,
                                child: Text(
                                  user?.email ?? 'email@example.com',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color:
                                        colorScheme.onSurface.withOpacity(0.7),
                                  ),
                                  textAlign: TextAlign.center,
                                ),
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
                      PopupMenuItem<int>(
                        value: 2,
                        child: Row(
                          children: [
                            Icon(Icons.edit,
                                color: colorScheme.tertiary, size: 20),
                            SizedBox(width: 12),
                            Text(
                              'Modifier le profil',
                              style: TextStyle(
                                  color: colorScheme.onSurface, fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                      PopupMenuItem<int>(
                        value: 3,
                        child: Row(
                          children: [
                            Icon(Icons.bar_chart,
                                color: colorScheme.tertiary, size: 20),
                            SizedBox(width: 12),
                            Text(
                              'Mes statistiques & Logs',
                              style: TextStyle(
                                  color: colorScheme.onSurface, fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                      PopupMenuItem<int>(
                        value: 4,
                        child: Row(
                          children: [
                            Icon(Icons.history,
                                color: colorScheme.tertiary, size: 20),
                            SizedBox(width: 12),
                            Text(
                              'Historique des parties',
                              style: TextStyle(
                                  color: colorScheme.onSurface, fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                      PopupMenuItem<int>(
                        value: 5,
                        child: Row(
                          children: [
                            Icon(Icons.qr_code,
                                color: colorScheme.tertiary, size: 20),
                            SizedBox(width: 12),
                            Text(
                              'Afficher mon QR Code',
                              style: TextStyle(
                                  color: colorScheme.onSurface, fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                      PopupMenuItem<int>(
                        value: 1,
                        child: Row(
                          children: [
                            Icon(Icons.logout,
                                color: colorScheme.error, size: 20),
                            SizedBox(width: 12),
                            Text(
                              'Déconnexion',
                              style: TextStyle(
                                  color: colorScheme.error, fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                    ],
                    color: colorScheme.surface,
                    shadowColor: colorScheme.shadow,
                    position: PopupMenuPosition.under,
                    offset: Offset(75, 6.5),
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
                      padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          AvatarBannerWidget(
                            avatarUrl: user?.avatarEquipped,
                            bannerUrl: user?.borderEquipped,
                            size: 36,
                            avatarFit: BoxFit.cover,
                          ),
                          SizedBox(width: 8),
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                (user?.username.length ?? 0) > 10
                                    ? '${user?.username.substring(0, 10)}...' // Limit to 10 characters
                                    : (user?.username ?? 'Inconnu'),
                                softWrap: false,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                              Text(
                                'Pièces: ${user?.coins ?? 0}',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: colorScheme.onPrimary,
                                ),
                              ),
                            ],
                          ),
                          Padding(
                            padding: const EdgeInsets.only(left: 6.0),
                            child: Icon(
                              Icons.keyboard_arrow_down,
                              color: colorScheme.onPrimary,
                              size: 20,
                            ),
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
                ChatMessagesNotification(),
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

                // Poll notification button
                PlayerPollsNotification(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
