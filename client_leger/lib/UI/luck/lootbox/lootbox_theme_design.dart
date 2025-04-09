import 'package:client_leger/themes/app_theme.dart';
import 'package:flutter/material.dart';

Container getContainer(String themeName) {
  switch (themeName) {
    case "sunset":
      return getThemeContainer(AppThemes.sunsetTheme, "SUNSET");
    case "vice":
      return getThemeContainer(AppThemes.viceTheme, "VICE");
    case "neon":
      return getThemeContainer(AppThemes.neonTheme, "NEON");
    case "celestial":
      return getThemeContainer(AppThemes.celestialTheme, "CELESTIAL");
    case "toxic":
      return getThemeContainer(AppThemes.toxicTheme, "TOXIC");
    default:
      throw Exception("Theme not found");
  }
}

Container getThemeContainer(ThemeData theme, String text) {
  return Container(
    width: 80,
    height: 80,
    decoration: BoxDecoration(
      gradient: LinearGradient(
        colors: [
          theme.colorScheme.primary, // Primary color
          theme.colorScheme.secondary, // Secondary color
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        stops: [0.55, 0.85], // Matches the 55% and 85% stops in the SCSS
      ),
      border: Border.all(
        color: theme.colorScheme.tertiary, // Tertiary color for the border
        width: 3,
      ),
      shape: BoxShape.circle, // Makes the container circular
    ),
    alignment: Alignment.center,
    child: Text(
      text,
      style: TextStyle(
        color: theme.colorScheme.onPrimary, // Text color
        fontWeight: FontWeight.bold,
        fontSize: 11,
      ),
    ),
  );
}
