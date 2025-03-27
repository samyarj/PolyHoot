import 'package:client_leger/UI/chat/chatwindow.dart';
import 'package:client_leger/UI/chat/ingame_chatwindow.dart';
import 'package:client_leger/UI/main-view/sidebar/channels.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/user.dart' as user_model;
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

  final ValueNotifier<String?> _recentChannelNotifier =
      ValueNotifier<String?>(null);

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
    final currentRoomId = socketManager.currentRoomIdNotifier.value;
    final tabLength = currentRoomId != null ? 4 : 3;
    _tabController =
        TabController(length: tabLength, vsync: this, initialIndex: 0);
    socketManager.currentRoomIdNotifier.addListener(_updateTabController);
    super.initState();
  }

  void _changeTabAndChannel(int index, String channel) {
    _recentChannelNotifier.value = channel;
    _tabController.animateTo(index);
  }

  String? _getRecentChannel() {
    // edge case: if the recent channel gets deleted by user
    return _recentChannelNotifier.value;
  }

  void _nullifyRecentChannel() {
    // edge case: if the recent channel gets deleted by user
    _recentChannelNotifier.value = null;
  }

  @override
  void dispose() {
    _tabController.dispose();
    socketManager.currentRoomIdNotifier.removeListener(_updateTabController);
    super.dispose();
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

    return ValueListenableBuilder<String?>(
      valueListenable: _recentChannelNotifier,
      builder: (context, recentChannel, child) {
        if (recentChannel == null) {
          return Center(
            child: Text(
              'Aucun canal courant.',
              style: TextStyle(color: colorScheme.onPrimary, fontSize: 18),
            ),
          );
        }
        return ChatWindow(channel: recentChannel);
      },
    );
  }

  Widget _buildChannels() {
    return Channels(
      onChannelPicked: _changeTabAndChannel,
      getRecentChannel: _getRecentChannel,
      nullifyRecentChannel: _nullifyRecentChannel,
    );
  }
}
