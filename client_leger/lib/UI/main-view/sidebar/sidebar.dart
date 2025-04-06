import 'dart:async';
import 'package:client_leger/UI/chat/chatwindow.dart';
import 'package:client_leger/UI/chat/ingame_chatwindow.dart';
import 'package:client_leger/UI/main-view/sidebar/channels.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:client_leger/models/chat_channels.dart';
import 'package:client_leger/models/user.dart' as user_model;
import 'package:client_leger/providers/messages/messages_notif_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SideBar extends ConsumerStatefulWidget {
  const SideBar({super.key, required this.user});

  final user_model.User? user;

  @override
  ConsumerState<SideBar> createState() => _SideBarState();
}

class _SideBarState extends ConsumerState<SideBar>
    with TickerProviderStateMixin {
  late TabController _tabController;
  final socketManager = WebSocketManager.instance;
  final _channelManager = ChannelManager();
  StreamSubscription<List<ChatChannel>>? _chatChannelsSubscription;
  final ValueNotifier<List<ChatChannel>> _channelsNotifier = ValueNotifier([]);
  late final MessageNotifNotifier _notifier;

  void _updateTabController() {
    final currentRoomId = socketManager.currentRoomIdNotifier.value;
    final newTabLength = currentRoomId != null ? 4 : 3;

    if (_tabController.length != newTabLength) {
      _tabController.dispose();
      setState(() {
        _tabController =
            TabController(length: newTabLength, vsync: this, initialIndex: 0);
      });
    }
  }

  @override
  void initState() {
    super.initState();
    final currentRoomId = socketManager.currentRoomIdNotifier.value;
    final tabLength = currentRoomId != null ? 4 : 3;
    _tabController =
        TabController(length: tabLength, vsync: this, initialIndex: 0);
    socketManager.currentRoomIdNotifier.addListener(_updateTabController);

    _chatChannelsSubscription =
        _channelManager.fetchAllChannels(widget.user?.uid).listen((channels) {
      _channelsNotifier.value = channels;
    });

    _notifier = ref.read(messageNotifProvider.notifier);
  }

  void _changeTabAndChannel(int index, String channel) {
    AppLogger.i("Changing tab to $index and channel to $channel");
    if (socketManager.currentRoomIdNotifier.value == null) {
      index--;
    }
    _notifier.recentChannel = channel;
    _tabController.animateTo(index);
  }

  @override
  void dispose() {
    super.dispose();
    _notifier.currentDisplayedChannel = null;
    _tabController.dispose();
    socketManager.currentRoomIdNotifier.removeListener(_updateTabController);
    _chatChannelsSubscription?.cancel();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
        color: colorScheme.primary,
      ),
      child: Column(
        children: [
          TabBar(
            controller: _tabController,
            labelColor: colorScheme.onPrimary,
            unselectedLabelColor: colorScheme.tertiary,
            labelStyle: TextStyle(fontSize: 18),
            indicator: BoxDecoration(
              color: colorScheme.secondary,
            ),
            indicatorSize: TabBarIndicatorSize
                .tab, // Make the indicator cover the entire tab
            tabs: [
              if (socketManager.currentRoomIdNotifier.value != null)
                Tab(text: 'Partie'),
              Tab(text: 'Général'),
              Tab(text: 'Récent'),
              Tab(text: 'Canaux'),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                if (socketManager.currentRoomIdNotifier.value != null)
                  _buildIngameChat(),
                _buildGeneralChat(),
                _buildRecentChat(),
                _buildChannels(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIngameChat() {
    return InGameChatWindow();
  }

  Widget _buildGeneralChat() {
    return ChatWindow(channel: "General");
  }

  Widget _buildRecentChat() {
    final colorScheme = Theme.of(context).colorScheme;

    return ValueListenableBuilder<List<ChatChannel>>(
      valueListenable: _channelsNotifier,
      builder: (context, channels, _) {
        final isRecentChannelValid = _notifier.recentChannel != null &&
            channels.any((channel) =>
                channel.name == _notifier.recentChannel &&
                channel.isUserInChannel);

        if (isRecentChannelValid) {
          AppLogger.i("Recent channel is valid: ${_notifier.recentChannel} ");

          return ChatWindow(channel: _notifier.recentChannel!);
        } else {
          _notifier.recentChannel = null;
          _notifier.currentDisplayedChannel = null;
          return Center(
            child: Text(
              'Aucun canal courant.',
              style: TextStyle(color: colorScheme.onPrimary, fontSize: 18),
            ),
          );
        }
      },
    );
  }

  Widget _buildChannels() {
    return Channels(
      onChannelPicked: _changeTabAndChannel,
      channelsNotifier: _channelsNotifier,
      userUid: widget.user?.uid,
    );
  }
}
