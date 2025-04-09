import 'dart:async';
import 'package:client_leger/backend-communication-services/chat/chat_notif_persistence_service.dart';
import 'package:client_leger/classes/hoot_sound_player.dart';
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

  MessageNotifNotifier() : super(MessageNotifState());

  String? getUserUid() {
    return FirebaseAuth.instance.currentUser?.uid;
  }

  void onIngameMessageReceived() {
    if (currentDisplayedChannel != inGameChat) {
      _playSound();
      final int newCount = (state.unreadMessages[inGameChat] ?? 0) + 1;
      state = state.copyWith(unreadMessages: {
        ...state.unreadMessages,
        inGameChat: newCount,
      });
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
    // Listen to global chat messages
    if (!_subscriptions.containsKey('globalChat')) {
      _firstSnapshotFlags['globalChat'] = true;
      _subscriptions['globalChat'] =
          _firestore.collection('globalChat').snapshots().listen((snapshot) {
        if (_firstSnapshotFlags['globalChat'] == true) {
          _firstSnapshotFlags['globalChat'] = false;
          AppLogger.w(
              "First snapshot for global chat, will check unread messages");
          checkUnreadMessages('globalChat', snapshot);
          return;
        }

        for (final change in snapshot.docChanges) {
          if (change.type == DocumentChangeType.added &&
              change.doc.data()?['uid'] != getUserUid() &&
              currentDisplayedChannel != 'globalChat') {
            _playSound();
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
      AppLogger.e(
          "in the callback of channelsSnapshot listening to chatChannels collection");

      final currentChannelIds =
          channelsSnapshot.docs.map((doc) => doc.id).toSet();

      final subscribedChannelIds = _subscriptions.keys.toSet();

      // if channel gets deleted, do cleanup
      for (final channel in subscribedChannelIds) {
        if (!currentChannelIds.contains(channel) && channel != 'globalChat') {
          AppLogger.e("Channel $channel was deleted, cancelling subscription");

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

      AppLogger.w("going to iterate through channelsSnapshot");

      for (final channel in channelsSnapshot.docs) {
        final channelData = channel.data();
        final String channelId = channel.id; // channel name
        AppLogger.w("in the loop channelId: $channelId");

        if (!channelData['users'].contains(getUserUid())) {
          //to do, if user was in the channel before and left, do cleanup
          AppLogger.w("User is not in channel $channelId");

          // user quit channel while being in the Léger OR the LOURD => make sure channelId is not in map of User doc (cleanup)
          await chatNotifPersistenceService
              .removeChannelFromReadMessages(channelId);

          if (_subscriptions.containsKey(channel.id)) {
            AppLogger.e(
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
        AppLogger.e("User is in channel $channelId");

        // user joined channel while being in the Léger => make sure channelId is  in map of User doc (update)
        await chatNotifPersistenceService.addChannelToReadMessages(channelId);

        // if user joined channels for the first time and there are previous messages => do not count
        if (!state.unreadMessages.containsKey(channelId) &&
            !_subscriptions.containsKey(channelId)) {
          AppLogger.e("User joined channel: $channelId");
          _firstSnapshotFlags[channelId] = true;

          _subscriptions[channelId] = _firestore
              .collection('chatChannels')
              .doc(channelId)
              .collection('messages')
              .snapshots()
              .listen((messagesSnapshot) {
            if (_firstSnapshotFlags[channelId] == true) {
              AppLogger.w(
                  "First snapshot for $channelId, will check unread messages");
              checkUnreadMessages(channelId, messagesSnapshot);
              _firstSnapshotFlags[channelId] = false;
              return;
            }
            for (final change in messagesSnapshot.docChanges) {
              if (change.type == DocumentChangeType.added &&
                  change.doc.data()?['uid'] != getUserUid() &&
                  currentDisplayedChannel != channelId) {
                _playSound();
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
    AppLogger.w("Playing sound");
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
      AppLogger.e("Marking channel $channelId as read");
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
    AppLogger.e("Disposing message notif provider");
    owlSoundPlayer.stop();
    _chatChannelsSub?.cancel();
    for (final subscription in _subscriptions.values) {
      subscription.cancel();
    }
    chatNotifPersistenceService.clearReadMessagesCache();
    isInitialized = false;
    super.dispose();
  }
}
