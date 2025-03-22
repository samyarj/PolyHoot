import 'package:client_leger/UI/inventory/widgets/item_grid.dart';
import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/themes/app_theme.dart';
import 'package:flutter/material.dart';

class InventoryItem extends StatelessWidget {
  final dynamic item; // Can be String or AppTheme
  final ItemType itemType;
  final VoidCallback onTap;
  final double size;

  const InventoryItem({
    Key? key,
    required this.item,
    required this.itemType,
    required this.onTap,
    this.size = 80.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: onTap,
      child: itemType == ItemType.theme
          ? _buildThemeItem(context, item as AppTheme)
          : Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                color: colorScheme.primary,
                border: Border.all(
                  color: colorScheme.secondary,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(4),
              ),
              child: _buildItemContent(context),
            ),
    );
  }

  Widget _buildThemeItem(BuildContext context, AppTheme theme) {
    // Get theme colors based on the AppTheme enum
    final themeColorScheme = _getThemeColorScheme(theme);
    final displayName = _getDisplayNameForTheme(theme);

    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        // Apply a gradient background for the theme item
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            themeColorScheme.primary,
            themeColorScheme.tertiary,
          ],
          stops: const [0.7, 1.0],
        ),
        border: Border.all(
          // Use the theme's tertiary color for the border
          color: themeColorScheme.tertiary,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(4),
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
    final colorScheme = Theme.of(context).colorScheme;

    switch (itemType) {
      case ItemType.avatar:
        return Padding(
          padding: const EdgeInsets.all(4.0),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: Image.network(
              item as String,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Center(
                  child: Icon(
                    Icons.broken_image,
                    color: colorScheme.onPrimary,
                  ),
                );
              },
            ),
          ),
        );

      case ItemType.banner:
        return Padding(
          padding: const EdgeInsets.all(4.0),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: Image.network(
              item as String,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Center(
                  child: Icon(
                    Icons.broken_image,
                    color: colorScheme.onPrimary,
                  ),
                );
              },
            ),
          ),
        );

      case ItemType.theme:
        // This should never be called as we now use _buildThemeItem
        return Container();
    }
  }

  // Get theme color scheme based on the AppTheme enum
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
