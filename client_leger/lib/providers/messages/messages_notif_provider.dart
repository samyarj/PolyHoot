import 'dart:async';

import 'package:client_leger/backend-communication-services/chat/chat_notif_persistence_service.dart';
import 'package:client_leger/classes/hoot_sound_player.dart';
import 'package:client_leger/push-notif-api/life_cycle_service.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final messageNotifProvider =
    StateNotifierProvider.autoDispose<MessageNotifNotifier, MessageNotifState>(
        (ref) {
  return MessageNotifNotifier();
});

class MessageNotifState {
  final Map<String, int> unreadMessages; // key: channelId, value: unread count

  MessageNotifState({
    this.unreadMessages = const {},
  });

  MessageNotifState copyWith({
    Map<String, int>? unreadMessages,
  }) {
    return MessageNotifState(
      unreadMessages: unreadMessages ?? this.unreadMessages,
    );
  }

  bool get hasUnreadMessages =>
      unreadMessages.values.any((int count) => count > 0);
}

class MessageNotifNotifier extends StateNotifier<MessageNotifState> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  HootSoundPlayer owlSoundPlayer = HootSoundPlayer();
  final chatNotifPersistenceService = ChatNotifPersistenceService();
  String?
      currentDisplayedChannel; // le channel displayed présentement pour ne pas envoyer de notif!
  String?
      recentChannel; /* ca n'a pas rapport avec la feature de notif, c'est juste pour se 
      souvenir du channel le plus recent quand on collapse la sidebar et on l'ouvre de nouveau */

  final Map<String, StreamSubscription> _subscriptions =
      {}; // key: channelId, value: subscription

  StreamSubscription? _chatChannelsSub;

  final Map<String, bool> _firstSnapshotFlags =
      {}; // Track first snapshot for each channel

  bool isInitialized = false;

  final LifecycleService _lifecycleService = LifecycleService();

  MessageNotifNotifier() : super(MessageNotifState());

  String? getUserUid() {
    return FirebaseAuth.instance.currentUser?.uid;
  }

  void onIngameMessageReceived() {
    _playSound();
    if (currentDisplayedChannel != inGameChat) {
      AppLogger.w(
          "Ingame message received and currentDisplayedChannel is $currentDisplayedChannel");
      final int newCount = (state.unreadMessages[inGameChat] ?? 0) + 1;
      state = state.copyWith(unreadMessages: {
        ...state.unreadMessages,
        inGameChat: newCount,
      });
    }
  }

  void onInGameHistoryReceived(int nMessages) {
    if (currentDisplayedChannel != inGameChat) {
      final int newCount = (state.unreadMessages[inGameChat] ?? 0) + nMessages;
      state = state.copyWith(unreadMessages: {
        ...state.unreadMessages,
        inGameChat: newCount,
      });
    }
  }

  void onGameEnd() {
    if (mounted) {
      final updatedUnread = {...state.unreadMessages};
      updatedUnread.remove(inGameChat);
      state = state.copyWith(unreadMessages: updatedUnread);
    }
  }

  // Function to count unread messages in a specific channel -- for the first snapshot
  // Appelé lorsqu'on démarre l'app -- pour restorer les bonnes notifications pour chaque channel
  Future<void> checkUnreadMessages(
      String channelId, QuerySnapshot snapshot) async {
    // Get the last read timestamp for the specific channel from the cache
    final Timestamp? lastReadTimestamp =
        chatNotifPersistenceService.readMessagesCache[channelId];

    if (lastReadTimestamp == null) {
      // If no last read timestamp is found, return early (le user n'est pas abonné à ce channel)
      return;
    }

    int unreadCount = 0;

    // Iterate over the snapshot changes and count the unread messages
    for (final change in snapshot.docChanges) {
      if (change.type == DocumentChangeType.added) {
        Map<String, dynamic> jsonMessage =
            change.doc.data() as Map<String, dynamic>;

        final Timestamp? messageTimestamp = jsonMessage['date'] != null
            ? jsonMessage['date'] as Timestamp
            : null;

        // Compare the message timestamp with the last read timestamp
        if (messageTimestamp != null &&
            messageTimestamp.compareTo(lastReadTimestamp) > 0) {
          unreadCount++;
        }
      }
    }

    // If there are unread messages, update the unread count
    if (unreadCount > 0 && currentDisplayedChannel != channelId) {
      final newCount = (state.unreadMessages[channelId] ?? 0) + unreadCount;
      state = state.copyWith(unreadMessages: {
        ...state.unreadMessages,
        channelId: newCount,
      });
    }
  }

  void listenForNewMessages() {
    if (isInitialized) {
      return;
    }
    isInitialized = true;
    _lifecycleService.startObserving();

    // Listen to global chat messages
    if (!_subscriptions.containsKey('globalChat')) {
      _firstSnapshotFlags['globalChat'] = true;
      _subscriptions['globalChat'] =
          _firestore.collection('globalChat').snapshots().listen((snapshot) {
        if (_firstSnapshotFlags['globalChat'] == true) {
          _firstSnapshotFlags['globalChat'] = false;
          checkUnreadMessages('globalChat', snapshot);
          return;
        }

        for (final change in snapshot.docChanges) {
          if (change.type == DocumentChangeType.added &&
              change.doc.data()?['uid'] != getUserUid()) {
            _playSound();
          }
          if (change.type == DocumentChangeType.added &&
              change.doc.data()?['uid'] != getUserUid() &&
              currentDisplayedChannel != 'globalChat') {
            final int newCount = (state.unreadMessages["globalChat"] ?? 0) + 1;
            state = state.copyWith(unreadMessages: {
              ...state.unreadMessages,
              "globalChat": newCount,
            });
          }
        }
      });
    }

    _chatChannelsSub = _firestore
        .collection('chatChannels')
        .snapshots()
        .listen((channelsSnapshot) async {
      final currentChannelIds =
          channelsSnapshot.docs.map((doc) => doc.id).toSet();

      final subscribedChannelIds = _subscriptions.keys.toSet();

      // if channel gets deleted, do cleanup
      for (final channel in subscribedChannelIds) {
        if (!currentChannelIds.contains(channel) && channel != 'globalChat') {
          AppLogger.w("Channel $channel was deleted, cancelling subscription");

          _subscriptions[channel]?.cancel();
          _subscriptions.remove(channel);
          _firstSnapshotFlags.remove(channel);

          if (state.unreadMessages.containsKey(channel)) {
            final updatedUnread = {...state.unreadMessages};
            updatedUnread.remove(channel);
            state = state.copyWith(unreadMessages: updatedUnread);
          }
        }
      }

      final List<String> toRemoveFromReadMessages = [];

      // if a channel gets deleted we need to remove it from the read messages
      for (final channel
          in chatNotifPersistenceService.readMessagesCache.keys) {
        if (!currentChannelIds.contains(channel) && channel != 'globalChat') {
          toRemoveFromReadMessages.add(channel);
        }
      }

      for (final channel in toRemoveFromReadMessages) {
        await chatNotifPersistenceService
            .removeChannelFromReadMessages(channel);
      }

      for (final channel in channelsSnapshot.docs) {
        final channelData = channel.data();
        final String channelId = channel.id; // channel name

        if (!channelData['users'].contains(getUserUid())) {
          //to do, if user was in the channel before and left, do cleanup

          // user quit channel while being in the Léger OR the LOURD => make sure channelId is not in map of User doc (cleanup)
          await chatNotifPersistenceService
              .removeChannelFromReadMessages(channelId);

          if (_subscriptions.containsKey(channel.id)) {
            AppLogger.w(
                "User left channel ${channel.id}, cancelling subscription");

            _subscriptions[channel.id]?.cancel();
            _subscriptions.remove(channel.id);
            _firstSnapshotFlags.remove(channel.id);

            if (state.unreadMessages.containsKey(channel.id)) {
              final updatedUnread = {...state.unreadMessages};
              updatedUnread.remove(channel.id);
              state = state.copyWith(unreadMessages: updatedUnread);
            }
          }
          continue;
        }

        // user is in channel

        // user joined channel while being in the Léger => make sure channelId is  in map of User doc (update)
        await chatNotifPersistenceService.addChannelToReadMessages(channelId);

        // if user joined channels for the first time and there are previous messages => do not count
        if (!_subscriptions.containsKey(channelId)) {
          AppLogger.w(
              "User joined channel: $channelId, will create a subscription");
          _firstSnapshotFlags[channelId] = true;

          _subscriptions[channelId] = _firestore
              .collection('chatChannels')
              .doc(channelId)
              .collection('messages')
              .snapshots()
              .listen((messagesSnapshot) {
            if (_firstSnapshotFlags[channelId] == true) {
              checkUnreadMessages(channelId, messagesSnapshot);
              _firstSnapshotFlags[channelId] = false;
              return;
            }
            for (final change in messagesSnapshot.docChanges) {
              if (change.type == DocumentChangeType.added &&
                  change.doc.data()?['uid'] != getUserUid()) {
                _playSound();
              }
              if (change.type == DocumentChangeType.added &&
                  change.doc.data()?['uid'] != getUserUid() &&
                  currentDisplayedChannel != channelId) {
                final int newCount =
                    (state.unreadMessages[channel.id] ?? 0) + 1;
                state = state.copyWith(unreadMessages: {
                  ...state.unreadMessages,
                  channel.id: newCount,
                });
              }
            }
          });
        }
      }
    });
  }

  Future<void> _playSound() async {
    if (_lifecycleService.isAppInBackground) {
      return;
    }
    owlSoundPlayer.stop();
    await owlSoundPlayer.play();
  }

  void markChatAsRead(String? channelId) {
    if (channelId == null) {
      return;
    } else {
      if (state.unreadMessages[channelId] != null &&
          state.unreadMessages[channelId] == 0) {
        return;
      }
      final updatedUnread = {...state.unreadMessages};
      updatedUnread[channelId] = 0;
      state = state.copyWith(unreadMessages: updatedUnread);
    }
  }

  int getTotalUnreadMessages() {
    int totalUnread = 0;
    for (final count in state.unreadMessages.values) {
      totalUnread += count;
    }
    return totalUnread;
  }

  @override
  void dispose() {
    AppLogger.w("Disposing message notif provider");
    owlSoundPlayer.stop();
    _lifecycleService.stopObserving();
    _chatChannelsSub?.cancel();
    for (final subscription in _subscriptions.values) {
      subscription.cancel();
    }
    chatNotifPersistenceService.clearReadMessagesCache();
    isInitialized = false;
    super.dispose();
  }
}
