import 'package:client_leger/business/coinflip_provider.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CoinFlipPage extends ConsumerStatefulWidget {
  const CoinFlipPage({super.key});

  @override
  ConsumerState<CoinFlipPage> createState() => _CoinFlipPageState();
}

class _CoinFlipPageState extends ConsumerState<CoinFlipPage> {
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
    final coinflipState = ref.watch(coinflipProvider);
    final coinflipNotifier = ref.read(coinflipProvider.notifier);

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: coinflipState.history.map((flip) {
              return Padding(
                padding: const EdgeInsets.all(4.0),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: flip == 'heads' ? Colors.yellow : Colors.grey,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          SizedBox(height: 8),
          Container(
            padding: EdgeInsets.all(10),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white),
              borderRadius: BorderRadius.circular(10),
            ),
            height: 75,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                if (coinflipState.gameState == CoinFlipGameState.BettingPhase &&
                    coinflipState.submitted == false)
                  GestureDetector(
                    onTap: () => coinflipNotifier.selectSide('heads'),
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.yellow,
                          border: coinflipState.selectedSide == 'heads'
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
                      coinflipState.time.toStringAsFixed(1),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                if (coinflipState.gameState == CoinFlipGameState.BettingPhase &&
                    coinflipState.submitted == false)
                  GestureDetector(
                    onTap: () => coinflipNotifier.selectSide('tails'),
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.grey,
                        border: coinflipState.selectedSide == 'tails'
                            ? Border.all(color: Colors.black, width: 3)
                            : null,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          SizedBox(height: 8),
          Container(
            padding: EdgeInsets.all(10),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              style: TextStyle(fontSize: 20),
              getCurrentText(
                coinflipState.gameState,
                coinflipState.selectedSide,
                coinflipState.submitted,
              ),
            ),
          ),
          SizedBox(height: 8),
          //leader board area
          Container(
            padding: EdgeInsets.all(10),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Container(
                    height: 200,
                    width: 400,
                    padding: EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white),
                      borderRadius: BorderRadius.circular(10),
                      color: coinflipState.winningSide == 'heads' &&
                              coinflipState.gameState ==
                                  CoinFlipGameState.ResultsPhase
                          ? Colors.green.withOpacity(0.2) // Winner styling
                          : coinflipState.winningSide != 'heads' &&
                                  coinflipState.gameState ==
                                      CoinFlipGameState.ResultsPhase
                              ? Colors.red.withOpacity(0.2) // Loser styling
                              : Colors.transparent,
                    ),
                    child: Column(
                      children: [
                        Text(
                          "Face",
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Expanded(
                          child: ListView.builder(
                            itemCount:
                                coinflipState.playerList['heads']?.length ?? 0,
                            itemBuilder: (context, index) {
                              final player =
                                  coinflipState.playerList['heads']![index];
                              return Container(
                                margin: const EdgeInsets.symmetric(vertical: 4),
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  color: Colors.white.withOpacity(0.1),
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
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
                    )),
                Container(
                  height: 200,
                  width: 400,
                  padding: EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white),
                    borderRadius: BorderRadius.circular(10),
                    color: coinflipState.winningSide == 'tails' &&
                            coinflipState.gameState ==
                                CoinFlipGameState.ResultsPhase
                        ? Colors.green.withOpacity(0.2) // Winner styling
                        : coinflipState.winningSide != 'tails' &&
                                coinflipState.gameState ==
                                    CoinFlipGameState.ResultsPhase
                            ? Colors.red.withOpacity(0.2) // Loser styling
                            : Colors.transparent,
                  ),
                  child: Column(
                    children: [
                      Text(
                        "Pile",
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Expanded(
                        child: ListView.builder(
                          itemCount:
                              coinflipState.playerList['tails']?.length ?? 0,
                          itemBuilder: (context, index) {
                            final player =
                                coinflipState.playerList['tails']![index];
                            return Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                                color: Colors.white.withOpacity(0.1),
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
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
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
