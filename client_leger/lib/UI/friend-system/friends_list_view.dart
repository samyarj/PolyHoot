// lib/UI/friend-system/friends_list_view.dart
import 'package:client_leger/UI/friend-system/friend_list_item.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';

class FriendsListView extends StatelessWidget {
  final Map<String, FriendState> friendsMap;
  final String friendSearchTerm;
  final Set<String> removingUsers;
  final Function(UserWithId) showSendMoneyDialog;
  final Function(UserWithId) showRemoveFriendDialog;
  final FriendService _friendService = FriendService();

  FriendsListView({
    Key? key,
    required this.friendsMap,
    required this.friendSearchTerm,
    required this.removingUsers,
    required this.showSendMoneyDialog,
    required this.showRemoveFriendDialog,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return StreamBuilder<List<UserWithId>>(
      stream: _friendService.getFriends(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting &&
            friendsMap.isEmpty) {
          return const Center(child: ThemedProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(
            child: Text(
              'Erreur: ${snapshot.error}',
              style: TextStyle(color: colorScheme.onPrimary),
            ),
          );
        }

        // Update the friendsMap with data from the stream
        if (snapshot.hasData) {
          final newFriends = snapshot.data ?? [];

          // The parent widget should update this map, but we can log it for debugging
          print("Stream returned ${newFriends.length} friends");
        }

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
            return FriendListItem(
              friendState: friendState,
              removingUsers: removingUsers,
              showSendMoneyDialog: showSendMoneyDialog,
              showRemoveFriendDialog: showRemoveFriendDialog,
            );
          },
        );
      },
    );
  }
}
