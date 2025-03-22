import 'dart:convert';

import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

// Create a provider for the inventory service
final inventoryServiceProvider = Provider<InventoryService>((ref) {
  final service = InventoryService(ref);
  ref.onDispose(() {
    service.dispose();
  });
  return service;
});

class InventoryService {
  final Ref _ref;

  // Initialize with empty lists
  List<String> _avatars = [];
  List<String> _banners = [];

  // Default themes that are always available
  List<AppTheme> _themes = [
    AppTheme.dark,
    AppTheme.light,
  ];

  // Additional themes that may be added from user inventory
  final List<AppTheme> _additionalThemes = [
    AppTheme.gold,
    AppTheme.emerald,
    AppTheme.lava,
    AppTheme.inferno,
    AppTheme.toxic,
    AppTheme.vice,
    AppTheme.celestial,
    AppTheme.neon,
    AppTheme.sunset,
  ];

  String? _equippedAvatar;
  String? _equippedBanner;

  // Create a singleton instance with proper ref injection
  static final Map<Ref, InventoryService> _instances = {};

  factory InventoryService(Ref ref) {
    if (_instances.containsKey(ref)) {
      return _instances[ref]!;
    } else {
      final instance = InventoryService._internal(ref);
      _instances[ref] = instance;
      return instance;
    }
  }

  InventoryService._internal(this._ref) {
    // Initialize by listening to user changes
    isLoggedIn.addListener(_updateUserData);
    _initializeInventory();
  }

  final String baseUrl = '${Environment.serverUrl}/inventory';

  // Getters for the inventory items
  List<String> get avatars => _avatars;
  List<String> get banners => _banners;
  List<AppTheme> get themes => _themes;
  String? get equippedAvatar => _equippedAvatar;
  String? get equippedBanner => _equippedBanner;

  // Initialize inventory from current user state
  void _initializeInventory() {
    final userAsync = _ref.read(userProvider);

    userAsync.whenData((user) {
      if (user != null) {
        _updateFromUser(user);
      }
    });

    // Set up listener to update inventory when user data changes
    _ref.listen(userProvider, (previous, next) {
      next.whenData((user) {
        if (user != null) {
          _updateFromUser(user);
        } else {
          // Clear data when user is null
          _avatars = [];
          _banners = [];
          _equippedAvatar = null;
          _equippedBanner = null;

          // Reset themes to only include default ones
          _themes = [AppTheme.dark, AppTheme.light];
        }
      });
    });
  }

  void _updateUserData() {
    if (isLoggedIn.value) {
      // User data should already be updated by the auth system
      final userAsync = _ref.read(userProvider);
      userAsync.whenData((user) {
        if (user != null) {
          _updateFromUser(user);
        }
      });
    } else {
      // Clear data when user logs out
      _avatars = [];
      _banners = [];
      _equippedAvatar = null;
      _equippedBanner = null;

      // Reset themes to only include default ones
      _themes = [AppTheme.dark, AppTheme.light];
    }
  }

  void _updateFromUser(User user) {
    AppLogger.d('Updating inventory from user data');

    // Start with the default themes
    _themes = [AppTheme.dark, AppTheme.light];

    // Extract data from user inventory
    if (user.inventory != null) {
      AppLogger.d('Processing user inventory');

      try {
        // Extract avatars
        if (user.inventory!.containsKey('avatars')) {
          final avatarsData = user.inventory!['avatars'];

          if (avatarsData is List) {
            _avatars = avatarsData.map((a) => a.toString()).toList();
            AppLogger.d('Found ${_avatars.length} avatars');
          }
        }

        // Extract banners
        if (user.inventory!.containsKey('banners')) {
          final bannersData = user.inventory!['banners'];

          if (bannersData is List) {
            _banners = bannersData.map((b) => b.toString()).toList();
            AppLogger.d('Found ${_banners.length} banners');
          }
        }

        // Extract themes
        if (user.inventory!.containsKey('themes')) {
          final themesData = user.inventory!['themes'];

          if (themesData is List && themesData.isNotEmpty) {
            // Convert theme strings to AppTheme enums
            for (var themeStr in themesData) {
              try {
                final theme = _stringToAppTheme(themeStr.toString());
                // Only add if it's not already in the list (to avoid duplicates)
                if (!_themes.contains(theme)) {
                  _themes.add(theme);
                }
              } catch (e) {
                AppLogger.w('Unknown theme: $themeStr');
              }
            }
          }
        }
      } catch (e) {
        AppLogger.e('Error extracting inventory: $e');
      }
    } else {
      AppLogger.w('User has no inventory, using defaults');
    }

    _equippedAvatar = user.avatarEquipped;
    _equippedBanner = user.borderEquipped;

    AppLogger.d(
        'Final inventory state: ${_avatars.length} avatars, ${_banners.length} banners, ${_themes.length} themes');
  }

  // Helper method to convert string to AppTheme enum
  AppTheme _stringToAppTheme(String themeString) {
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

  // Helper method to convert AppTheme enum to string
  String _appThemeToString(AppTheme theme) {
    return theme.name.toLowerCase();
  }

  Future<bool> setAvatar(String avatarUrl) async {
    try {
      final currentUser = firebase_auth.FirebaseAuth.instance.currentUser;
      if (currentUser == null) {
        throw Exception('User not authenticated');
      }

      final token = await currentUser.getIdToken();

      final response = await http.post(
        Uri.parse('$baseUrl/avatar'),
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer $token'
        },
        body: jsonEncode({'avatarURL': avatarUrl}),
      );

      if (response.statusCode == 200) {
        _equippedAvatar = avatarUrl;
        return true;
      } else {
        AppLogger.w('Failed to set avatar: ${response.body}');
        return false;
      }
    } catch (e) {
      AppLogger.e('Error setting avatar: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }

  Future<bool> setBanner(String bannerUrl) async {
    try {
      final currentUser = firebase_auth.FirebaseAuth.instance.currentUser;
      if (currentUser == null) {
        throw Exception('User not authenticated');
      }

      final token = await currentUser.getIdToken();

      final response = await http.post(
        Uri.parse('$baseUrl/banner'),
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer $token'
        },
        body: jsonEncode({'bannerURL': bannerUrl}),
      );

      if (response.statusCode == 200) {
        _equippedBanner = bannerUrl;
        return true;
      } else {
        AppLogger.w('Failed to set banner: ${response.body}');
        return false;
      }
    } catch (e) {
      AppLogger.e('Error setting banner: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }

  Future<bool> setTheme(AppTheme theme) async {
    try {
      final currentUser = firebase_auth.FirebaseAuth.instance.currentUser;
      if (currentUser == null) {
        throw Exception('User not authenticated');
      }

      final token = await currentUser.getIdToken();
      final themeString = _appThemeToString(theme);

      final response = await http.post(
        Uri.parse('$baseUrl/theme'),
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer $token'
        },
        body: jsonEncode({'theme': themeString}),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        AppLogger.w('Failed to set theme: ${response.body}');
        return false;
      }
    } catch (e) {
      AppLogger.e('Error setting theme: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }

  // Method to refresh inventory data from the current user state (no server call)
  Future<void> refreshInventory() async {
    try {
      // Read the current user state from the provider
      final userAsync = _ref.read(userProvider);

      // Update inventory from current user data
      userAsync.whenData((user) {
        if (user != null) {
          _updateFromUser(user);
        }
      });
    } catch (e) {
      AppLogger.e('Error refreshing inventory: ${e.toString()}');
    }
  }

  // Clean up when app is closed
  void dispose() {
    isLoggedIn.removeListener(_updateUserData);
  }
}
