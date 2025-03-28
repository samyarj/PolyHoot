// lib/UI/friend-system/sidebar_header.dart
import 'package:flutter/material.dart';

class SidebarHeader extends StatelessWidget {
  final String title;
  final VoidCallback onClose;

  const SidebarHeader({
    Key? key,
    required this.title,
    required this.onClose,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: colorScheme.secondary,
            width: 1.0,
          ),
        ),
      ),
      child: LayoutBuilder(builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        const closeButtonWidth = 48.0;
        final textWidth = availableWidth - closeButtonWidth - 16;

        return Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: textWidth > 0 ? textWidth : 0,
              child: Text(
                title,
                style: TextStyle(
                  color: colorScheme.onPrimary,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ),
            IconButton(
              icon: Icon(Icons.close, color: colorScheme.onPrimary),
              onPressed: onClose,
              constraints: BoxConstraints.tightFor(
                  width: closeButtonWidth, height: closeButtonWidth),
            ),
          ],
        );
      }),
    );
  }
}
