import 'package:flutter/material.dart';

class LeaveGameButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final double? fontSize;
  final EdgeInsetsGeometry? padding;
  final bool alignRight;
  final double rightPadding;
  final bool isEnabled;

  const LeaveGameButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.fontSize = 16,
    this.padding = const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
    this.alignRight = false,
    this.rightPadding = 30,
    this.isEnabled = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final button = ElevatedButton(
      onPressed: isEnabled ? onPressed : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: colorScheme.primary.withValues(alpha: 0.9),
        foregroundColor: colorScheme.onPrimary,
        disabledBackgroundColor: colorScheme.primary.withValues(alpha: 0.4),
        padding: padding,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(40),
          side: isEnabled
              ? BorderSide(
                  color: colorScheme.tertiary,
                  width: 2,
                )
              : BorderSide.none,
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.bold,
          color: isEnabled
              ? colorScheme.onPrimary
              : colorScheme.onPrimary.withValues(alpha: 0.6),
        ),
      ),
    );

    if (alignRight) {
      return Align(
        alignment: Alignment.centerRight,
        child: Padding(
          padding: EdgeInsets.only(right: rightPadding),
          child: button,
        ),
      );
    }

    return button;
  }
}
