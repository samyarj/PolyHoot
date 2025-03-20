import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';

class PlaceBetArea extends StatelessWidget {
  const PlaceBetArea({
    super.key,
    required this.gameState,
    required this.submitted,
    required this.selectedSide,
    required this.onChangedBet,
    required this.onSubmitBet,
    required this.onIncreaseBet,
    required this.betAmountController,
  });

  final CoinFlipGameState gameState;
  final bool submitted;
  final String selectedSide;
  final void Function(String value) onChangedBet;
  final void Function(BuildContext context) onSubmitBet;
  final void Function(int value) onIncreaseBet;
  final TextEditingController betAmountController;

  String getCurrentText(
      CoinFlipGameState state, String selectedSide, bool submitted) {
    switch (state) {
      case CoinFlipGameState.BettingPhase:
        if (selectedSide.isEmpty && !submitted) {
          return 'Veuillez faire votre choix de face ou pile.';
        } else if (submitted) {
          return 'Veuillez attendre pour la fin de la période des mises';
        }
        break;
      case CoinFlipGameState.PreFlippingPhase:
        return 'La monnaie tournera bientôt...';
      case CoinFlipGameState.FlippingPhase:
        return 'La monnaie tourne!!!';
      case CoinFlipGameState.ResultsPhase:
        return 'Une nouvelle partie commencera sous peu...';
      default:
        return '';
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 300,
      padding: EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
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
      child: gameState == CoinFlipGameState.BettingPhase &&
              selectedSide.isNotEmpty &&
              !submitted
          ? Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: betAmountController,
                        onChanged: (value) {
                          onChangedBet(value);
                        },
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          hintText: "Placer votre mise",
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 10,
                            horizontal: 15,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: () {
                        onSubmitBet(context);
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 20,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: const Text(
                        "Parier",
                        style: TextStyle(fontSize: 16),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                // Separator
                Container(
                  height: 1,
                  width: double.infinity,
                  color: Colors.white.withOpacity(0.5),
                ),
                const SizedBox(height: 10),
                // Automatic Input Area
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        onIncreaseBet(10);
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 20,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: const Text("+10"),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        onIncreaseBet(25);
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 20,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: const Text("+25"),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        onIncreaseBet(50);
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 20,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: const Text("+50"),
                    ),
                  ],
                ),
              ],
            )
          : Text(
              style: TextStyle(fontSize: 20),
              getCurrentText(
                gameState,
                selectedSide,
                submitted,
              ),
            ),
    );
  }
}
