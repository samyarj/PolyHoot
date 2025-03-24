import 'package:client_leger/UI/luck/coinflip/coinflip.dart';
import 'package:client_leger/UI/luck/dailyfree/dailyfree.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox.dart';
import 'package:flutter/material.dart';

class LuckPage extends StatelessWidget {
  const LuckPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          Container(
            color: Theme.of(context)
                .colorScheme
                .primary, // Transparent background for the TabBar
            child: TabBar(
              dividerColor: Colors.transparent,
              labelColor: Theme.of(context).colorScheme.onPrimary,
              unselectedLabelColor: Theme.of(context).colorScheme.onPrimary,
              indicatorColor: Theme.of(context).colorScheme.onPrimary,
              labelStyle: TextStyle(fontSize: 18),
              indicatorSize: TabBarIndicatorSize.label,
              tabs: [
                Tab(
                  text: 'LootBox',
                ),
                Tab(text: 'CoinFlip'),
                Tab(text: 'Prix Quotidien'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              physics: NeverScrollableScrollPhysics(),
              children: [
                getBackroundContainer(LootBox(), context),
                getBackroundContainer(CoinFlipPage(), context),
                getBackroundContainer(Dailyfree(), context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget getBackroundContainer(Widget child, BuildContext context) {
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
      child: child,
    );
  }
}
