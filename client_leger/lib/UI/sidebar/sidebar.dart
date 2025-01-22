import 'package:client_leger/UI/mockdata/mockdata.dart';
import 'package:client_leger/UI/sidebar/channel_search.dart';
import 'package:flutter/material.dart';

class SideBar extends StatelessWidget {
  const SideBar({super.key});

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
        child: ListView(
          children: [
            DrawerHeader(
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundImage: NetworkImage(
                      mockUser[
                          'avatar_equipped'], // TODO: remplacer par l'avatar du joueur
                    ),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    mockUser[
                        'username'], // TODO: remplacer par le username du joueur
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
        ),
      ),
    );
  }
}
