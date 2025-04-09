// lib/UI/friend-system/user_search_results.dart
import 'package:client_leger/UI/friend-system/user_search_item.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';

class UserSearchResults extends StatefulWidget {
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
  State<UserSearchResults> createState() => _UserSearchResultsState();
}

class _UserSearchResultsState extends State<UserSearchResults> {
  // Map to track if we've already seen a stream for this search term
  static final Map<String, bool> _initialLoadComplete = {};

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return StreamBuilder<List<UserWithId>>(
      stream: widget.friendService.searchUsers(widget.searchTerm),
      builder: (context, snapshot) {
        // Check if this is the initial load for this search term
        final isInitialLoad =
            !(_initialLoadComplete[widget.searchTerm] ?? false);

        // If we have data, mark this search term as loaded
        if (snapshot.hasData) {
          _initialLoadComplete[widget.searchTerm] = true;
        }

        // Only show loading indicator if it's the first time loading this search term
        if (snapshot.connectionState == ConnectionState.waiting &&
            isInitialLoad) {
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
              isProcessing: widget.processingUsers.contains(user.user.uid),
              sendFriendRequest: widget.sendFriendRequest,
            );
          },
        );
      },
    );
  }
}
