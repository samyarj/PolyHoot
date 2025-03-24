import 'dart:async';

import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:toastification/toastification.dart';

class FriendSidebar extends ConsumerStatefulWidget {
  final User? user;
  final VoidCallback onClose;

  const FriendSidebar({
    Key? key,
    required this.user,
    required this.onClose,
  }) : super(key: key);

  @override
  _FriendSidebarState createState() => _FriendSidebarState();
}

class _FriendSidebarState extends ConsumerState<FriendSidebar> {
  final FriendService _friendService = FriendService();
  final TextEditingController _searchController = TextEditingController();
  Set<String> _processingUsers = {};
  bool _isLoading = false;
  bool _isSearchLoading = false;
  String _searchTerm = '';
  Timer? _debounce;
  Map<String, FriendState> _friendsMap = {};
  StreamSubscription? _onlineStatusSubscription;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
    _subscribeToOnlineStatusUpdates();
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _debounce?.cancel();
    _onlineStatusSubscription?.cancel(); // Properly cancel subscription
    super.dispose();
  }

  void _subscribeToOnlineStatusUpdates() {
    // Cancel any existing subscription first
    _onlineStatusSubscription?.cancel();

    // Create a new subscription
    _onlineStatusSubscription = _friendService.getFriendsOnlineStatus().listen(
      (onlineStatusMap) {
        if (mounted) {
          setState(() {
            // Update all online statuses at once
            onlineStatusMap.forEach((uid, isOnline) {
              if (_friendsMap.containsKey(uid)) {
                _friendsMap[uid]!.isOnline = isOnline;
              }
            });
          });
        }
      },
      onError: (error) {
        print("Online status stream error: $error");
      },
    );
  }

  void _updateFriendOnlineStatus(String uid, bool isOnline) {
    if (_friendsMap.containsKey(uid)) {
      setState(() {
        _friendsMap[uid]!.isOnline = isOnline;
      });
    }
  }

  void _onSearchChanged() {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      if (_searchController.text != _searchTerm) {
        setState(() {
          _searchTerm = _searchController.text;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
        color: colorScheme.primary,
      ),
      child: Column(
        children: [
          _buildHeader(colorScheme),
          Expanded(
            child: DefaultTabController(
              length: 2,
              child: Column(
                children: [
                  TabBar(
                    labelColor: colorScheme.onPrimary,
                    unselectedLabelColor: colorScheme.tertiary,
                    labelStyle: const TextStyle(fontSize: 18),
                    indicator: BoxDecoration(
                      color: colorScheme.secondary.withOpacity(0.55),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    labelPadding: EdgeInsets.zero,
                    tabs: [
                      Container(
                        width: double.infinity,
                        alignment: Alignment.center,
                        child: Tab(text: 'Amis'),
                      ),
                      Container(
                        width: double.infinity,
                        alignment: Alignment.center,
                        child: Tab(text: 'Ajouter'),
                      ),
                    ],
                  ),
                  Expanded(
                    child: TabBarView(
                      children: [
                        _buildFriendsList(colorScheme),
                        _buildAddFriend(colorScheme),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(ColorScheme colorScheme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: colorScheme.secondary,
            width: 1.0,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Gestion des amis',
            style: TextStyle(
              color: colorScheme.onPrimary,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          IconButton(
            icon: Icon(Icons.close, color: colorScheme.onPrimary),
            onPressed: widget.onClose,
          ),
        ],
      ),
    );
  }

  Widget _buildFriendsList(ColorScheme colorScheme) {
    return StreamBuilder<List<UserWithId>>(
      stream: _friendService.getFriends(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting &&
            _friendsMap.isEmpty) {
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

        // Update the friends map with new data, preserving online status
        if (snapshot.hasData) {
          final newFriends = snapshot.data ?? [];

          // Update existing entries or add new ones
          for (var friend in newFriends) {
            if (_friendsMap.containsKey(friend.user.uid)) {
              // Preserve online status but update other fields
              final currentOnlineStatus =
                  _friendsMap[friend.user.uid]!.isOnline;
              _friendsMap[friend.user.uid] = FriendState(
                userWithId: friend,
                isOnline: friend.user.isOnline ?? currentOnlineStatus,
              );
            } else {
              // Add new friend
              _friendsMap[friend.user.uid] = FriendState(
                userWithId: friend,
                isOnline: friend.user.isOnline ?? false,
              );
            }
          }

          // Remove friends that are no longer in the list
          _friendsMap.removeWhere(
              (uid, _) => !newFriends.any((friend) => friend.user.uid == uid));
        }

        if (_friendsMap.isEmpty) {
          return Center(
            child: Text(
              'Vous n\'avez pas encore d\'amis',
              style: TextStyle(color: colorScheme.onPrimary, fontSize: 16),
            ),
          );
        }

        // Convert map to list for ListView
        final friendsList = _friendsMap.values.toList();

        return ListView.builder(
          itemCount: friendsList.length,
          itemBuilder: (context, index) {
            final friendState = friendsList[index];
            final friend = friendState.userWithId;
            final isOnline = friendState.isOnline;

            return ListTile(
              leading: Stack(
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
                  color: isOnline
                      ? Colors.green
                      : colorScheme.onPrimary.withOpacity(0.7),
                  fontSize: 12,
                ),
              ),
              trailing: IconButton(
                icon: Icon(Icons.person_remove, color: colorScheme.error),
                onPressed: () => _showRemoveFriendDialog(friend),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildAddFriend(ColorScheme colorScheme) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: TextField(
            controller: _searchController,
            style: TextStyle(color: colorScheme.onPrimary),
            decoration: InputDecoration(
              hintText: 'Rechercher un utilisateur...',
              hintStyle:
                  TextStyle(color: colorScheme.onPrimary.withOpacity(0.7)),
              prefixIcon: Icon(Icons.search, color: colorScheme.onPrimary),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: colorScheme.tertiary),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: colorScheme.tertiary),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: colorScheme.secondary, width: 2),
              ),
              filled: true,
              fillColor: colorScheme.primary.withOpacity(0.7),
            ),
          ),
        ),
        Expanded(
          child: _searchTerm.isEmpty
              ? Center(
                  child: Text(
                    'Recherchez un utilisateur pour l\'ajouter en ami',
                    style: TextStyle(color: colorScheme.onPrimary),
                    textAlign: TextAlign.center,
                  ),
                )
              : _isSearchLoading
                  ? const Center(child: ThemedProgressIndicator())
                  : StreamBuilder<List<UserWithId>>(
                      stream: _friendService.searchUsers(_searchTerm),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
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

                            // Check if this user is in processing
                            final isProcessing =
                                _processingUsers.contains(user.user.uid);

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
                                      onPressed: () =>
                                          _sendFriendRequest(user.user.uid),
                                    ),
                            );
                          },
                        );
                      },
                    ),
        ),
      ],
    );
  }

  Future<void> _showRemoveFriendDialog(UserWithId friend) async {
    await showConfirmationDialog(
      context,
      'Êtes-vous sûr de vouloir supprimer ${friend.user.username} de votre liste d\'amis?',
      null,
      () {
        Future.delayed(Duration.zero, () {
          if (mounted) {
            setState(() {
              _isLoading = true;
            });

            _friendService.removeFriend(friend.user.uid).then((_) {
              if (mounted) {
                setState(() {
                  _isLoading = false;
                });
              }
            }).catchError((error) {
              if (mounted) {
                setState(() {
                  _isLoading = false;
                });
                showToast(context, error.toString(),
                    type: ToastificationType.error);
              }
            });
          }
        });
      },
    );
  }

  Future<void> _sendFriendRequest(String friendUid) async {
    // Show loading state for the entire search results
    setState(() {
      _processingUsers.add(friendUid);
      _isSearchLoading = true; // Set loading state to true
    });

    try {
      await _friendService.sendFriendRequest(friendUid);
      if (!mounted) return;
      showToast(context, 'Demande d\'ami envoyée avec succès',
          type: ToastificationType.success);
    } catch (e) {
      if (!mounted) return;
      showErrorDialog(context, e.toString());
    } finally {
      if (!mounted) return;
      setState(() {
        _processingUsers.remove(friendUid);
        _isSearchLoading = false; // Reset loading state
      });
    }
  }
}
