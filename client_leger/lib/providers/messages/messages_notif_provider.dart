import 'dart:async';
import 'package:client_leger/classes/sound_player.dart';
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
  SoundPlayer owlSoundPlayer = SoundPlayer();
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

  MessageNotifNotifier() : super(MessageNotifState()) {
    AppLogger.e("Initializing message notif provider");
    _listenForNewMessages();
  }

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

  void _listenForNewMessages() {
    // Listen to global chat messages
    if (!_subscriptions.containsKey('globalChat')) {
      _firstSnapshotFlags['globalChat'] = true;
      _subscriptions['globalChat'] =
          _firestore.collection('globalChat').snapshots().listen((snapshot) {
        if (_firstSnapshotFlags['globalChat'] == true) {
          _firstSnapshotFlags['globalChat'] = false;
          AppLogger.e("Skipping first snapshot for global chat");
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
        .listen((channelsSnapshot) {
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

      AppLogger.e("going to iterate through channelsSnapshot");

      for (final channel in channelsSnapshot.docs) {
        final channelData = channel.data();
        final String channelId = channel.id; // channel name
        AppLogger.e("in the loop channelId: $channelId");

        if (!channelData['users'].contains(getUserUid())) {
          //to do, if user was in the channel before and left, do cleanup
          AppLogger.e("User is not in channel $channelId, we return");
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
              AppLogger.i(
                  "Skipping first snapshot for channel $channelId, user just joined!");
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
    await owlSoundPlayer.play(
      source: HOOT_SOUND_PATH,
    );
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
    super.dispose();
  }
}
