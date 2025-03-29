import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/themes/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:toastification/toastification.dart';

void showToast(
  BuildContext context,
  String title, {
  ToastificationType type = ToastificationType.info,
  Duration duration = const Duration(seconds: 3),
  String? description,
}) {
  toastification.show(
    context: context,
    title: Text(
      title,
      style: TextStyle(fontSize: 14),
    ),
    description: description == null
        ? null
        : Text(description, style: TextStyle(fontSize: 14)),
    // pour les longs textes on met dans description car le titre est limité
    type: type,
    autoCloseDuration: duration,
    alignment: Alignment.topCenter,
    style: ToastificationStyle.flatColored,
    showIcon: true,
  );
}

// Helper methods for themes
AppTheme getAppThemeFromString(String themeName) {
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

String appThemeToString(AppTheme theme) {
  return theme.name.toLowerCase();
}

// Helper method to convert string to AppTheme enum
AppTheme stringToAppTheme(String themeString) {
  switch (themeString.toLowerCase()) {
    case 'light':
      return AppTheme.light;
    case 'dark':
      return AppTheme.dark;
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

ColorScheme getThemeColorScheme(AppTheme theme) {
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

String formatDate(String? dateString) {
  if (dateString == null) return "Non spécifiée";

  try {
    // Parse the date
    DateTime dateTime = DateTime.parse(dateString);

    // Format date and time with "à" in French
    return "${dateTime.year}-${_twoDigits(dateTime.month)}-${_twoDigits(dateTime.day)} à ${_twoDigits(dateTime.hour)}:${_twoDigits(dateTime.minute)}";
  } catch (e) {
    return dateString; // Fallback to original string if parsing fails
  }
}

// Helper method to ensure two-digit formatting
String _twoDigits(int n) {
  return n.toString().padLeft(2, '0');
}
