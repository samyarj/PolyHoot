import 'dart:async';

import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:toastification/toastification.dart';

class FriendRequestNotification extends ConsumerStatefulWidget {
  final bool isActive;
  final VoidCallback onTap;

  const FriendRequestNotification({
    Key? key,
    this.isActive = false,
    required this.onTap,
  }) : super(key: key);

  @override
  _FriendRequestNotificationState createState() =>
      _FriendRequestNotificationState();
}

class _FriendRequestNotificationState
    extends ConsumerState<FriendRequestNotification> {
  final FriendService _friendService = FriendService();
  List<UserWithId> _friendRequests = [];
  final Set<String> _processingRequests = {};
  OverlayEntry? _overlayEntry;
  final LayerLink _layerLink = LayerLink();
  bool _canToggle = true;
  StreamSubscription<List<UserWithId>>? _requestsSubscription;

  @override
  void initState() {
    super.initState();
    _subscribeToFriendRequests();
  }

  void _subscribeToFriendRequests() {
    _requestsSubscription?.cancel();
    _requestsSubscription =
        _friendService.getFriendRequests().listen((requests) {
      if (mounted) {
        setState(() {
          _friendRequests = requests;
        });
      }
    });
  }

  @override
  void dispose() {
    _requestsSubscription?.cancel();
    _removeOverlay();
    super.dispose();
  }

  void _removeOverlay() {
    if (_overlayEntry != null) {
      _overlayEntry?.remove();
      _overlayEntry = null;

      _canToggle = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final userState = ref.watch(userProvider);

    return userState.when(
      data: (user) {
        if (user == null) return const SizedBox.shrink();

        final requestCount = _friendRequests.length;
        return _buildFriendRequestIcon(requestCount, colorScheme);
      },
      loading: () => _buildFriendRequestIcon(0, colorScheme),
      error: (_, __) => _buildFriendRequestIcon(0, colorScheme),
    );
  }

  Widget _buildFriendRequestIcon(int count, ColorScheme colorScheme) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            height: 46,
            width: 46,
            alignment: Alignment.center,
            child: IconButton(
              icon: Icon(Icons.notifications),
              iconSize: 24,
              color: widget.isActive
                  ? colorScheme.secondary
                  : colorScheme.tertiary,
              constraints: BoxConstraints(
                minWidth: 36,
                minHeight: 36,
              ),
              padding: EdgeInsets.zero,
              onPressed: () {
                if (!widget.isActive && _canToggle) {
                  widget.onTap();
                  _showFriendRequestsOverlay(context);
                  _canToggle = false;
                }
              },
            ),
          ),
          if (count > 0 && !widget.isActive)
            Positioned(
              right: count > 99 ? 1 : 8,
              bottom: 18,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.red,
                ),
                constraints: const BoxConstraints(
                  minWidth: 18,
                  minHeight: 18,
                ),
                child: Text("${count > 99 ? '99+' : count}",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center),
              ),
            ),
        ],
      ),
    );
  }

  void _showFriendRequestsOverlay(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Store local processing states
    Map<String, bool> processingStates = {};

    _overlayEntry = OverlayEntry(
      builder: (context) {
        return GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: () {
            _removeOverlay();
            setState(() {
              if (widget.isActive) {
                widget.onTap();
              }
            });
          },
          child: Stack(
            children: [
              Positioned(
                width: 350,
                child: CompositedTransformFollower(
                  link: _layerLink,
                  followerAnchor: Alignment.topRight,
                  targetAnchor: Alignment.bottomRight,
                  offset: Offset(0, 10),
                  child: Material(
                    color: Colors.transparent,
                    child: GestureDetector(
                      onTap: () {}, // Prevent taps from dismissing the overlay
                      child: StatefulBuilder(
                        builder: (context, setOverlayState) {
                          return Card(
                            color: colorScheme.surface,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: BorderSide(
                                color: colorScheme.tertiary.withOpacity(0.5),
                                width: 1.0,
                              ),
                            ),
                            elevation: 8,
                            margin: EdgeInsets.zero,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                // Header
                                Container(
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: colorScheme.surface,
                                    borderRadius: BorderRadius.only(
                                      topLeft: Radius.circular(8),
                                      topRight: Radius.circular(8),
                                    ),
                                    border: Border(
                                      bottom: BorderSide(
                                        color: colorScheme.tertiary
                                            .withOpacity(0.5),
                                        width: 1,
                                      ),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Demandes d\'ami',
                                        style: TextStyle(
                                          color: colorScheme.onSurface,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      IconButton(
                                        icon: Icon(Icons.close,
                                            color: colorScheme.onSurface),
                                        onPressed: () {
                                          _removeOverlay();
                                          setState(() {
                                            if (widget.isActive) {
                                              widget.onTap();
                                            }
                                          });
                                        },
                                        padding: EdgeInsets.zero,
                                        constraints: BoxConstraints(),
                                      ),
                                    ],
                                  ),
                                ),

                                // Content - StreamBuilder with optimized rebuild behavior
                                ConstrainedBox(
                                  constraints: BoxConstraints(
                                    maxHeight: 350,
                                    maxWidth: 350,
                                  ),
                                  child: StreamBuilder<List<UserWithId>>(
                                    stream: _friendService.getFriendRequests(),
                                    builder: (context, snapshot) {
                                      // Only show loading on initial fetch
                                      if (snapshot.connectionState ==
                                              ConnectionState.waiting &&
                                          !snapshot.hasData) {
                                        return Center(
                                          child: CircularProgressIndicator(
                                            color: colorScheme.secondary,
                                          ),
                                        );
                                      }

                                      if (snapshot.hasError) {
                                        return Padding(
                                          padding: const EdgeInsets.all(16.0),
                                          child: Text(
                                            'Erreur de chargement',
                                            style: TextStyle(
                                                color: colorScheme.error),
                                            textAlign: TextAlign.center,
                                          ),
                                        );
                                      }

                                      final currentRequests =
                                          snapshot.data ?? [];

                                      // Update the main widget's state without rebuilding
                                      if (mounted) {
                                        _friendRequests = currentRequests;
                                      }

                                      if (currentRequests.isEmpty) {
                                        return Padding(
                                          padding: const EdgeInsets.all(16.0),
                                          child: Text(
                                            'Aucune demande d\'ami',
                                            style: TextStyle(
                                                color: colorScheme.onSurface),
                                            textAlign: TextAlign.center,
                                          ),
                                        );
                                      }

                                      return ListView.builder(
                                        shrinkWrap: true,
                                        itemCount: currentRequests.length,
                                        itemBuilder: (context, index) {
                                          final request =
                                              currentRequests[index];
                                          // Check local processing map first, then global
                                          final isProcessing = processingStates[
                                                  request.user.uid] ??
                                              false;

                                          return Padding(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 16, vertical: 8),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    AvatarBannerWidget(
                                                      avatarUrl: request
                                                          .user.avatarEquipped,
                                                      bannerUrl: request
                                                          .user.borderEquipped,
                                                      size: 40,
                                                      avatarFit: BoxFit.cover,
                                                    ),
                                                    const SizedBox(width: 8),
                                                    Expanded(
                                                      child: Text(
                                                        "${request.user.username} vous a envoyé une demande d'ami",
                                                        style: TextStyle(
                                                          color: colorScheme
                                                              .onSurface,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                        maxLines: 2,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 8),
                                                Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.end,
                                                  children: [
                                                    if (isProcessing)
                                                      // Show spinner for processing
                                                      SizedBox(
                                                        width: 24,
                                                        height: 24,
                                                        child:
                                                            CircularProgressIndicator(
                                                          strokeWidth: 2,
                                                          color: colorScheme
                                                              .secondary,
                                                        ),
                                                      )
                                                    else
                                                      // Show buttons when not processing
                                                      Row(
                                                        children: [
                                                          TextButton.icon(
                                                            icon: Icon(
                                                                Icons.check,
                                                                color: Colors
                                                                    .green,
                                                                size: 16),
                                                            label: Text(
                                                              'Accepter',
                                                              style: TextStyle(
                                                                  color: Colors
                                                                      .green),
                                                            ),
                                                            onPressed:
                                                                () async {
                                                              // Activer l'état de chargement
                                                              setOverlayState(
                                                                  () {
                                                                processingStates[
                                                                        request
                                                                            .user
                                                                            .uid] =
                                                                    true;
                                                              });

                                                              try {
                                                                // Appeler le service pour accepter la demande
                                                                await _friendService
                                                                    .acceptFriendRequest(
                                                                        request
                                                                            .user
                                                                            .uid);

                                                                // Afficher d'abord la notification Toast
                                                                showToast(
                                                                    context,
                                                                    'Demande d\'ami acceptée',
                                                                    type: ToastificationType
                                                                        .success);

                                                                // Attendre un petit délai pour laisser le temps à l'utilisateur de voir la notification
                                                                // avant que l'élément disparaisse (le stream mettra à jour la liste automatiquement)
                                                                await Future.delayed(
                                                                    Duration(
                                                                        milliseconds:
                                                                            500));
                                                              } catch (e) {
                                                                if (!mounted)
                                                                  return;
                                                                showToast(context,
                                                                    e.toString(),
                                                                    type: ToastificationType
                                                                        .error);

                                                                // En cas d'erreur, on désactive l'état de chargement
                                                                setOverlayState(
                                                                    () {
                                                                  processingStates
                                                                      .remove(request
                                                                          .user
                                                                          .uid);
                                                                });
                                                              } finally {
                                                                if (mounted) {
                                                                  setOverlayState(
                                                                      () {
                                                                    processingStates
                                                                        .remove(request
                                                                            .user
                                                                            .uid);
                                                                  });
                                                                }
                                                              }
                                                            },
                                                          ),
                                                          const SizedBox(
                                                              width: 8),
                                                          TextButton.icon(
                                                            icon: Icon(
                                                                Icons.close,
                                                                color:
                                                                    Colors.red,
                                                                size: 16),
                                                            label: Text(
                                                              'Refuser',
                                                              style: TextStyle(
                                                                  color: Colors
                                                                      .red),
                                                            ),
                                                            onPressed:
                                                                () async {
                                                              setOverlayState(
                                                                  () {
                                                                processingStates[
                                                                        request
                                                                            .user
                                                                            .uid] =
                                                                    true;
                                                              });

                                                              try {
                                                                await _friendService
                                                                    .rejectFriendRequest(
                                                                        request
                                                                            .user
                                                                            .uid);

                                                                // Afficher la notification Toast d'abord
                                                                showToast(
                                                                    context,
                                                                    'Demande d\'ami refusée',
                                                                    type: ToastificationType
                                                                        .success);

                                                                // Petit délai pour laisser le temps à l'utilisateur de voir la notification
                                                                await Future.delayed(
                                                                    Duration(
                                                                        milliseconds:
                                                                            500));
                                                              } catch (e) {
                                                                if (!mounted)
                                                                  return;
                                                                showToast(context,
                                                                    e.toString(),
                                                                    type: ToastificationType
                                                                        .error);

                                                                // Désactiver l'état de chargement uniquement en cas d'erreur
                                                                setOverlayState(
                                                                    () {
                                                                  processingStates
                                                                      .remove(request
                                                                          .user
                                                                          .uid);
                                                                });
                                                              } finally {
                                                                if (mounted) {
                                                                  setOverlayState(
                                                                      () {
                                                                    processingStates
                                                                        .remove(request
                                                                            .user
                                                                            .uid);
                                                                  });
                                                                }
                                                              }
                                                            },
                                                          ),
                                                        ],
                                                      ),
                                                  ],
                                                ),
                                                if (index <
                                                    currentRequests.length - 1)
                                                  Divider(
                                                      color: colorScheme
                                                          .tertiary
                                                          .withOpacity(0.3)),
                                              ],
                                            ),
                                          );
                                        },
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );

    Overlay.of(context).insert(_overlayEntry!);
  }
}
