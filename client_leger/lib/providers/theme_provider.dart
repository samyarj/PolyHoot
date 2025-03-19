import 'package:client_leger/providers/user_provider.dart';
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

// Create a provider that extracts the theme from the user
final userThemeProvider = Provider<AppTheme>((ref) {
  final userAsync = ref.watch(userProvider);

  return userAsync.when(
    data: (user) {
      if (user == null) return AppTheme.dark;

      final themeString = user.config?['themeEquipped'];
      if (themeString == null || themeString == 'default') {
        return AppTheme.dark;
      }

      // Convert string to enum value
      switch (themeString) {
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
    },
    loading: () => AppTheme.dark,
    error: (_, __) => AppTheme.dark,
  );
});

class ThemeNotifier extends Notifier<ThemeData> {
  @override
  ThemeData build() {
    // Watch the user theme provider
    final userTheme = ref.watch(userThemeProvider);
    return _getThemeData(userTheme);
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
