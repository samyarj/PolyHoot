import 'package:client_leger/UI/luck/coinflip/widgets/coin_animation_area.dart';
import 'package:client_leger/UI/luck/coinflip/widgets/leaderboard_side_area.dart';
import 'package:client_leger/UI/luck/coinflip/widgets/place_bet_area.dart';
import 'package:client_leger/business/coinflip_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CoinFlipPage extends ConsumerStatefulWidget {
  const CoinFlipPage({super.key});

  @override
  ConsumerState<CoinFlipPage> createState() => _CoinFlipPageState();
}

class _CoinFlipPageState extends ConsumerState<CoinFlipPage> {
  final TextEditingController _betAmountController = TextEditingController();
  int previousBetAmount = 0;

  @override
  Widget build(BuildContext context) {
    final coinflipState = ref.watch(coinflipProvider);
    final coinflipNotifier = ref.read(coinflipProvider.notifier);

    ref.listen(coinflipProvider, (previous, next) {
      if (next.betAmount != previousBetAmount) {
        previousBetAmount = next.betAmount;
        _betAmountController.text = next.betAmount.toString();
      }
    });

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            //coin history
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: coinflipState.history.reversed.map((flip) {
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
            // coin animation area
            CoinAnimationArea(
              gameState: coinflipState.gameState,
              submitted: coinflipState.submitted,
              selectedSide: coinflipState.selectedSide,
              onSelectSide: (side) => coinflipNotifier.selectSide(side),
              time: coinflipState.time,
            ),
            SizedBox(height: 8),
            // current text or place bet area
            PlaceBetArea(
              gameState: coinflipState.gameState,
              submitted: coinflipState.submitted,
              selectedSide: coinflipState.selectedSide,
              betAmountController: _betAmountController,
              onSubmitBet: coinflipNotifier.submitBet,
              onIncreaseBet: coinflipNotifier.increaseBet,
              onChangedBet: (String value) =>
                  coinflipNotifier.updateBetAmount(int.tryParse(value) ?? 0),
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
                  LeaderboardSideArea(
                    winningSide: coinflipState.winningSide,
                    gameState: coinflipState.gameState,
                    playerList: coinflipState.playerList,
                    sideId: 'heads',
                  ),
                  LeaderboardSideArea(
                    winningSide: coinflipState.winningSide,
                    gameState: coinflipState.gameState,
                    playerList: coinflipState.playerList,
                    sideId: 'tails',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
