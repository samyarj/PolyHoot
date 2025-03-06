import 'package:flutter/material.dart';

class AppThemes {
  static final ThemeData darkTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: Color(0xFF00115A),
      primary: Color(0xFF00115A),
      primaryContainer: Color(0xFF000A3D), // Deeper than primary
      secondary: Color(0xFF004080),
      surface: Color(0xFF002F6C),
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Colors.white,
    ),
    useMaterial3: true,
  );

  static final ThemeData lightTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: Color(0xFFFFFFFF),
      primary: Color(0xFF1976D2),
      primaryContainer: Color(0xFF0D47A1), // Deeper than primary
      secondary: Color(0xFF64B5F6),
      surface: Color(0xFFE3F2FD),
      onPrimary: Colors.black,
      onSecondary: Colors.black,
      onSurface: Colors.black,
    ),
    useMaterial3: true,
  );

  static final ThemeData customTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: Color.fromARGB(255, 73, 6, 94),
      primary: Color.fromARGB(255, 73, 6, 94),
      primaryContainer: Color.fromARGB(255, 49, 4, 63), // Deeper than primary
      secondary: Color(0xFFD81B60),
      surface: Color(0xFFAD1457),
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: Colors.white,
    ),
    useMaterial3: true,
  );
}
