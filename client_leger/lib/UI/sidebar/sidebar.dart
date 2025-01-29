import 'package:client_leger/UI/mockdata/mockdata.dart';
import 'package:client_leger/UI/sidebar/channel_search.dart';
import 'package:flutter/material.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/models/user.dart'
    as user_model;

class SideBar extends StatefulWidget {
  const SideBar({super.key});

  @override
  State<SideBar> createState() => _SideBarState();
}

class _SideBarState extends State<SideBar> {
  late Future<user_model.User?> _user;

  @override
  void initState() {
    _user = auth_service.currentSignedInUser;
    super.initState();
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
        child: FutureBuilder<user_model.User?>(
            future: _user,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}'));
              } else {
                return _buildDrawerContent(context, snapshot.data);
              }
            }),
      ),
    );
  }

  Widget _buildDrawerContent(BuildContext context, user_model.User? user) {
    return ListView(
      children: [
        DrawerHeader(
          child: Row(
            children: [
              CircleAvatar(
                radius: 40,
                backgroundImage: NetworkImage(
                  user?.avatarEquipped ??
                      mockUser[
                          'avatar_equipped'], // TODO: remplacer par l'avatar du joueur
                ),
              ),
              const SizedBox(width: 16),
              Text(
                user?.username ?? 'Guest',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 250),
        Row(children: [
          SizedBox(width: 16),
          const Text(
            "Messagerie",
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(width: 8),
          const Icon(
            Icons.messenger_outline_outlined,
            color: Colors.white,
          ),
          Spacer(),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: const Icon(
              Icons.add,
              color: Colors.white,
            ),
          )
        ]),
        Divider(),
        JoinChannelSearch(),
      ],
    );
  }
}
