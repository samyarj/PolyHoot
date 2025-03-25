// lib/UI/friend-system/user_search_item.dart
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:flutter/material.dart';

class UserSearchItem extends StatelessWidget {
  final UserWithId user;
  final bool isProcessing;
  final Function(String) sendFriendRequest;

  const UserSearchItem({
    Key? key,
    required this.user,
    required this.isProcessing,
    required this.sendFriendRequest,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return ListTile(
      leading: AvatarBannerWidget(
        avatarUrl: user.user.avatarEquipped,
        bannerUrl: user.user.borderEquipped,
        size: 55,
        avatarFit: BoxFit.cover,
      ),
      title: Text(
        user.user.username,
        style: TextStyle(
          fontWeight: FontWeight.w500,
          color: colorScheme.onPrimary,
        ),
      ),
      trailing: isProcessing
          ? const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
              ),
            )
          : IconButton(
              icon: Icon(
                Icons.person_add,
                color: colorScheme.tertiary,
              ),
              onPressed: () => sendFriendRequest(user.user.uid),
            ),
    );
  }
}
