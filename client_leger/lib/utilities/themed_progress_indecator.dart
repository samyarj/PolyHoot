import 'package:flutter/material.dart';

class ThemedProgressIndicator extends StatelessWidget {
  const ThemedProgressIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme; // Get dynamic colors
    return CircularProgressIndicator(
      color: colorScheme.onPrimary, // Use primary color from theme
    );
  }
}
