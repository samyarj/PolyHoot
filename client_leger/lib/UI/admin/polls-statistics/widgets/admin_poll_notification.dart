import 'package:client_leger/UI/admin/polls-statistics/widgets/poll-record-stats.dart';
import 'package:client_leger/backend-communication-services/polls/poll-history-service.dart';
import 'package:client_leger/models/polls/published-poll-model.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:flutter/material.dart';

class AdminPollNotification extends StatefulWidget {
  const AdminPollNotification({Key? key}) : super(key: key);

  @override
  _AdminPollNotificationState createState() => _AdminPollNotificationState();
}

class _AdminPollNotificationState extends State<AdminPollNotification> {
  final PollHistoryService _pollHistoryService = PollHistoryService();
  PublishedPoll? _selectedPoll;
  bool _showPollDetails = false;
  int _currentQuestionIndex = 0;
  bool _menuOpen = false;

  @override
  void initState() {
    super.initState();
  }

  void _selectPoll(PublishedPoll poll) {
    setState(() {
      _selectedPoll = poll;
      _currentQuestionIndex = 0;
      _showPollDetails = true;
      _menuOpen = false;
    });
  }

  void _closePollDetails() {
    setState(() {
      _showPollDetails = false;
    });
  }

  void _nextQuestion() {
    if (_selectedPoll != null &&
        _currentQuestionIndex < _selectedPoll!.questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Listen to changes in the service
    return AnimatedBuilder(
        animation: _pollHistoryService,
        builder: (context, _) {
          final hasPolls = _pollHistoryService.hasExpiredPolls;
          final isLoading = _pollHistoryService.isLoading;
          final expiredPolls = _pollHistoryService.expiredPolls;

          return Stack(
            children: [
              // Poll notification button with dropdown
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
                    // Header item
                    List<PopupMenuEntry<PublishedPoll>> menuItems = [
                      PopupMenuItem<PublishedPoll>(
                        enabled: false,
                        height: 56,
                        padding:
                            EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Sondages Expirés',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: colorScheme.onSurface,
                              ),
                            ),
                            Icon(
                              Icons.notifications,
                              color: colorScheme.tertiary,
                              size: 20,
                            ),
                          ],
                        ),
                      ),
                      PopupMenuItem<PublishedPoll>(
                        enabled: false,
                        height: 1,
                        padding: EdgeInsets.zero,
                        child: Divider(
                          height: 1,
                          thickness: 1,
                          color: colorScheme.tertiary.withOpacity(0.3),
                        ),
                      ),
                    ];

                    // Loading indicator
                    if (isLoading) {
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
                      menuItems.add(
                        PopupMenuItem<PublishedPoll>(
                          enabled: false,
                          height: 100,
                          padding: EdgeInsets.all(16),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.poll_outlined,
                                size: 32,
                                color: colorScheme.tertiary.withOpacity(0.6),
                              ),
                              SizedBox(height: 8),
                              Text(
                                "Aucun sondage expiré",
                                style: TextStyle(
                                  color: colorScheme.onSurface,
                                  fontSize: 14,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      );
                    }
                    // Poll list
                    else {
                      for (var poll in expiredPolls) {
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
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        poll.title,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: colorScheme.onSurface,
                                          fontSize: 14,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        "Date fin: ${formatDate(poll.endDate)}",
                                        style: TextStyle(
                                          color: colorScheme.onSurface
                                              .withOpacity(0.7),
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Icon(
                                  Icons.bar_chart,
                                  color: colorScheme.tertiary,
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
                  // FIX FOR GRAY ICON: Don't use IconButton here, just use an Icon directly
                  child: Container(
                    height: 46,
                    width: 46,
                    alignment: Alignment.center,
                    child: Stack(
                      children: [
                        // Using Icon instead of IconButton
                        Container(
                          padding: EdgeInsets.all(13),
                          child: Icon(
                            Icons.notifications,
                            size: 20,
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

              // Poll details modal popup - FIX FOR BLOCKING SCREEN
              if (_showPollDetails && _selectedPoll != null)
                _buildPollDetailsPopup(context),
            ],
          );
        });
  }

  Widget _buildPollDetailsPopup(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Check if keyboard is visible
    final keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
    final isKeyboardVisible = keyboardHeight > 0;

    // Dynamic height based on keyboard visibility
    final containerHeight = isKeyboardVisible
        ? MediaQuery.of(context).size.height * 0.5
        : MediaQuery.of(context).size.height * 0.8;

    // FIX FOR BLOCKING SCREEN: Use showDialog pattern instead of direct Stack
    // This will ensure proper modal management
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_showPollDetails && _selectedPoll != null) {
        showDialog(
          context: context,
          barrierDismissible: true,
          builder: (BuildContext dialogContext) {
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
                    width: MediaQuery.of(context).size.width * 0.8,
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
                              Navigator.of(dialogContext).pop();
                              _closePollDetails();
                            },
                            icon: Icon(Icons.close),
                            color: colorScheme.onSurface,
                            tooltip: 'Fermer',
                          ),
                        ),

                        // Poll Details Content
                        Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: PollRecordStats(
                            poll: _selectedPoll!,
                            currentQuestionIndex: _currentQuestionIndex,
                            onPreviousQuestion: _previousQuestion,
                            onNextQuestion: _nextQuestion,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ).then((_) => _closePollDetails());
      }
    });

    return Container();
  }
}
