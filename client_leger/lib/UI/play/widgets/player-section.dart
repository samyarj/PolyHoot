import 'package:client_leger/UI/play/widgets/player_list.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PlayerSection extends ConsumerWidget {
  const PlayerSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;

    return LayoutBuilder(builder: (context, constraints) {
      // Check for extremely tight constraints
      final isVeryConstrained = constraints.maxHeight < 50;
      final headerHeight = isVeryConstrained ? 30.0 : 36.0;
      final dividerHeight = isVeryConstrained ? 2.0 : 4.0;

      return Container(
        height: constraints.maxHeight,
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: colorScheme.tertiary,
            width: 2,
          ),
        ),
        child: isVeryConstrained
            // Ultra-compact version for very small heights
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: Text(
                    'Joueurs',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onPrimary,
                    ),
                  ),
                ),
              )
            // Normal version with reduced sizes
            : Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Header with reduced height
                  Container(
                    height: headerHeight,
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 2),
                    alignment: Alignment.center,
                    child: Text(
                      'Joueurs',
                      style: TextStyle(
                        fontSize: 16, // Smaller font
                        fontWeight: FontWeight.bold,
                        color: colorScheme.onPrimary,
                      ),
                    ),
                  ),

                  // Divider with minimal height
                  Container(
                    height: dividerHeight,
                    child: Divider(
                      color: colorScheme.tertiary.withOpacity(0.3),
                      thickness: 1,
                      height: dividerHeight,
                    ),
                  ),

                  // Player list with remaining space
                  Expanded(
                    child: ImprovedPlayerList(),
                  ),
                ],
              ),
      );
    });
  }
}
