// lib/UI/friend-system/add_friend_tab.dart
import 'package:client_leger/UI/friend-system/user_search_bar.dart';
import 'package:client_leger/UI/friend-system/user_search_results.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';

class AddFriendTab extends StatelessWidget {
  final TextEditingController searchController;
  final String searchTerm;
  final bool isSearchLoading;
  final Set<String> processingUsers;
  final Function(String) sendFriendRequest;
  final VoidCallback openQRScanner;
  final FriendService friendService;

  const AddFriendTab({
    Key? key,
    required this.searchController,
    required this.searchTerm,
    required this.isSearchLoading,
    required this.processingUsers,
    required this.sendFriendRequest,
    required this.openQRScanner,
    required this.friendService,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      children: [
        UserSearchBar(
          searchController: searchController,
          openQRScanner: openQRScanner,
        ),
        Expanded(
          child: searchTerm.isEmpty
              ? Center(
                  child: Text(
                    'Recherchez un utilisateur pour l\'ajouter en ami',
                    style: TextStyle(color: colorScheme.onPrimary),
                    textAlign: TextAlign.center,
                  ),
                )
              : isSearchLoading
                  ? const Center(child: ThemedProgressIndicator())
                  : UserSearchResults(
                      searchTerm: searchTerm,
                      processingUsers: processingUsers,
                      sendFriendRequest: sendFriendRequest,
                      friendService: friendService,
                    ),
        ),
      ],
    );
  }
}
