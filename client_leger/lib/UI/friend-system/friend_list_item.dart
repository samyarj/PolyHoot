// lib/UI/friend-system/friend_list_item.dart
import 'package:client_leger/UI/friend-system/friend_action_buttons.dart';
import 'package:client_leger/UI/friend-system/friend_avatar.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:flutter/material.dart';

class FriendListItem extends StatelessWidget {
  final FriendState friendState;
  final Set<String> removingUsers;
  final Function(UserWithId) showSendMoneyDialog;
  final Function(UserWithId) showRemoveFriendDialog;

  const FriendListItem({
    Key? key,
    required this.friendState,
    required this.removingUsers,
    required this.showSendMoneyDialog,
    required this.showRemoveFriendDialog,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final friend = friendState.userWithId;
    final isOnline = friendState.isOnline;

    return ListTile(
      leading: FriendAvatar(
        avatarUrl: friend.user.avatarEquipped,
        bannerUrl: friend.user.borderEquipped,
        isOnline: isOnline,
      ),
      title: Text(
        friend.user.username,
        style: TextStyle(
          color: colorScheme.onPrimary,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        isOnline ? 'En ligne' : 'Hors ligne',
        style: TextStyle(
          color:
              isOnline ? Colors.green : colorScheme.onPrimary.withOpacity(0.7),
          fontSize: 12,
        ),
      ),
      trailing: FriendActionButtons(
        friend: friend,
        removingUsers: removingUsers,
        showSendMoneyDialog: showSendMoneyDialog,
        showRemoveFriendDialog: showRemoveFriendDialog,
      ),
    );
  }
}
