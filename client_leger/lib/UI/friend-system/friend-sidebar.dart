// lib/UI/friend-system/friend_sidebar.dart
import 'dart:async';

import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/friend-system/add_friend_tab.dart';
import 'package:client_leger/UI/friend-system/confirm_transaction_dialog.dart';
import 'package:client_leger/UI/friend-system/friend_tab_bar.dart';
import 'package:client_leger/UI/friend-system/friends_list_tab.dart';
import 'package:client_leger/UI/friend-system/qr-scanner-widget.dart';
import 'package:client_leger/UI/friend-system/send_money_dialog.dart';
import 'package:client_leger/UI/friend-system/sidebar_header.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/utilities/helper_functions.dart';
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
  StreamSubscription? _friendsListSubscription;
  Set<String> _removingUsers = {};
  bool _isInitialBuild = true;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChangedDelayed);
    _friendSearchController.addListener(_onFriendSearchChanged);
    _subscribeToOnlineStatusUpdates();
    _subscribeToFriendsUpdates();
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChangedDelayed);
    _searchController.dispose();
    _friendSearchController.removeListener(_onFriendSearchChanged);
    _friendSearchController.dispose();
    _moneyAmountController.dispose();
    _debounce?.cancel();
    _friendSearchDebounce?.cancel();
    _onlineStatusSubscription?.cancel();
    _friendsListSubscription?.cancel();
    super.dispose();
  }

  void _subscribeToFriendsUpdates() {
    _friendsListSubscription?.cancel();

    _friendsListSubscription = _friendService.getFriends().listen(
      (newFriends) {
        if (mounted) {
          setState(() {
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
          });
        }
      },
      onError: (error) {
        print("Friends list stream error: $error");
      },
    );
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

  void _onSearchChangedDelayed() {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      if (_searchController.text != _searchTerm) {
        setState(() {
          _searchTerm = _searchController.text;
          if (_searchTerm.isNotEmpty) {
            _isSearchLoading = true;
          }
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
        return SendMoneyDialog(
          friend: friend,
          currentUserCoins: currentUserCoins,
          moneyAmountController: _moneyAmountController,
          onConfirm: (amount) =>
              _showConfirmTransactionDialog(friend, amount, currentUserCoins),
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
        return ConfirmTransactionDialog(
          friend: friend,
          amount: amount,
          newBalance: newBalance,
          onConfirm: () => _sendMoney(friend, amount),
        );
      },
    );
  }

  Future<void> _sendMoney(UserWithId friend, int amount) async {
    try {
      await _friendService.sendMoney(friend.user.uid, amount);
      if (mounted) {
        showToast(
          context,
          'Transaction réussie! $amount pièces envoyés à ${friend.user.username}',
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

    if (_isInitialBuild) {
      _isInitialBuild = false;
    } else {
      // Reset loading state if returning to this tab
      if (_isSearchLoading && _searchTerm.isNotEmpty) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          setState(() {
            _isSearchLoading = false;
          });
        });
      }
    }

    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
        color: colorScheme.primary,
      ),
      child: Column(
        children: [
          SidebarHeader(
            title: 'Gestion des amis',
            onClose: widget.onClose,
          ),
          Expanded(
            child: DefaultTabController(
              length: 2,
              child: Column(
                children: [
                  FriendTabBar(colorScheme: colorScheme),
                  Expanded(
                    child: TabBarView(
                      children: [
                        // Use the friends list tab with the pre-populated data
                        FriendsListTab(
                          friendSearchController: _friendSearchController,
                          friendSearchTerm: _friendSearchTerm,
                          friendsMap: _friendsMap,
                          removingUsers: _removingUsers,
                          showSendMoneyDialog: _showSendMoneyDialog,
                          showRemoveFriendDialog: _showRemoveFriendDialog,
                        ),
                        AddFriendTab(
                          searchController: _searchController,
                          searchTerm: _searchTerm,
                          isSearchLoading: _isSearchLoading,
                          processingUsers: _processingUsers,
                          sendFriendRequest: _sendFriendRequest,
                          openQRScanner: _openQRScanner,
                          friendService: _friendService,
                        ),
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

  Future<void> _showRemoveFriendDialog(UserWithId friend) async {
    await showConfirmationDialog(
      context,
      'Êtes-vous sûr de vouloir supprimer ${friend.user.username} de votre liste d\'amis?',
      null,
      () {
        Future.delayed(Duration.zero, () {
          if (mounted) {
            setState(() {
              _removingUsers.add(friend.user.uid);
            });

            _friendService.removeFriend(friend.user.uid).then((_) {
              if (mounted) {
                // The friend is already removed from the database,
                // but we need to manually update our local map to reflect the change immediately
                // The stream will eventually update it too, but this makes the UI respond faster
                setState(() {
                  _removingUsers.remove(friend.user.uid);
                  _friendsMap.remove(
                      friend.user.uid); // Remove from local map immediately
                });
                showToast(context,
                    '${friend.user.username} a été supprimé de votre liste d\'amis',
                    type: ToastificationType.success);
              }
            }).catchError((error) {
              if (mounted) {
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
    setState(() {
      _processingUsers.add(friendUid);
      _isSearchLoading = true;
    });

    try {
      await _friendService.sendFriendRequest(friendUid);
      if (!mounted) return;
      showToast(context, 'Demande d\'ami envoyée avec succès',
          type: ToastificationType.success);
      _searchController.clear();
    } catch (e) {
      if (!mounted) return;
      showErrorDialog(context, e.toString());
    } finally {
      if (!mounted) return;
      setState(() {
        _processingUsers.remove(friendUid);
        _isSearchLoading = false;
      });
    }
  }

  void _openQRScanner() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => QRScannerScreen(
          mode: QRScannerMode.friendRequest,
          onClose: () => Navigator.of(context).pop(),
        ),
      ),
    );
  }
}
