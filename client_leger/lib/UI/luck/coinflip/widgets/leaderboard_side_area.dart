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
      width: 350,
      padding: EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        gradient: gameState == CoinFlipGameState.ResultsPhase
            ? winningSide == sideId
                ? RadialGradient(
                    colors: [
                      Theme.of(context).colorScheme.primary,
                      Theme.of(context).colorScheme.primary, // Transparent edge
                      Theme.of(context).colorScheme.primary, // Transparent edge
                      Color.fromRGBO(0, 255, 0, 0.82), // Winner gradient start
                    ],
                    center: Alignment.center, // Center of the gradient
                    radius: 1.1, // Radius of the gradient
                  )
                : winningSide.isNotEmpty
                    ? RadialGradient(
                        colors: [
                          Theme.of(context).colorScheme.primary,
                          Theme.of(context).colorScheme.primary,
                          Theme.of(context).colorScheme.primary,
                          Color.fromRGBO(255, 0, 0, 0.82),
                        ],
                        center: Alignment.center, // Center of the gradient
                        radius: 1.1, // Radius of the gradient
                      )
                    : null
            : null,
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
            color:
                Theme.of(context).colorScheme.tertiary.withValues(alpha: 0.3),
            spreadRadius: 0,
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            sideId == 'heads' ? "Face" : "Pile",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.onPrimary,
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
                            style: TextStyle(
                              fontSize: 16,
                              color: Theme.of(context).colorScheme.onPrimary,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        player['bet'].toString(),
                        style: TextStyle(
                          fontSize: 16,
                          color: Theme.of(context).colorScheme.onPrimary,
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
