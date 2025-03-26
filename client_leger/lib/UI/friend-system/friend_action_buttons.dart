// lib/UI/friend-system/friend_action_buttons.dart
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:flutter/material.dart';

class FriendActionButtons extends StatelessWidget {
  final UserWithId friend;
  final Set<String> removingUsers;
  final Function(UserWithId) showSendMoneyDialog;
  final Function(UserWithId) showRemoveFriendDialog;

  const FriendActionButtons({
    Key? key,
    required this.friend,
    required this.removingUsers,
    required this.showSendMoneyDialog,
    required this.showRemoveFriendDialog,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        border: Border.all(
          color: colorScheme.tertiary,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Send money button
          IconButton(
            icon: Icon(Icons.currency_exchange, color: colorScheme.tertiary),
            tooltip: 'Envoyer de l\'argent',
            onPressed: () => showSendMoneyDialog(friend),
          ),
          // Vertical divider between icons
          Container(
            height: 24,
            width: 2,
            color: colorScheme.tertiary,
          ),
          // Remove friend button or loading indicator
          removingUsers.contains(friend.user.uid)
              ? Container(
                  width: 48, // Same width as IconButton
                  alignment: Alignment.center,
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: colorScheme.error,
                    ),
                  ),
                )
              : IconButton(
                  icon: Icon(Icons.remove_circle, color: colorScheme.error),
                  tooltip: 'Supprimer ami',
                  onPressed: () => showRemoveFriendDialog(friend),
                ),
        ],
      ),
    );
  }
}
