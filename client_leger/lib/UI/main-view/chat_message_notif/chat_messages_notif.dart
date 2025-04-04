import 'package:client_leger/UI/global/themed_progress_indicator.dart';
import 'package:client_leger/models/polls/published-poll-model.dart';
import 'package:client_leger/providers/messages/messages_notif_provider.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ChatMessagesNotification extends ConsumerStatefulWidget {
  const ChatMessagesNotification({
    super.key,
  });

  @override
  ConsumerState<ChatMessagesNotification> createState() =>
      _PlayerPollsNotificationState();
}

class _PlayerPollsNotificationState
    extends ConsumerState<ChatMessagesNotification> {
  @override
  void initState() {
    super.initState();
  }

  @override
  dispose() {
    AppLogger.i("Disposing message notif provider");
    ref.read(messageNotifProvider.notifier).dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final messageNotifNotifier = ref.read(messageNotifProvider.notifier);
    final messageNotifState = ref.watch(messageNotifProvider);
    final colorScheme = Theme.of(context).colorScheme;

    int totalUnreadMessages = messageNotifNotifier.getTotalUnreadMessages();

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
            tooltip: 'Notifications de messages',
            position: PopupMenuPosition.under,
            offset: const Offset(0, 8),
            onCanceled: () {},
            onOpened: () {},
            itemBuilder: (context) {
              AppLogger.e("Building menu items");
              return [
                PopupMenuItem<PublishedPoll>(
                  enabled: false,
                  height: 56,
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Center(
                    child: Text(
                      'Messages',
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
                    color:
                        Theme.of(context).colorScheme.tertiary.withOpacity(0.3),
                  ),
                ),
                PopupMenuItem<PublishedPoll>(
                  enabled: false,
                  padding: EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Center(
                          child: totalUnreadMessages == 0
                              ? Text(
                                  "Aucun nouveau message",
                                  style: TextStyle(
                                    color:
                                        Theme.of(context).colorScheme.onSurface,
                                    fontSize: 16,
                                  ),
                                  textAlign: TextAlign.center,
                                )
                              : Text(
                                  "$totalUnreadMessages nouveaux messages",
                                  style: TextStyle(
                                    color:
                                        Theme.of(context).colorScheme.onSurface,
                                    fontSize: 16,
                                  ),
                                  textAlign: TextAlign.center,
                                )),
                    ],
                  ),
                ),
              ];
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
                      FontAwesomeIcons.solidMessage,
                      size: 20,
                      color: colorScheme.secondary,
                    ),
                  ),
                  if (totalUnreadMessages > 0)
                    Positioned(
                      right: 8,
                      bottom: 23,
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
  }
}
