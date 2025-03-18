import 'package:client_leger/themes/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AppTheme {
  dark,
  light,
  sunset,
  neon,
  lava,
  inferno,
  emerald,
  toxic,
  vice,
  gold,
  celestial
}

class ThemeNotifier extends Notifier<ThemeData> {
  @override
  ThemeData build() {
    return AppThemes.sunsetTheme;
  }

  void setTheme(AppTheme theme) {
    state = _getThemeData(theme);
  }

  ThemeData _getThemeData(AppTheme theme) {
    switch (theme) {
      case AppTheme.light:
        return AppThemes.lightTheme;
      case AppTheme.dark:
        return AppThemes.darkTheme;
      case AppTheme.sunset:
        return AppThemes.sunsetTheme;
      case AppTheme.neon:
        return AppThemes.neonTheme;
      case AppTheme.lava:
        return AppThemes.lavaTheme;
      case AppTheme.inferno:
        return AppThemes.infernoTheme;
      case AppTheme.emerald:
        return AppThemes.emeraldTheme;
      case AppTheme.toxic:
        return AppThemes.toxicTheme;
      case AppTheme.vice:
        return AppThemes.viceTheme;
      case AppTheme.gold:
        return AppThemes.goldTheme;
      case AppTheme.celestial:
        return AppThemes.celestialTheme;
    }
  }
}

final themeProvider = NotifierProvider<ThemeNotifier, ThemeData>(() {
  return ThemeNotifier();
});
