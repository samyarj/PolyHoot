import 'package:flutter/material.dart';

class LuckPage extends StatelessWidget {
  const LuckPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          TabBar(
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white,
            labelStyle: TextStyle(fontSize: 18),
            indicator: BoxDecoration(
              color: const Color.fromARGB(
                  164, 68, 137, 255), // Highlight color for the selected tab
            ),
            indicatorSize: TabBarIndicatorSize.tab, // Make the indicator cove
            tabs: [
              Tab(
                text: 'LootBox',
              ),
              Tab(text: 'CoinFlip'),
              Tab(text: 'Prix Quotidien'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                Text("LootBox"),
                Text("CoinFlip"),
                Text("Prix Quotidien"),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
