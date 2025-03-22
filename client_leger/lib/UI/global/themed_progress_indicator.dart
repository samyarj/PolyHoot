import 'package:flutter/material.dart';

class ThemedProgressIndicator extends StatelessWidget {
  final double size;

  const ThemedProgressIndicator({
    super.key,
    this.size = 40.0,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(colorScheme.primary),
        strokeWidth: 4.0,
      ),
    );
  }
}
