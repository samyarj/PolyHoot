import 'package:client_leger/UI/inventory/widgets/item_grid.dart';
import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/themes/app_theme.dart';
import 'package:flutter/material.dart';

class ShopItemWidget extends StatelessWidget {
  final dynamic item;
  final ItemType itemType;
  final VoidCallback onTap;
  final double size;
  final int price;

  const ShopItemWidget({
    Key? key,
    required this.item,
    required this.itemType,
    required this.onTap,
    required this.price,
    this.size = 70.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size + 20, // Include space for the price
        decoration: BoxDecoration(
          border: Border.all(
            color: Colors.blue.shade800,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Stack(
          children: [
            // Main item content
            Positioned.fill(
              bottom: 20, // Space for price bar
              child: Container(
                decoration: BoxDecoration(
                  color: itemType == ItemType.theme
                      ? Colors.transparent
                      : Colors.blue,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(2),
                    topRight: Radius.circular(2),
                  ),
                ),
                child: itemType == ItemType.theme
                    ? _buildThemeItem(context)
                    : _buildItemContent(context),
              ),
            ),

            // Price bar at bottom
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              height: 20,
              child: Container(
                decoration: BoxDecoration(
                  color: colorScheme.surface.withValues(alpha: 0.4),
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(2),
                    bottomRight: Radius.circular(2),
                  ),
                ),
                child: Center(
                  child: Text(
                    '$price COINS',
                    style: TextStyle(
                      color: colorScheme.onPrimary,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeItem(BuildContext context) {
    // For theme items
    final theme = item as AppTheme;
    final themeColorScheme = _getThemeColorScheme(theme);
    final displayName = _getDisplayNameForTheme(theme);

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            themeColorScheme.primary,
            themeColorScheme.tertiary,
          ],
          stops: const [0.7, 1.0],
        ),
      ),
      child: Center(
        child: Text(
          displayName,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: themeColorScheme.onPrimary,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildItemContent(BuildContext context) {
    // For avatar and banner items
    final itemUrl = item as String;

    return ClipRRect(
      borderRadius: const BorderRadius.only(
        topLeft: Radius.circular(2),
        topRight: Radius.circular(2),
      ),
      child: Image.network(
        itemUrl,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return const Center(
            child: Icon(
              Icons.broken_image,
              color: Colors.white,
            ),
          );
        },
      ),
    );
  }

  // Helper methods for themes
  ColorScheme _getThemeColorScheme(AppTheme theme) {
    switch (theme) {
      case AppTheme.light:
        return AppThemes.lightTheme.colorScheme;
      case AppTheme.dark:
        return AppThemes.darkTheme.colorScheme;
      case AppTheme.sunset:
        return AppThemes.sunsetTheme.colorScheme;
      case AppTheme.neon:
        return AppThemes.neonTheme.colorScheme;
      case AppTheme.lava:
        return AppThemes.lavaTheme.colorScheme;
      case AppTheme.inferno:
        return AppThemes.infernoTheme.colorScheme;
      case AppTheme.emerald:
        return AppThemes.emeraldTheme.colorScheme;
      case AppTheme.toxic:
        return AppThemes.toxicTheme.colorScheme;
      case AppTheme.vice:
        return AppThemes.viceTheme.colorScheme;
      case AppTheme.gold:
        return AppThemes.goldTheme.colorScheme;
      case AppTheme.celestial:
        return AppThemes.celestialTheme.colorScheme;
      default:
        return AppThemes.darkTheme.colorScheme;
    }
  }

  String _getDisplayNameForTheme(AppTheme theme) {
    // Convert enum value to a display-friendly name
    switch (theme) {
      case AppTheme.dark:
        return 'DARK';
      case AppTheme.light:
        return 'LIGHT';
      case AppTheme.sunset:
        return 'SUNSET';
      case AppTheme.neon:
        return 'NEON';
      case AppTheme.lava:
        return 'LAVA';
      case AppTheme.inferno:
        return 'INFERNO';
      case AppTheme.emerald:
        return 'EMERALD';
      case AppTheme.toxic:
        return 'TOXIC';
      case AppTheme.vice:
        return 'VICE';
      case AppTheme.gold:
        return 'GOLD';
      case AppTheme.celestial:
        return 'CELESTIAL';
      default:
        return theme.name.toUpperCase();
    }
  }
}
