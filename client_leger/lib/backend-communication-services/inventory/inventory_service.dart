import 'dart:convert';

import 'package:client_leger/backend-communication-services/environment.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

// Define a state class to hold inventory data
class InventoryState {
  final List<String> avatars;
  final List<String> banners;
  final List<AppTheme> themes;
  final String? equippedAvatar;
  final String? equippedBanner;

  InventoryState({
    required this.avatars,
    required this.banners,
    required this.themes,
    this.equippedAvatar,
    this.equippedBanner,
  });

  // Copy with method for easy state updates
  InventoryState copyWith({
    List<String>? avatars,
    List<String>? banners,
    List<AppTheme>? themes,
    String? equippedAvatar,
    String? equippedBanner,
    bool clearEquippedAvatar = false,
    bool clearEquippedBanner = false,
  }) {
    return InventoryState(
      avatars: avatars ?? this.avatars,
      banners: banners ?? this.banners,
      themes: themes ?? this.themes,
      equippedAvatar:
          clearEquippedAvatar ? null : (equippedAvatar ?? this.equippedAvatar),
      equippedBanner:
          clearEquippedBanner ? null : (equippedBanner ?? this.equippedBanner),
    );
  }
}

// Create a StateNotifierProvider for the inventory service
final inventoryServiceProvider =
    StateNotifierProvider<InventoryServiceNotifier, InventoryState>((ref) {
  return InventoryServiceNotifier(ref);
});

class InventoryServiceNotifier extends StateNotifier<InventoryState> {
  final Ref _ref;
  final String baseUrl = '${Environment.serverUrl}/inventory';

  // Initialize with default state
  InventoryServiceNotifier(this._ref)
      : super(InventoryState(
          avatars: [],
          banners: [],
          themes: [AppTheme.dark, AppTheme.light],
          equippedAvatar: null,
          equippedBanner: null,
        )) {
    _loadhInventory();
    _ref.listen(userProvider, (previous, next) {
      if (previous != null && next != null) {
        next.whenData((user) {
          if (user != null) {
            AppLogger.d('User data changed, updating inventory');
            _updateFromUser(user);
          } else {
            _clearInventory();
          }
        });
      }
    });
  }

  Future<void> _loadhInventory() async {
    try {
      final userAsync = _ref.read(userProvider);

      userAsync.whenData((user) {
        if (user != null) {
          _updateFromUser(user);
        } else {
          _clearInventory();
        }
      });

      AppLogger.d('Inventory refreshed from user provider');
    } catch (e) {
      AppLogger.e('Error refreshing inventory: ${e.toString()}');
    }
  }

  void _clearInventory() {
    state = InventoryState(
      avatars: [],
      banners: [],
      themes: [AppTheme.dark, AppTheme.light],
      equippedAvatar: null,
      equippedBanner: null,
    );
  }

  void _updateFromUser(User user) {
    AppLogger.w('Updating inventory from user data');

    // Start with default themes
    List<AppTheme> themes = [AppTheme.dark, AppTheme.light];
    List<String> avatars = [];
    List<String> banners = [];

    // Extract data from user inventory
    if (user.inventory != null) {
      try {
        // Extract avatars
        if (user.inventory!.containsKey('avatars')) {
          final avatarsData = user.inventory!['avatars'];

          if (avatarsData is List) {
            avatars = avatarsData.map((a) => a.toString()).toList();
            AppLogger.d('Found ${avatars.length} avatars');
          }
        }

        // Extract banners
        if (user.inventory!.containsKey('banners')) {
          final bannersData = user.inventory!['banners'];

          if (bannersData is List) {
            banners = bannersData.map((b) => b.toString()).toList();
            AppLogger.d('Found ${banners.length} banners');
          }
        }

        // Extract themes
        if (user.inventory!.containsKey('themes')) {
          final themesData = user.inventory!['themes'];

          if (themesData is List && themesData.isNotEmpty) {
            // Convert theme strings to AppTheme enums
            for (var themeStr in themesData) {
              try {
                final theme = stringToAppTheme(themeStr.toString());
                // Only add if it's not already in the list (to avoid duplicates)
                if (!themes.contains(theme)) {
                  themes.add(theme);
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

    // Update state with new inventory data
    state = InventoryState(
      avatars: avatars,
      banners: banners,
      themes: themes,
      equippedAvatar: user.avatarEquipped,
      equippedBanner: user.borderEquipped,
    );

    AppLogger.d(
        'Final inventory state: ${avatars.length} avatars, ${banners.length} banners, ${themes.length} themes');
  }

  // Helper method to convert AppTheme enum to string
  String appThemeToString(AppTheme theme) {
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
        // Update state with new equipped avatar
        state = state.copyWith(equippedAvatar: avatarUrl);
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
        // Update state with new equipped banner
        state = state.copyWith(equippedBanner: bannerUrl);
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
      final themeString = appThemeToString(theme);

      final response = await http.post(
        Uri.parse('$baseUrl/theme'),
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer $token'
        },
        body: jsonEncode({'theme': themeString}),
      );

      if (response.statusCode == 200) {
        // No need to update state for theme as it's managed by the theme provider
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
}
