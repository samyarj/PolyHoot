// lib/UI/friend-system/friends_list_tab.dart
import 'package:client_leger/UI/friend-system/friend_search_bar.dart';
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:flutter/material.dart';

class FriendsListTab extends StatelessWidget {
  final TextEditingController friendSearchController;
  final String friendSearchTerm;
  final Map<String, FriendState> friendsMap;
  final Set<String> removingUsers;
  final Function(UserWithId) showSendMoneyDialog;
  final Function(UserWithId) showRemoveFriendDialog;

  const FriendsListTab({
    Key? key,
    required this.friendSearchController,
    required this.friendSearchTerm,
    required this.friendsMap,
    required this.removingUsers,
    required this.showSendMoneyDialog,
    required this.showRemoveFriendDialog,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      children: [
        TapRegion(
          onTapOutside: (_) => FocusScope.of(context).unfocus(),
          child: FriendSearchBar(
            controller: friendSearchController,
            colorScheme: colorScheme,
          ),
        ),
        Expanded(
          child: _buildFriendsListView(context),
        ),
      ],
    );
  }

  Widget _buildFriendsListView(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    if (friendsMap.isEmpty) {
      return Center(
        child: Text(
          'Vous n\'avez pas encore d\'amis',
          style: TextStyle(color: colorScheme.onPrimary, fontSize: 16),
        ),
      );
    }

    // Convert map to list for ListView
    List<FriendState> friendsList = friendsMap.values.toList();

    // Apply search filter
    if (friendSearchTerm.isNotEmpty) {
      friendsList = friendsList
          .where((friendState) => friendState.userWithId.user.username
              .toLowerCase()
              .contains(friendSearchTerm.toLowerCase()))
          .toList();

      if (friendsList.isEmpty) {
        return Center(
          child: Text(
            'Aucun ami trouvé',
            style: TextStyle(color: colorScheme.onPrimary, fontSize: 16),
          ),
        );
      }
    }

    return ListView.builder(
      itemCount: friendsList.length,
      itemBuilder: (context, index) {
        final friendState = friendsList[index];
        final friend = friendState.userWithId;
        final isOnline = friendState.isOnline;

        return _buildFriendListItem(context, friend, isOnline);
      },
    );
  }

  Widget _buildFriendListItem(
      BuildContext context, UserWithId friend, bool isOnline) {
    final colorScheme = Theme.of(context).colorScheme;

    return ListTile(
      leading: _buildAvatar(context, friend, isOnline),
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
      trailing: _buildActionButtons(context, friend),
    );
  }

  Widget _buildAvatar(BuildContext context, UserWithId friend, bool isOnline) {
    final colorScheme = Theme.of(context).colorScheme;

    return Stack(
      children: [
        AvatarBannerWidget(
          avatarUrl: friend.user.avatarEquipped,
          bannerUrl: friend.user.borderEquipped,
          size: 55,
          avatarFit: BoxFit.cover,
        ),
        if (isOnline)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: Colors.green,
                shape: BoxShape.circle,
                border: Border.all(
                  color: colorScheme.primary,
                  width: 2,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context, UserWithId friend) {
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
