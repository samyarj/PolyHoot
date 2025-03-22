import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/themes/app_theme.dart';
import 'package:flutter/material.dart';

Future<bool> showShopConfirmationDialog({
  required BuildContext context,
  required String type,
  required String itemUrl,
  required int price,
}) async {
  String messageTarget = '';
  Widget previewWidget;

  switch (type) {
    case 'avatar':
      messageTarget = 'cet avatar';
      previewWidget = _buildImagePreview(itemUrl);
      break;
    case 'banner':
      messageTarget = "cette bannière d'avatar";
      previewWidget = _buildImagePreview(itemUrl);
      break;
    case 'theme':
      messageTarget = 'ce thème';
      previewWidget = _buildThemePreview(_getAppThemeFromString(itemUrl));
      break;
    default:
      messageTarget = 'cet item';
      previewWidget = const SizedBox();
  }

  return await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Confirmation'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Voulez vous acheter $messageTarget?'),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                SizedBox(
                  height: 100,
                  child: previewWidget,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.monetization_on, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '$price COINS',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Annuler'),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(true),
          child: const Text('Acheter'),
        ),
      ],
    ),
  ) ?? false;
}

Widget _buildImagePreview(String url) {
  return Container(
    decoration: BoxDecoration(
      border: Border.all(color: Colors.grey.shade300),
      borderRadius: BorderRadius.circular(4),
    ),
    child: ClipRRect(
      borderRadius: BorderRadius.circular(3),
      child: Image.network(
        url,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) {
          return const Icon(Icons.broken_image, size: 40);
        },
      ),
    ),
  );
}

Widget _buildThemePreview(AppTheme theme) {
  final themeColorScheme = _getThemeColorScheme(theme);

  return Container(
    decoration: BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          themeColorScheme.primary,
          themeColorScheme.tertiary,
        ],
      ),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: Colors.grey.shade300),
    ),
    child: Center(
      child: Text(
        theme.name.toUpperCase(),
        style: TextStyle(
          color: themeColorScheme.onPrimary,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
      ),
    ),
  );
}

// Helper methods for themes
AppTheme _getAppThemeFromString(String themeName) {
  switch (themeName.toLowerCase()) {
    case 'dark':
      return AppTheme.dark;
    case 'light':
      return AppTheme.light;
    case 'sunset':
      return AppTheme.sunset;
    case 'neon':
      return AppTheme.neon;
    case 'lava':
      return AppTheme.lava;
    case 'inferno':
      return AppTheme.inferno;
    case 'emerald':
      return AppTheme.emerald;
    case 'toxic':
      return AppTheme.toxic;
    case 'vice':
      return AppTheme.vice;
    case 'gold':
      return AppTheme.gold;
    case 'celestial':
      return AppTheme.celestial;
    default:
      return AppTheme.dark;
  }
}

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
