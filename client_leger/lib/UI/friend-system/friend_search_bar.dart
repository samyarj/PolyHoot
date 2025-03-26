// lib/UI/friend-system/friend_search_bar.dart
import 'package:flutter/material.dart';

class FriendSearchBar extends StatelessWidget {
  final TextEditingController controller;
  final ColorScheme colorScheme;

  const FriendSearchBar({
    Key? key,
    required this.controller,
    required this.colorScheme,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        controller: controller,
        style: TextStyle(color: colorScheme.onPrimary),
        decoration: InputDecoration(
          hintText: 'Rechercher un ami...',
          hintStyle: TextStyle(color: colorScheme.onPrimary.withOpacity(0.7)),
          prefixIcon: Icon(Icons.search, color: colorScheme.onPrimary),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: colorScheme.tertiary),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: colorScheme.tertiary),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: colorScheme.secondary, width: 2),
          ),
          filled: true,
          fillColor: colorScheme.primary.withOpacity(0.7),
        ),
      ),
    );
  }
}
