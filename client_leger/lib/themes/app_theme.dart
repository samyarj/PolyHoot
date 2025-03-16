import 'package:flutter/material.dart';

class AppThemes {
  // Dark theme - updated to match CSS [data-theme='dark']
  static final ThemeData darkTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF000729),
      primary: const Color(0xFF000729),
      primaryContainer: const Color(0xFF1E1E2E), // Using nav-bg
      secondary: const Color(0xFF71CDFF),
      tertiary: Colors.white,
      surface: const Color(0xFF1E1E2E),
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: const Color(0xFFF0F8FF), // aliceblue
    ),
    useMaterial3: true,
  );

  // Light theme - updated to match CSS [data-theme='light']
  static final ThemeData lightTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.white,
      primary: Colors.white,
      primaryContainer: const Color(0xFFF5F5F5), // Slightly darker than white
      secondary: const Color(0xFF71CDFF),
      tertiary: const Color(0xFF000729),
      surface: Colors.white,
      onPrimary: const Color(0xFF101010),
      onSecondary: const Color(0xFF101010),
      onSurface: const Color(0xFF101010),
    ),
    useMaterial3: true,
  );

  // Renamed customTheme to sunsetTheme to match CSS
  static final ThemeData sunsetTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF3B0066),
      primary: const Color(0xFF3B0066),
      primaryContainer: const Color(0xFF330033), // Using nav-bg
      secondary: const Color(0xFFFF4FA1),
      tertiary: const Color(0xFFFFBB33),
      surface: const Color(0xFF330033),
      onPrimary: const Color(0xFFFCE4FF),
      onSecondary: const Color(0xFFFCE4FF),
      onSurface: const Color(0xFFFCE4FF),
    ),
    useMaterial3: true,
  );

  // Added neon theme
  static final ThemeData neonTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF0D0D0D),
      primary: const Color(0xFF0D0D0D),
      primaryContainer: const Color(0xFF1A1A1A), // Using nav-bg
      secondary: const Color(0xFFFF00FF),
      tertiary: const Color(0xFF00FFFF),
      surface: const Color(0xFF1A1A1A),
      onPrimary: const Color(0xFFF0F0F0),
      onSecondary: const Color(0xFFF0F0F0),
      onSurface: const Color(0xFFF0F0F0),
    ),
    useMaterial3: true,
  );

  // Added lava theme
  static final ThemeData lavaTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF4A0000),
      primary: const Color(0xFF4A0000),
      primaryContainer: const Color(0xFF330000), // Using nav-bg
      secondary: const Color(0xFFB30000),
      tertiary: const Color(0xFFFF4500),
      surface: const Color(0xFF330000),
      onPrimary: const Color(0xFFFFDDC1),
      onSecondary: const Color(0xFFFFDDC1),
      onSurface: const Color(0xFFFFDDC1),
    ),
    useMaterial3: true,
  );

  // Added inferno theme
  static final ThemeData infernoTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF1A0000),
      primary: const Color(0xFF1A0000),
      primaryContainer: const Color(0xFF300000), // Using nav-bg
      secondary: const Color(0xFFFF0000),
      tertiary: const Color(0xFFFF6A00),
      surface: const Color(0xFF300000),
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Colors.white,
    ),
    useMaterial3: true,
  );

  // Added emerald theme
  static final ThemeData emeraldTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF003D00),
      primary: const Color(0xFF003D00),
      primaryContainer: const Color(0xFF002600), // Using nav-bg
      secondary: const Color(0xFF007A33),
      tertiary: const Color(0xFF00CC66),
      surface: const Color(0xFF002600),
      onPrimary: const Color(0xFFE0FFE0),
      onSecondary: const Color(0xFFE0FFE0),
      onSurface: const Color(0xFFE0FFE0),
    ),
    useMaterial3: true,
  );

  // Added toxic theme
  static final ThemeData toxicTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF001A00),
      primary: const Color(0xFF001A00),
      primaryContainer: const Color(0xFF003300), // Using nav-bg
      secondary: const Color(0xFF00FF00),
      tertiary: const Color(0xFF33FF33),
      surface: const Color(0xFF003300),
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Colors.white,
    ),
    useMaterial3: true,
  );

  // Added vice theme
  static final ThemeData viceTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF2D1F7F),
      primary: const Color(0xFF2D1F7F),
      primaryContainer: const Color(0xFF1A0D4A), // Using nav-bg
      secondary: const Color(0xFFFF009E),
      tertiary: const Color(0xFF00C6FF),
      surface: const Color(0xFF1A0D4A),
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Colors.white,
    ),
    useMaterial3: true,
  );

  // Added gold theme
  static final ThemeData goldTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF3D2B00),
      primary: const Color(0xFF3D2B00),
      primaryContainer: const Color(0xFF2A1C00), // Using nav-bg
      secondary: const Color(0xFFB8860B),
      tertiary: const Color(0xFFFFD700),
      surface: const Color(0xFF2A1C00),
      onPrimary: const Color(0xFFFFF8DC),
      onSecondary: const Color(0xFFFFF8DC),
      onSurface: const Color(0xFFFFF8DC),
    ),
    useMaterial3: true,
  );

  // Added celestial theme
  static final ThemeData celestialTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF1A0033),
      primary: const Color(0xFF1A0033),
      primaryContainer: const Color(0xFF0D0011), // Using nav-bg
      secondary: const Color(0xFFFFCC00),
      tertiary: const Color(0xFF00B5E2),
      surface: const Color(0xFF0D0011),
      onPrimary: const Color(0xFFE5E5E5),
      onSecondary: const Color(0xFFE5E5E5),
      onSurface: const Color(0xFFE5E5E5),
    ),
    useMaterial3: true,
  );
}
