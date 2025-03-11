import 'package:client_leger/UI/play/widgets/abandon_button.dart';
import 'package:client_leger/UI/play/widgets/game_controls.dart';
import 'package:client_leger/UI/play/widgets/navigation_controls.dart';
import 'package:client_leger/UI/play/widgets/player_list.dart';
import 'package:flutter/material.dart';

// Game control section
class ControlSection extends StatelessWidget {
  const ControlSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.3),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Navigation controls
          NavigationControls(),
          const SizedBox(height: 20),

          // Game controls (pause/alert)
          GameControls(),
          const SizedBox(height: 20),

          // Player list
          SortablePlayerList(),
          const SizedBox(height: 20),

          // Abandon button
          AbandonButton(),
        ],
      ),
    );
  }
}
