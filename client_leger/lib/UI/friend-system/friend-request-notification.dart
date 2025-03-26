import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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

  @override
  void dispose() {
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

        return StreamBuilder<List<UserWithId>>(
          stream: _friendService.getFriendRequests(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return _buildFriendRequestIcon(0, colorScheme);
            }

            if (snapshot.hasError) {
              return _buildFriendRequestIcon(0, colorScheme);
            }

            _friendRequests = snapshot.data ?? [];
            final requestCount = _friendRequests.length;

            return _buildFriendRequestIcon(requestCount, colorScheme);
          },
        );
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
          IconButton(
            icon: Icon(Icons.notifications),
            iconSize: 18,
            color:
                widget.isActive ? colorScheme.secondary : colorScheme.tertiary,
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
          if (count > 0)
            Positioned(
              right: 11,
              bottom: 10,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(10),
                ),
                constraints: const BoxConstraints(
                  minWidth: 11,
                  minHeight: 11,
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _showFriendRequestsOverlay(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    _overlayEntry = OverlayEntry(
      builder: (context) {
        return GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: () {
            // Deactivate when clicking outside
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
                          final currentRequests = _friendRequests;

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

                                // Content
                                ConstrainedBox(
                                  constraints: BoxConstraints(
                                    maxHeight: 350,
                                    maxWidth: 350,
                                  ),
                                  child: currentRequests.isEmpty
                                      ? Padding(
                                          padding: const EdgeInsets.all(16.0),
                                          child: Text(
                                            'Aucune demande d\'ami',
                                            style: TextStyle(
                                                color: colorScheme.onSurface),
                                            textAlign: TextAlign.center,
                                          ),
                                        )
                                      : ListView.builder(
                                          shrinkWrap: true,
                                          itemCount: currentRequests.length,
                                          itemBuilder: (context, index) {
                                            final request =
                                                currentRequests[index];
                                            final isProcessing =
                                                _processingRequests
                                                    .contains(request.user.uid);

                                            return Padding(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 16,
                                                      vertical: 8),
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Row(
                                                    children: [
                                                      AvatarBannerWidget(
                                                        avatarUrl: request.user
                                                            .avatarEquipped,
                                                        bannerUrl: request.user
                                                            .borderEquipped,
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
                                                        // Show spinner when processing
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
                                                                // Mark as processing in the overlay state
                                                                setOverlayState(
                                                                    () {
                                                                  _processingRequests
                                                                      .add(request
                                                                          .user
                                                                          .uid);
                                                                });

                                                                // Update our own state
                                                                setState(() {
                                                                  _processingRequests
                                                                      .add(request
                                                                          .user
                                                                          .uid);
                                                                });

                                                                try {
                                                                  // Call the service method directly
                                                                  await _friendService
                                                                      .acceptFriendRequest(request
                                                                          .user
                                                                          .uid);
                                                                  setState(() {
                                                                    _friendRequests.removeWhere((req) =>
                                                                        req.user
                                                                            .uid ==
                                                                        request
                                                                            .user
                                                                            .uid);
                                                                  });

                                                                  // If overlay is still open, update its state
                                                                  if (_overlayEntry !=
                                                                      null) {
                                                                    setOverlayState(
                                                                        () {
                                                                      // Update the UI in the overlay by removing this request
                                                                      currentRequests.removeWhere((req) =>
                                                                          req.user
                                                                              .uid ==
                                                                          request
                                                                              .user
                                                                              .uid);
                                                                    });
                                                                  }
                                                                } catch (e) {
                                                                  if (!mounted)
                                                                    return;
                                                                  showErrorDialog(
                                                                      context,
                                                                      e.toString());
                                                                } finally {
                                                                  if (mounted) {
                                                                    setState(
                                                                        () {
                                                                      _processingRequests.remove(request
                                                                          .user
                                                                          .uid);
                                                                    });

                                                                    // If overlay is still open, update its state
                                                                    if (_overlayEntry !=
                                                                        null) {
                                                                      setOverlayState(
                                                                          () {
                                                                        _processingRequests.remove(request
                                                                            .user
                                                                            .uid);
                                                                      });
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                            ),
                                                            const SizedBox(
                                                                width: 8),
                                                            TextButton.icon(
                                                              icon: Icon(
                                                                  Icons.close,
                                                                  color: Colors
                                                                      .red,
                                                                  size: 16),
                                                              label: Text(
                                                                'Refuser',
                                                                style: TextStyle(
                                                                    color: Colors
                                                                        .red),
                                                              ),
                                                              onPressed:
                                                                  () async {
                                                                // Mark as processing in the overlay state
                                                                setOverlayState(
                                                                    () {
                                                                  _processingRequests
                                                                      .add(request
                                                                          .user
                                                                          .uid);
                                                                });

                                                                // Update our own state
                                                                setState(() {
                                                                  _processingRequests
                                                                      .add(request
                                                                          .user
                                                                          .uid);
                                                                });

                                                                try {
                                                                  // Call the service method directly
                                                                  await _friendService
                                                                      .rejectFriendRequest(request
                                                                          .user
                                                                          .uid);
                                                                  setState(() {
                                                                    _friendRequests.removeWhere((req) =>
                                                                        req.user
                                                                            .uid ==
                                                                        request
                                                                            .user
                                                                            .uid);
                                                                  });

                                                                  // If overlay is still open, update its state
                                                                  setOverlayState(
                                                                      () {
                                                                    // Update the UI in the overlay by removing this request
                                                                    currentRequests.removeWhere((req) =>
                                                                        req.user
                                                                            .uid ==
                                                                        request
                                                                            .user
                                                                            .uid);
                                                                  });
                                                                } catch (e) {
                                                                  if (!mounted)
                                                                    return;
                                                                  showErrorDialog(
                                                                      context,
                                                                      e.toString());
                                                                } finally {
                                                                  if (mounted) {
                                                                    setState(
                                                                        () {
                                                                      _processingRequests.remove(request
                                                                          .user
                                                                          .uid);
                                                                    });

                                                                    // If overlay is still open, update its state
                                                                    if (_overlayEntry !=
                                                                        null) {
                                                                      setOverlayState(
                                                                          () {
                                                                        _processingRequests.remove(request
                                                                            .user
                                                                            .uid);
                                                                      });
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                            ),
                                                          ],
                                                        ),
                                                    ],
                                                  ),
                                                  if (index <
                                                      currentRequests.length -
                                                          1)
                                                    Divider(
                                                        color: colorScheme
                                                            .tertiary
                                                            .withOpacity(0.3)),
                                                ],
                                              ),
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
