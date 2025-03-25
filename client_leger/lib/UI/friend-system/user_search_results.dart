// lib/UI/friend-system/user_search_results.dart
import 'package:client_leger/UI/friend-system/user_search_item.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';

class UserSearchResults extends StatelessWidget {
  final String searchTerm;
  final Set<String> processingUsers;
  final Function(String) sendFriendRequest;
  final FriendService friendService;

  const UserSearchResults({
    Key? key,
    required this.searchTerm,
    required this.processingUsers,
    required this.sendFriendRequest,
    required this.friendService,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return StreamBuilder<List<UserWithId>>(
      stream: friendService.searchUsers(searchTerm),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
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

        final users = snapshot.data ?? [];

        if (users.isEmpty) {
          return Center(
            child: Text(
              'Aucun utilisateur trouvé',
              style: TextStyle(color: colorScheme.onPrimary),
            ),
          );
        }

        return ListView.builder(
          itemCount: users.length,
          itemBuilder: (context, index) {
            final user = users[index];
            return UserSearchItem(
              user: user,
              isProcessing: processingUsers.contains(user.user.uid),
              sendFriendRequest: sendFriendRequest,
            );
          },
        );
      },
    );
  }
}
