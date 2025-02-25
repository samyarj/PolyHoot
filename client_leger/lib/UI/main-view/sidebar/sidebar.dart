import 'package:client_leger/UI/chat/chatwindow.dart';
import 'package:client_leger/UI/main-view/sidebar/channels.dart';
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;
import 'package:flutter/material.dart';

class SideBar extends StatefulWidget {
  const SideBar({super.key, required this.user});

  final user_model.User? user;

  @override
  State<SideBar> createState() => _SideBarState();
}

class _SideBarState extends State<SideBar> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ValueNotifier<String?> _recentChannelNotifier =
      ValueNotifier<String?>(null);

  @override
  void initState() {
    _tabController = TabController(length: 4, vsync: this);
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Container(
        margin: EdgeInsets.only(top: 2),
        decoration: BoxDecoration(
          shape: BoxShape.rectangle,
          gradient: LinearGradient(
            colors: [Color(0xFF00115A), Color(0xFF004080)], // Gradient colors
            begin: Alignment.topCenter, // Start at the top
            end: Alignment.bottomCenter, // End at the bottom
          ),
        ),
        child: Column(
          children: [
            TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white,
              labelStyle: TextStyle(fontSize: 18),
              tabs: [
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
                  _buildIngameChat(),
                  _buildGeneralChat(),
                  _buildRecentChat(),
                  _buildChannels(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIngameChat() {
    return Center(
        child: Text('Ingame Chat', style: TextStyle(color: Colors.white)));
  }

  Widget _buildGeneralChat() {
    return ChatWindow(channel: "General");
  }

  Widget _buildRecentChat() {
    return ValueListenableBuilder<String?>(
      valueListenable: _recentChannelNotifier,
      builder: (context, recentChannel, child) {
        if (recentChannel == null) {
          return Center(
            child: Text(
              'Aucun canal courant.',
              style: TextStyle(color: Colors.white, fontSize: 18),
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
