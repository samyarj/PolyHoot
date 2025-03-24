import 'package:flutter/material.dart';

class EmptyMessage extends StatelessWidget {
  final String message;
  
  const EmptyMessage({
    Key? key,
    required this.message,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Container(
      width: double.infinity,
      height: 80,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      alignment: Alignment.centerLeft,
      child: Text(
        message,
        style: TextStyle(
          color: colorScheme.onPrimary,
          fontStyle: FontStyle.italic,
        ),
      ),
    );
  }
}
