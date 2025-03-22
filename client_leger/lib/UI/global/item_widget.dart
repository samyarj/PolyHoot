import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/themes/app_theme.dart';
import 'package:client_leger/utilities/enums.dart';
import 'package:flutter/material.dart';

class ItemWidget extends StatelessWidget {
  final dynamic item; // Can be String or AppTheme
  final ItemType itemType;
  final VoidCallback onTap;
  final double size;
  final int? price; // Optional price for shop items
  final bool isShopItem; // Flag to determine if it's a shop item

  const ItemWidget({
    Key? key,
    required this.item,
    required this.itemType,
    required this.onTap,
    this.size = 80.0,
    this.price, // Optional, only needed for shop items
    this.isShopItem = false, // Default to inventory item
  }) : super(key: key);

  // Factory constructor for inventory items
  factory ItemWidget.inventory({
    Key? key,
    required dynamic item,
    required ItemType itemType,
    required VoidCallback onTap,
    double size = 80.0,
  }) {
    return ItemWidget(
      key: key,
      item: item,
      itemType: itemType,
      onTap: onTap,
      size: size,
      isShopItem: false,
    );
  }

  // Factory constructor for shop items
  factory ItemWidget.shop({
    Key? key,
    required dynamic item,
    required ItemType itemType,
    required VoidCallback onTap,
    required int price,
    double size = 70.0,
  }) {
    return ItemWidget(
      key: key,
      item: item,
      itemType: itemType,
      onTap: onTap,
      size: size,
      price: price,
      isShopItem: true,
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Calculate the total height based on whether it's a shop item or not
    final double totalHeight =
        isShopItem ? size + 20 : size; // Add space for price if shop item

    return GestureDetector(
      onTap: onTap,
      child: itemType == ItemType.theme && !isShopItem
          // Special case for theme items in inventory
          ? _buildThemeItem(context, item as AppTheme)
          : Container(
              width: size,
              height: totalHeight,
              decoration: BoxDecoration(
                border: Border.all(
                  color: colorScheme.secondary,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Stack(
                children: [
                  // Main item content
                  Positioned.fill(
                    bottom: isShopItem
                        ? 20
                        : 0, // Space for price bar if it's a shop item
                    child: Container(
                      decoration: BoxDecoration(
                        color: colorScheme.primary,
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(2),
                          topRight: const Radius.circular(2),
                          bottomLeft: Radius.circular(isShopItem ? 0 : 2),
                          bottomRight: Radius.circular(isShopItem ? 0 : 2),
                        ),
                      ),
                      child: itemType == ItemType.theme
                          ? _buildThemeContent(context)
                          : _buildItemContent(context),
                    ),
                  ),

                  // Price bar at bottom (only for shop items)
                  if (isShopItem && price != null)
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

  // Special standalone theme item (for inventory only)
  Widget _buildThemeItem(BuildContext context, AppTheme theme) {
    // Get theme colors based on the AppTheme enum
    final themeColorScheme = _getThemeColorScheme(theme);
    final displayName = _getDisplayNameForTheme(theme);

    return Container(
      width: size,
      height: size,
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

  // Theme content for shop items
  Widget _buildThemeContent(BuildContext context) {
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

  // Avatar/Banner content
  Widget _buildItemContent(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final itemUrl = item as String;

    return Padding(
      padding: const EdgeInsets.all(4.0),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(2),
        child: Image.network(
          itemUrl,
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
