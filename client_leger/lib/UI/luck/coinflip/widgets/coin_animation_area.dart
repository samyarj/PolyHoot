import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';

class CoinAnimationArea extends StatelessWidget {
  const CoinAnimationArea(
      {super.key,
      required this.gameState,
      required this.submitted,
      required this.selectedSide,
      required this.onSelectSide,
      required this.time});

  final CoinFlipGameState gameState;
  final bool submitted;
  final String selectedSide;
  final void Function(String side) onSelectSide;
  final double time;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(10),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.white),
        borderRadius: BorderRadius.circular(10),
      ),
      height: 75,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          if (gameState == CoinFlipGameState.BettingPhase && submitted == false)
            GestureDetector(
              onTap: () => onSelectSide('heads'),
              child: Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.yellow,
                    border: selectedSide == 'heads'
                        ? Border.all(color: Colors.black, width: 3)
                        : null),
              ),
            ),
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 1),
            ),
            child: Center(
              child: Text(
                time.toStringAsFixed(1),
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          if (gameState == CoinFlipGameState.BettingPhase && submitted == false)
            GestureDetector(
              onTap: () => onSelectSide('tails'),
              child: Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey,
                  border: selectedSide == 'tails'
                      ? Border.all(color: Colors.black, width: 3)
                      : null,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
