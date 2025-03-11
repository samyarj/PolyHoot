import 'package:flutter/material.dart';

// Title Bar Widget
class TitleBar extends StatelessWidget {
  const TitleBar({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 16.0),
      child: Text(
        "Vue Organisateur",
        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        textAlign: TextAlign.center,
      ),
    );
  }
}
