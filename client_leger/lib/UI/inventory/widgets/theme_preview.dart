import 'package:client_leger/providers/theme_provider.dart';
import 'package:flutter/material.dart';
import 'package:client_leger/themes/app_theme.dart';

class ThemePreview extends StatelessWidget {
  final AppTheme theme;

  const ThemePreview({
    Key? key,
    required this.theme,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Get the ColorScheme for the selected theme from AppThemes
    final previewColorScheme = _getThemeColorScheme(theme);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(1000),
        boxShadow: [
          BoxShadow(
            color: previewColorScheme.primary,
            blurRadius: 40,
            spreadRadius: 5,
          ),
        ],
        color: Color.lerp(previewColorScheme.primary, Colors.black, 0.1),
      ),
      child: ClipOval(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            // Primary color
            _buildColorPreview(
              'Couleur primaire',
              previewColorScheme.primary,
              previewColorScheme.onPrimary,
            ),

            // Secondary color
            _buildColorPreview(
              'Couleur secondaire',
              previewColorScheme.secondary,
              previewColorScheme.onSecondary,
            ),

            // Tertiary color
            _buildColorPreview(
              'Couleur tertiaire',
              previewColorScheme.tertiary,
              previewColorScheme.onTertiary,
            ),

            // Accent colors
            Expanded(
              child: Column(
                children: [
                  _buildAccentPreview(
                    'Accent barre',
                    previewColorScheme.surface,
                    previewColorScheme.onSurface,
                  ),
                  _buildAccentPreview(
                    'Accent survolé',
                    Color.lerp(previewColorScheme.primary,
                        previewColorScheme.secondary, 0.5)!,
                    previewColorScheme.onPrimary,
                  ),
                  _buildAccentPreview(
                    'Accent actif',
                    previewColorScheme.secondary,
                    previewColorScheme.onSecondary,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildColorPreview(String label, Color bgColor, Color textColor) {
    return Expanded(
      child: Container(
        width: double.infinity,
        alignment: Alignment.center,
        color: bgColor,
        child: Text(
          label,
          style: TextStyle(
            color: textColor,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildAccentPreview(String label, Color bgColor, Color textColor) {
    return Expanded(
      child: Container(
        width: double.infinity,
        alignment: Alignment.center,
        color: bgColor,
        child: Text(
          label,
          style: TextStyle(
            color: textColor,
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  ColorScheme _getThemeColorScheme(AppTheme theme) {
    // Get the actual ColorScheme from your AppThemes class
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
}
