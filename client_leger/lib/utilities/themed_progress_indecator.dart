import 'package:flutter/material.dart';

class ThemedProgressIndicator extends StatelessWidget {
  const ThemedProgressIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return CircularProgressIndicator(
      color: colorScheme.onPrimary,
    );
  }
}
