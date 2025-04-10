import 'package:client_leger/backend-communication-services/chat/chat_notif_persistence_service.dart';
import 'package:client_leger/providers/messages/messages_notif_provider.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:collection/collection.dart';

class ChatMessagesNotification extends ConsumerStatefulWidget {
  const ChatMessagesNotification({
    super.key,
  });

  @override
  ConsumerState<ChatMessagesNotification> createState() =>
      _ChatMessagesNotificationState();
}

class _ChatMessagesNotificationState
    extends ConsumerState<ChatMessagesNotification> {
  bool _menuOpen = false;
  bool _isForcingMenuRebuild = false;
  final GlobalKey<PopupMenuButtonState> _popupMenuKey =
      GlobalKey<PopupMenuButtonState>();
  int _previousTotalUnreadMessages = 0;
  final mapEquals = const DeepCollectionEquality().equals;
  final chatNotifPersistenceService = ChatNotifPersistenceService();
  Map<String, Timestamp>? _previousReadMessages;

  void _forceChatNotifMenuRebuild() {
    // so that the list of popup menu items is updated on live when menu is open
    AppLogger.e("Forcing menu rebuild");
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_popupMenuKey.currentState != null) {
        Navigator.of(_popupMenuKey.currentContext!)
            .pop(); // Close the menu if open
        _popupMenuKey.currentState?.showButtonMenu(); // Show it again
        _isForcingMenuRebuild = true;
        _menuOpen = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final messageNotifNotifier = ref.read(messageNotifProvider.notifier);
    final messageNotifState = ref.watch(messageNotifProvider);
    final userState = ref.watch(userProvider);
    final colorScheme = Theme.of(context).colorScheme;

    userState.whenData((user) {
      final currentReadMessages = user?.readMessages;

      if (!ref.read(messageNotifProvider.notifier).isInitialized &&
          currentReadMessages != null) {
        chatNotifPersistenceService.setReadMessagesCache(currentReadMessages);
        _previousReadMessages = currentReadMessages;
        ref.read(messageNotifProvider.notifier).listenForNewMessages();
      }

      // Compare the readMessages using mapEquals
      if (currentReadMessages != null &&
          !mapEquals(_previousReadMessages, currentReadMessages)) {
        chatNotifPersistenceService.setReadMessagesCache(currentReadMessages);
        _previousReadMessages = currentReadMessages;
      }
    });

    int totalUnreadMessages = messageNotifNotifier.getTotalUnreadMessages();

    if (totalUnreadMessages != _previousTotalUnreadMessages && _menuOpen) {
      _forceChatNotifMenuRebuild();
    }
    _previousTotalUnreadMessages = totalUnreadMessages;

    String lastChannel = messageNotifState.unreadMessages.entries
        .lastWhere(
          (entry) => entry.value > 0,
          orElse: () => MapEntry<String, int>('', 0),
        )
        .key;

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
          child: PopupMenuButton<String>(
            initialValue: null,
            tooltip: 'Notifications de messages',
            position: PopupMenuPosition.under,
            offset: const Offset(0, 8),
            key: _popupMenuKey,
            onCanceled: () {
              if (_isForcingMenuRebuild) {
                _isForcingMenuRebuild = false;
                return;
              }
              setState(() {
                _menuOpen = false;
              });
            },
            onOpened: () {
              setState(() {
                _menuOpen = true;
              });
            },
            itemBuilder: (context) {
              AppLogger.e("Building menu items");
              return [
                PopupMenuItem<String>(
                  enabled: false,
                  height: 56,
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Center(
                    child: Text(
                      'Nouveaux Messages',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                  ),
                ),
                PopupMenuItem<String>(
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
                if (totalUnreadMessages == 0)
                  PopupMenuItem<String>(
                    enabled: false,
                    padding: EdgeInsets.all(16),
                    child: Center(
                        child: Text(
                      "Aucun nouveau message",
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onSurface,
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    )),
                  ),
                if (totalUnreadMessages > 0)
                  ...messageNotifState.unreadMessages.entries
                      .where((entry) => entry.value > 0)
                      .expand(
                        (entry) => [
                          PopupMenuItem<String>(
                            enabled: false,
                            padding: EdgeInsets.all(16),
                            child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    entry.key == "globalChat"
                                        ? "General"
                                        : entry.key == inGameChat
                                            ? "Partie"
                                            : entry.key,
                                    style: TextStyle(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onSurface,
                                      fontSize: 16,
                                    ),
                                    textAlign: TextAlign.start,
                                  ),
                                  Text(
                                    "+${entry.value}",
                                    style: TextStyle(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onSurface,
                                      fontSize: 16,
                                    ),
                                    textAlign: TextAlign.start,
                                  ),
                                ]),
                          ),
                          if (lastChannel.isNotEmpty &&
                              entry.key != lastChannel)
                            PopupMenuItem<String>(
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
                        ],
                      )
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
                      color: _menuOpen
                          ? colorScheme.secondary
                          : colorScheme.tertiary,
                    ),
                  ),
                  if (totalUnreadMessages > 0)
                    Positioned(
                      right: totalUnreadMessages > 99 ? 1 : 8,
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
                        child: Text(
                            "${totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                            ),
                            textAlign: TextAlign.center),
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
