import 'dart:async';

import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  final TextEditingController _friendSearchController = TextEditingController();
  final TextEditingController _moneyAmountController = TextEditingController();
  Set<String> _processingUsers = {};
  bool _isSearchLoading = false;
  String _searchTerm = '';
  String _friendSearchTerm = '';
  Timer? _debounce;
  Timer? _friendSearchDebounce;
  Map<String, FriendState> _friendsMap = {};
  StreamSubscription? _onlineStatusSubscription;
  Set<String> _removingUsers = {};

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
    _friendSearchController.addListener(_onFriendSearchChanged);
    _subscribeToOnlineStatusUpdates();
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _friendSearchController.removeListener(_onFriendSearchChanged);
    _friendSearchController.dispose();
    _moneyAmountController.dispose();
    _debounce?.cancel();
    _friendSearchDebounce?.cancel();
    _onlineStatusSubscription?.cancel();
    super.dispose();
  }

  void _subscribeToOnlineStatusUpdates() {
    _onlineStatusSubscription?.cancel();

    _onlineStatusSubscription = _friendService.getFriendsOnlineStatus().listen(
      (onlineStatusMap) {
        if (mounted) {
          setState(() {
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

  void _onFriendSearchChanged() {
    if (_friendSearchDebounce?.isActive ?? false)
      _friendSearchDebounce!.cancel();
    _friendSearchDebounce = Timer(const Duration(milliseconds: 500), () {
      if (_friendSearchController.text != _friendSearchTerm) {
        setState(() {
          _friendSearchTerm = _friendSearchController.text;
        });
      }
    });
  }

  Future<void> _showSendMoneyDialog(UserWithId friend) async {
    _moneyAmountController.text = '';
    final currentUserCoins = widget.user?.coins ?? 0;

    await showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Envoyer des coins à ${friend.user.username}',
              style: TextStyle(color: Theme.of(context).colorScheme.onPrimary)),
          backgroundColor: Theme.of(context).colorScheme.surface,
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Votre solde actuel: $currentUserCoins coins',
                style:
                    TextStyle(color: Theme.of(context).colorScheme.onPrimary),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _moneyAmountController,
                style:
                    TextStyle(color: Theme.of(context).colorScheme.onPrimary),
                decoration: InputDecoration(
                  labelText: 'Montant',
                  labelStyle:
                      TextStyle(color: Theme.of(context).colorScheme.onPrimary),
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.tertiary),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.secondary,
                        width: 2),
                  ),
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Annuler',
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimary)),
            ),
            TextButton(
              onPressed: () {
                final amount = int.tryParse(_moneyAmountController.text);
                if (amount == null || amount <= 0) {
                  showToast(context, 'Veuillez entrer un montant valide',
                      type: ToastificationType.error);
                  return;
                }

                if (amount > currentUserCoins) {
                  showToast(context, 'Solde insuffisant',
                      type: ToastificationType.error);
                  return;
                }

                Navigator.of(context).pop();
                _showConfirmTransactionDialog(friend, amount, currentUserCoins);
              },
              child: Text('Suivant',
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.tertiary)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _showConfirmTransactionDialog(
      UserWithId friend, int amount, int currentUserCoins) async {
    final newBalance = currentUserCoins - amount;

    await showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Finaliser la transaction',
              style: TextStyle(color: Theme.of(context).colorScheme.onPrimary)),
          backgroundColor: Theme.of(context).colorScheme.surface,
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildTransactionInfoRow('Destinataire:', friend.user.username),
              const SizedBox(height: 12),
              _buildTransactionInfoRow('Montant:', '$amount coins'),
              const SizedBox(height: 12),
              _buildTransactionInfoRow(
                  'Solde après transfert:', '$newBalance coins'),
              const Divider(color: Colors.white30),
              const SizedBox(height: 16),
              _buildTransactionInfoRow('Total:', '$amount coins'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Annuler',
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimary)),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _sendMoney(friend, amount);
              },
              child: Text('Confirmer',
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.tertiary)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildTransactionInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: TextStyle(color: Theme.of(context).colorScheme.onPrimary)),
        Text(value,
            style: TextStyle(
                color: Theme.of(context).colorScheme.onPrimary,
                fontWeight: FontWeight.bold)),
      ],
    );
  }

  Future<void> _sendMoney(UserWithId friend, int amount) async {
    try {
      // Call the service to transfer money
      // Note: You need to implement this method in your FriendService
      await _friendService.sendMoney(friend.user.uid, amount);

      if (mounted) {
        showToast(
          context,
          'Transaction réussie! $amount coins envoyés à ${friend.user.username}',
          type: ToastificationType.success,
        );
      }
    } catch (e) {
      if (mounted) {
        showErrorDialog(
            context, 'Erreur lors de la transaction: ${e.toString()}');
      }
    }
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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: colorScheme.secondary,
            width: 1.0,
          ),
        ),
      ),
      child: LayoutBuilder(builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        const closeButtonWidth = 48.0;
        final textWidth = availableWidth - closeButtonWidth - 16;

        return Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: textWidth > 0 ? textWidth : 0,
              child: Text(
                'Gestion des amis',
                style: TextStyle(
                  color: colorScheme.onPrimary,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ),
            IconButton(
              icon: Icon(Icons.close, color: colorScheme.onPrimary),
              onPressed: widget.onClose,
              constraints: BoxConstraints.tightFor(
                  width: closeButtonWidth, height: closeButtonWidth),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildFriendsList(ColorScheme colorScheme) {
    return Column(
      children: [
        // Friend search bar
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: TextField(
            controller: _friendSearchController,
            style: TextStyle(color: colorScheme.onPrimary),
            decoration: InputDecoration(
              hintText: 'Rechercher un ami...',
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

        // Friends list
        Expanded(
          child: StreamBuilder<List<UserWithId>>(
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
                _friendsMap.removeWhere((uid, _) =>
                    !newFriends.any((friend) => friend.user.uid == uid));
              }

              if (_friendsMap.isEmpty) {
                return Center(
                  child: Text(
                    'Vous n\'avez pas encore d\'amis',
                    style:
                        TextStyle(color: colorScheme.onPrimary, fontSize: 16),
                  ),
                );
              }

              // Convert map to list for ListView
              List<FriendState> friendsList = _friendsMap.values.toList();

              // Apply search filter
              if (_friendSearchTerm.isNotEmpty) {
                friendsList = friendsList
                    .where((friendState) => friendState.userWithId.user.username
                        .toLowerCase()
                        .contains(_friendSearchTerm.toLowerCase()))
                    .toList();

                if (friendsList.isEmpty) {
                  return Center(
                    child: Text(
                      'Aucun ami trouvé',
                      style:
                          TextStyle(color: colorScheme.onPrimary, fontSize: 16),
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
                    trailing: Container(
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
                            icon: Icon(Icons.currency_exchange,
                                color: colorScheme.tertiary),
                            tooltip: 'Envoyer de l\'argent',
                            onPressed: () => _showSendMoneyDialog(friend),
                          ),
                          // Vertical divider between icons
                          Container(
                            height: 24,
                            width: 2,
                            color: colorScheme.tertiary,
                          ),
                          // Remove friend button or loading indicator
                          _removingUsers.contains(friend.user.uid)
                              ? Container(
                                  width: 48, // Même largeur que l'IconButton
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
                                  icon: Icon(Icons.remove_circle,
                                      color: colorScheme.error),
                                  tooltip: 'Supprimer ami',
                                  onPressed: () =>
                                      _showRemoveFriendDialog(friend),
                                ),
                        ],
                      ),
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
            // Ajout de l'état de chargement
            setState(() {
              _removingUsers.add(friend.user.uid);
            });

            _friendService.removeFriend(friend.user.uid).then((_) {
              // Succès - retirer de l'ensemble des utilisateurs en suppression
              if (mounted) {
                setState(() {
                  _removingUsers.remove(friend.user.uid);
                });
                showToast(context,
                    '${friend.user.username} a été supprimé de votre liste d\'amis',
                    type: ToastificationType.success);
              }
            }).catchError((error) {
              if (mounted) {
                // Erreur - retirer de l'ensemble des utilisateurs en suppression
                setState(() {
                  _removingUsers.remove(friend.user.uid);
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
