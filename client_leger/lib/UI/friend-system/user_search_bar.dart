// lib/UI/friend-system/user_search_bar.dart
import 'package:flutter/material.dart';

class UserSearchBar extends StatelessWidget {
  final TextEditingController searchController;
  final VoidCallback openQRScanner;

  const UserSearchBar({
    Key? key,
    required this.searchController,
    required this.openQRScanner,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return TapRegion(
      onTapOutside: (_) => FocusScope.of(context).unfocus(),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            // Search bar
            Expanded(
              child: TextField(
                controller: searchController,
                style: TextStyle(color: colorScheme.onPrimary),
                decoration: InputDecoration(
                  hintText: 'Rechercher un utilisateur...',
                  hintStyle:
                      TextStyle(color: colorScheme.onPrimary.withOpacity(0.7)),
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
                    borderSide:
                        BorderSide(color: colorScheme.secondary, width: 2),
                  ),
                  filled: true,
                  fillColor: colorScheme.primary.withOpacity(0.7),
                ),
              ),
            ),
            // QR Code Scanner button
            Container(
              margin: EdgeInsets.only(left: 8),
              decoration: BoxDecoration(
                color: colorScheme.primary.withOpacity(0.7),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: colorScheme.tertiary,
                  width: 1,
                ),
              ),
              child: IconButton(
                icon: Icon(Icons.qr_code_scanner, color: colorScheme.tertiary),
                tooltip: 'Ajouter par QR code',
                onPressed: openQRScanner,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
