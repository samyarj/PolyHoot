import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/UI/admin/polls-statistics/widgets/admin_poll_notification.dart';
import 'package:client_leger/UI/main-view/chat_message_notif/chat_messages_notif.dart';
import 'package:client_leger/models/user.dart';
import 'package:flutter/material.dart';

class AdminAppBarRightSection extends StatefulWidget {
  final User? user;
  final Function() logout;
  final double sidebarWidth;

  const AdminAppBarRightSection({
    Key? key,
    required this.user,
    required this.logout,
    required this.sidebarWidth,
  }) : super(key: key);

  @override
  _AdminAppBarRightSectionState createState() =>
      _AdminAppBarRightSectionState();
}

class _AdminAppBarRightSectionState extends State<AdminAppBarRightSection> {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final user = widget.user;
    final logout = widget.logout;
    final sidebarWidth = widget.sidebarWidth;

    return Container(
      width: sidebarWidth - 26,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // User profile button
          Container(
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: colorScheme.tertiary,
                width: 2,
              ),
            ),
            child: PopupMenuButton<int>(
              onSelected: (value) {
                if (value == 1) {
                  logout();
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem<int>(
                  enabled: false,
                  height: 120,
                  padding:
                      const EdgeInsets.symmetric(vertical: 8, horizontal: 0),
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
                            user?.username ?? 'Admin',
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
                            user?.email ?? 'admin@example.com',
                            style: TextStyle(
                              fontSize: 12,
                              color: colorScheme.onSurface.withOpacity(0.7),
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
                      height: 1, color: colorScheme.tertiary.withOpacity(0.5)),
                ),
                // Logout option
                PopupMenuItem<int>(
                  value: 1,
                  child: Row(
                    children: [
                      Icon(Icons.logout, color: colorScheme.error, size: 20),
                      SizedBox(width: 12),
                      Text(
                        'Déconnexion',
                        style:
                            TextStyle(color: colorScheme.error, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ],
              color: colorScheme.surface,
              shadowColor: colorScheme.shadow,
              position: PopupMenuPosition.under,
              offset: Offset(0, 6.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(
                  color: colorScheme.tertiary.withOpacity(0.5),
                  width: 2.0,
                ),
              ),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: colorScheme.secondary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
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
                    Text(
                      user?.username ?? 'Admin',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onPrimary,
                      ),
                    ),
                    SizedBox(width: 8),
                    Icon(
                      Icons.keyboard_arrow_down,
                      color: colorScheme.onPrimary,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          ),
          SizedBox(width: 16),

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
                // Poll notification button
                AdminPollNotification(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
