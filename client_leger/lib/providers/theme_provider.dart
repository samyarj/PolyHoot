import 'package:client_leger/themes/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AppTheme { dark, light }

class ThemeNotifier extends Notifier<ThemeData> {
  @override
  ThemeData build() {
    return AppThemes.darkTheme; // Default theme
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
      default:
        return AppThemes.darkTheme;
    }
  }
}

final themeProvider = NotifierProvider<ThemeNotifier, ThemeData>(() {
  return ThemeNotifier();
});
