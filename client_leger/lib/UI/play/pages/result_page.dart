import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/player_data.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ResultsPage extends ConsumerStatefulWidget {
  const ResultsPage({super.key, required this.playerList});

  final List<PlayerData> playerList;

  @override
  ConsumerState<ResultsPage> createState() => _ResultsPageState();
}

class _ResultsPageState extends ConsumerState<ResultsPage> {
  final WebSocketManager _socketManager = WebSocketManager.instance;
  late final String _username;
  late final bool _isOrganizer;
  late final String _nameForDisconnect;

  @override
  void initState() {
    _username = ref.read(userProvider).value!.username;
    _isOrganizer = !widget.playerList.any((player) => player.name == _username);
    if (_isOrganizer) {
      _nameForDisconnect = "organizer";
    } else {
      _nameForDisconnect = _username;
    }
    super.initState();
  }

  @override
  void dispose() {
    AppLogger.i("DisconnectEvents.UserFromResults $_nameForDisconnect");
    _socketManager.webSocketSender(
        DisconnectEvents.UserFromResults.value, _nameForDisconnect);
    AppLogger.i(
        "DisconnectEvents.UserFromResults $_nameForDisconnect & removing room id");
    _socketManager.removeRoomId();
    super.dispose();
  }

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
