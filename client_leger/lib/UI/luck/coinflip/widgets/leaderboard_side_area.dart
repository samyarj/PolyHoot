import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';

class LeaderboardSideArea extends StatelessWidget {
  const LeaderboardSideArea(
      {super.key,
      required this.winningSide,
      required this.gameState,
      required this.playerList,
      required this.sideId});

  final String winningSide;
  final CoinFlipGameState gameState;
  final Map<String, List<Map<String, dynamic>>> playerList;
  final String sideId;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      width: 400,
      padding: EdgeInsets.all(10),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.white),
        borderRadius: BorderRadius.circular(10),
        color:
            winningSide == sideId && gameState == CoinFlipGameState.ResultsPhase
                ? Colors.green.withOpacity(0.2) // Winner styling
                : winningSide != sideId &&
                        gameState == CoinFlipGameState.ResultsPhase
                    ? Colors.red.withOpacity(0.2) // Loser styling
                    : Colors.transparent,
      ),
      child: Column(
        children: [
          Text(
            sideId == 'heads' ? "Face" : "Pile",
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: ListView.builder(
              itemCount: playerList[sideId]?.length ?? 0,
              itemBuilder: (context, index) {
                final player = playerList[sideId]![index];
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: Colors.white.withOpacity(0.1),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Text(
                            "🏆",
                            style: TextStyle(fontSize: 16),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            player['name'],
                            style: const TextStyle(
                              fontSize: 16,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        player['bet'].toString(),
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
