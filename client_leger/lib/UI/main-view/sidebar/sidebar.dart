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
  String? _currentChannel;

  @override
  void initState() {
    _tabController = TabController(length: 4, vsync: this);
    super.initState();
  }

  void _changeTabAndChannel(int index, String channel) {
    setState(() {
      _currentChannel = channel;
    });
    print("_current channel is $_currentChannel");
    _tabController.animateTo(index);
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
                  _buildCurrentChat(),
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

  Widget _buildCurrentChat() {
    if (_currentChannel == null) {
      return Center(
        child: Text(
          'Aucun canal courant.',
          style: TextStyle(color: Colors.white),
        ),
      );
    }
    print("_current channel is $_currentChannel before calling chatwindow");

    return ChatWindow(channel: _currentChannel!);
  }

  Widget _buildChannels() {
    return Channels(onChannelPicked: _changeTabAndChannel);
  }
}
