// lib/UI/friend-system/friend_tab_bar.dart
import 'package:flutter/material.dart';

class FriendTabBar extends StatelessWidget {
  final ColorScheme colorScheme;

  const FriendTabBar({
    Key? key,
    required this.colorScheme,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TabBar(
      labelColor: colorScheme.onPrimary,
      unselectedLabelColor: colorScheme.tertiary,
      labelStyle: const TextStyle(fontSize: 18),
      indicator: BoxDecoration(
        color: colorScheme.secondary.withOpacity(0.55),
      ),
      indicatorSize: TabBarIndicatorSize.tab,
      labelPadding: EdgeInsets.zero,
      tabs: [
        Container(
          width: double.infinity,
          alignment: Alignment.center,
          child: Tab(text: 'Amis'),
        ),
        Container(
          width: double.infinity,
          alignment: Alignment.center,
          child: Tab(text: 'Ajouter'),
        ),
      ],
    );
  }
}
