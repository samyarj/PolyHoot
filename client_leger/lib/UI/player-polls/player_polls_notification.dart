import 'package:client_leger/UI/global/themed_progress_indicator.dart';
import 'package:client_leger/UI/player-polls/player_poll.dart';
import 'package:client_leger/backend-communication-services/polls/poll-history-service.dart';
import 'package:client_leger/models/polls/published-poll-model.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class PlayerPollsNotification extends ConsumerStatefulWidget {
  const PlayerPollsNotification({
    super.key,
  });

  @override
  ConsumerState<PlayerPollsNotification> createState() =>
      _PlayerPollsNotificationState();
}

class _PlayerPollsNotificationState
    extends ConsumerState<PlayerPollsNotification> {
  final PollHistoryService _pollService = PollHistoryService();
  PublishedPoll? _selectedPoll;
  bool _menuOpen = false;
  bool _isDialogShowing = false;
  final GlobalKey<PopupMenuButtonState> _popupMenuKey =
      GlobalKey<PopupMenuButtonState>();
  List<PublishedPoll> currentPlayerPolls = [];

  void _selectPoll(PublishedPoll poll) {
    setState(() {
      _selectedPoll = poll;
      _menuOpen = false;
    });

    _showPollDetailsDialog();
  }

  void _closePollDialog(BuildContext dialogContext) {
    if (mounted) {
      Navigator.of(dialogContext).pop();
      setState(() {
        _isDialogShowing = false;
        _selectedPoll = null;
      });
    }
  }

  void _showPollDetailsDialog() {
    if (_isDialogShowing || _selectedPoll == null) return;

    _isDialogShowing = true;

    final colorScheme = Theme.of(context).colorScheme;

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(builder: (context, setStateDialog) {
          final keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
          final isKeyboardVisible = keyboardHeight > 0;

          final containerHeight = isKeyboardVisible
              ? MediaQuery.of(context).size.height * 0.5
              : MediaQuery.of(context).size.height * 0.8;

          return Dialog(
            backgroundColor: Colors.transparent,
            insetPadding: EdgeInsets.zero,
            child: Center(
              child: Material(
                color: colorScheme.surface,
                elevation: 24,
                clipBehavior: Clip.antiAlias,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: colorScheme.tertiary.withOpacity(0.5),
                    width: 2.0,
                  ),
                ),
                child: Container(
                  width: MediaQuery.of(context).size.width * 0.5,
                  height: containerHeight,
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      // Close Button
                      Positioned(
                        top: 12,
                        right: 12,
                        child: IconButton(
                          onPressed: () {
                            _closePollDialog(dialogContext);
                          },
                          icon: Icon(Icons.close),
                          color: colorScheme.onSurface,
                          tooltip: 'Fermer',
                        ),
                      ),

                      // Poll Details Content
                      PlayerPoll(
                        selectedPoll: _selectedPoll!,
                        closeDialog: () {
                          _closePollDialog(dialogContext);
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        });
      },
    );
  }

  void _forceMenuRebuild() {
    // so that the list of popup menu items is updated on live when menu is open
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_popupMenuKey.currentState != null) {
        Navigator.of(_popupMenuKey.currentContext!)
            .pop(); // Close the menu if open
        _popupMenuKey.currentState?.showButtonMenu(); // Show it again
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final userState = ref.watch(userProvider);

    return userState.when(
      data: (user) {
        _pollService.initializePlayerPollsAnswered(user!.pollsAnswered);
        return ListenableBuilder(
          listenable: _pollService,
          builder: (context, _) {
            final isLoading = _pollService.isLoading;
            final playerPolls = _pollService.playerPolls;
            final hasPolls = playerPolls.isNotEmpty;

            if (!listEquals(currentPlayerPolls, playerPolls) &&
                _menuOpen &&
                !isLoading &&
                hasPolls) {
              _forceMenuRebuild();
            }
            currentPlayerPolls = playerPolls;

            return Stack(
              children: [
                Theme(
                  data: Theme.of(context).copyWith(
                    popupMenuTheme: PopupMenuThemeData(
                      elevation: 20,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(
                          color: colorScheme.tertiary.withOpacity(0.5),
                          width: 2,
                        ),
                      ),
                      color: colorScheme.surface,
                    ),
                  ),
                  child: PopupMenuButton<PublishedPoll>(
                    initialValue: null,
                    tooltip: 'Notifications de sondages',
                    position: PopupMenuPosition.under,
                    offset: const Offset(0, 8),
                    key: _popupMenuKey,
                    onCanceled: () {
                      setState(() {
                        _menuOpen = false;
                      });
                    },
                    onOpened: () {
                      setState(() {
                        _menuOpen = true;
                      });
                    },
                    onSelected: _selectPoll,
                    itemBuilder: (context) {
                      AppLogger.e("Building menu items");
                      List<PopupMenuEntry<PublishedPoll>> menuItems = [
                        PopupMenuItem<PublishedPoll>(
                          enabled: false,
                          height: 56,
                          padding:
                              EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          child: Center(
                            child: Text(
                              'Sondages',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                          ),
                        ),
                        PopupMenuItem<PublishedPoll>(
                          enabled: false,
                          height: 1,
                          padding: EdgeInsets.zero,
                          child: Divider(
                            height: 1,
                            thickness: 1,
                            color: Theme.of(context)
                                .colorScheme
                                .tertiary
                                .withOpacity(0.3),
                          ),
                        ),
                      ];

                      // Loading indicator
                      if (isLoading) {
                        AppLogger.e("Loading");

                        menuItems.add(
                          PopupMenuItem<PublishedPoll>(
                            enabled: false,
                            height: 100,
                            padding: EdgeInsets.all(16),
                            child: Center(
                              child: CircularProgressIndicator(),
                            ),
                          ),
                        );
                      }
                      // Empty state
                      else if (!hasPolls) {
                        AppLogger.e("no polls");
                        menuItems.add(
                          PopupMenuItem<PublishedPoll>(
                            enabled: false,
                            height: 100,
                            padding: EdgeInsets.all(16),
                            child: Column(
                              children: [
                                Center(
                                  child: Icon(
                                    FontAwesomeIcons.squarePollHorizontal,
                                    size: 32,
                                    color: Theme.of(context)
                                        .colorScheme
                                        .tertiary
                                        .withOpacity(0.6),
                                  ),
                                ),
                                SizedBox(height: 8),
                                Center(
                                  child: Text(
                                    "Aucun sondage disponible",
                                    style: TextStyle(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onSurface,
                                      fontSize: 14,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }
                      // Poll list
                      else {
                        AppLogger.e(
                            "will add new displayed menuItems for playerpolls current playerpolls is  ${currentPlayerPolls.length}");
                        for (final poll in _pollService.playerPolls) {
                          menuItems.add(
                            PopupMenuItem<PublishedPoll>(
                              value: poll,
                              height: 64,
                              padding: EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          poll.title,
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Theme.of(context)
                                                .colorScheme
                                                .onSurface,
                                            fontSize: 14,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        SizedBox(height: 4),
                                        Text(
                                          "Date fin: ${formatDate(poll.endDate)}",
                                          style: TextStyle(
                                            color: Theme.of(context)
                                                .colorScheme
                                                .onSurface
                                                .withOpacity(0.7),
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(
                                    FontAwesomeIcons.squarePollHorizontal,
                                    color:
                                        Theme.of(context).colorScheme.tertiary,
                                    size: 18,
                                  ),
                                ],
                              ),
                            ),
                          );
                        }
                      }

                      return menuItems;
                    },
                    child: Container(
                      height: 46,
                      width: 46,
                      alignment: Alignment.center,
                      child: Stack(
                        children: [
                          Container(
                            padding: EdgeInsets.all(13),
                            child: Icon(
                              FontAwesomeIcons.bullhorn,
                              size: 18,
                              color: _menuOpen || hasPolls
                                  ? colorScheme.secondary
                                  : colorScheme.tertiary,
                            ),
                          ),
                          if (hasPolls && !_menuOpen)
                            Positioned(
                              right: 12,
                              bottom: 6,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: Colors.red,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                constraints: const BoxConstraints(
                                  minWidth: 9,
                                  minHeight: 9,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
      loading: () {
        return Center(
          child: ThemedProgressIndicator(),
        );
      },
      error: (error, stack) {
        return Center(
          child: Text('Error: $error'),
        );
      },
    );
  }
}
