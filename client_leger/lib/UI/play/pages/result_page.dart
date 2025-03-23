import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/UI/play/widgets/result_player_info.dart';
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
  late final int maxPoints;

  @override
  void initState() {
    _username = ref.read(userProvider).value!.username;
    _isOrganizer = !widget.playerList.any((player) => player.name == _username);
    if (_isOrganizer) {
      _nameForDisconnect = "organizer";
    } else {
      _nameForDisconnect = _username;
    }
    maxPoints = widget.playerList[0].points;
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
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.secondary,
          ],
        ),
      ),
      padding: EdgeInsets.symmetric(vertical: 16.0, horizontal: 64),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedTitleWidget(
            title: "PODIUM",
            fontSize: 40,
          ),
          SizedBox(height: 32),
          Container(
            decoration: BoxDecoration(
              color:
                  Theme.of(context).colorScheme.primary.withValues(alpha: 0.55),
              borderRadius: BorderRadius.circular(30),
              border: Border.all(
                color: Theme.of(context)
                    .colorScheme
                    .tertiary
                    .withValues(alpha: 0.3), // Border color
                width: 2, // Border width
              ),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context)
                      .colorScheme
                      .tertiary
                      .withValues(alpha: 0.3),
                  spreadRadius: 0,
                  blurRadius: 10,
                ),
              ],
            ),
            height: 450,
            padding: EdgeInsets.symmetric(vertical: 16.0, horizontal: 32),
            child: ListView.separated(
              separatorBuilder: (context, index) => SizedBox(
                height: 16,
              ),
              itemCount: widget.playerList.length,
              itemBuilder: (context, index) {
                final player = widget.playerList[index];
                return ResultPlayerInfo(
                  player: player,
                  maxPoints: maxPoints,
                );
              },
            ),
          ),
          Align(
            alignment: Alignment.bottomRight,
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).pop();
              },
              child: Container(
                margin: const EdgeInsets.only(top: 8),
                width: 100,
                height: 50, // Fixed height for medium button
                padding: const EdgeInsets.symmetric(
                    horizontal: 8), // Padding for content
                decoration: BoxDecoration(
                  color:
                      Theme.of(context).colorScheme.primary, // Background color
                  border: Border.all(
                    color:
                        Theme.of(context).colorScheme.tertiary, // Border color
                    width: 3,
                  ),
                  borderRadius: BorderRadius.circular(50), // Rounded corners
                ),
                alignment: Alignment.center,
                child: Text(
                  "Quitter", // Button text
                  style: TextStyle(
                    fontSize: 16,
                    color:
                        Theme.of(context).colorScheme.onPrimary, // Text color
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
