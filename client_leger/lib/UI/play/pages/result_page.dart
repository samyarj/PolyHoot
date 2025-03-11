import 'package:client_leger/models/player_data.dart';
import 'package:flutter/material.dart';

class ResultsPage extends StatefulWidget {
  const ResultsPage({super.key, required this.playerList});

  final List<PlayerData> playerList;

  @override
  State<ResultsPage> createState() => _ResultsPageState();
}

class _ResultsPageState extends State<ResultsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Résultats'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: ListView.builder(
          itemCount: widget.playerList.length,
          itemBuilder: (context, index) {
            final player = widget.playerList[index];
            return Container(
              padding: EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Colors.grey),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    player.name,
                    style: TextStyle(
                      fontSize: 18.0,
                      decoration: player.isInGame
                          ? TextDecoration.none
                          : TextDecoration.lineThrough,
                    ),
                  ),
                  Text(
                    '${player.points} points',
                    style: TextStyle(fontSize: 18.0),
                  ),
                  Text(
                    '${player.noBonusesObtained} bonus',
                    style: TextStyle(fontSize: 18.0),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
