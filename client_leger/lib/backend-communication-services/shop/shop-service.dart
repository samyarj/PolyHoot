import 'dart:convert';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/environment_config.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/models/shop/shop-item-model.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

// Create a provider for the shop service
final shopServiceProvider = Provider<ShopService>((ref) {
  final service = ShopService(ref);
  ref.onDispose(() {
    service.dispose();
  });
  return service;
});

class ShopService {
  final Ref _ref;

  // Initialize with empty lists
  List<ShopItem> _avatars = [];
  List<ShopItem> _banners = [];
  List<ShopItem> _themes = [];
  int _userCoins = 0;

  // Create a singleton instance with proper ref injection
  static final Map<Ref, ShopService> _instances = {};

  factory ShopService(Ref ref) {
    if (_instances.containsKey(ref)) {
      return _instances[ref]!;
    } else {
      final instance = ShopService._internal(ref);
      _instances[ref] = instance;
      return instance;
    }
  }

  ShopService._internal(this._ref) {
    // Initialize by listening to user changes
    isLoggedIn.addListener(_updateShopData);
    _initializeShop();
  }

  final String baseUrl = '${EnvironmentConfig.serverUrl}/shop';

  // Getters for the shop items
  List<ShopItem> get avatars => _avatars;
  List<ShopItem> get banners => _banners;
  List<ShopItem> get themes => _themes;
  int get userCoins => _userCoins;

  // Debug method to print shop contents
  void debugShopContents() {
    AppLogger.d('SHOP CONTENTS:');
    AppLogger.d(
        'Avatars (${_avatars.length}): ${_avatars.map((a) => a.link).join(', ')}');
    AppLogger.d(
        'Banners (${_banners.length}): ${_banners.map((b) => b.link).join(', ')}');
    AppLogger.d(
        'Themes (${_themes.length}): ${_themes.map((t) => t.name).join(', ')}');
  }

  // Initialize shop from current user state
  void _initializeShop() {
    final userAsync = _ref.read(userProvider);

    userAsync.whenData((user) {
      if (user != null) {
        // Initial load of shop data when user is available
        _fetchShopData();
      }
    });
  }

  void _updateShopData() {
    if (isLoggedIn.value) {
      _fetchShopData();

      // Update user coins from the provider
      final userAsync = _ref.read(userProvider);
      userAsync.whenData((user) {
        if (user != null) {
          _userCoins = user.coins ?? 0;
        }
      });
    } else {
      // Clear data when user logs out
      _avatars = [];
      _banners = [];
      _themes = [];
      _userCoins = 0;
    }
  }

  Future<void> _fetchShopData() async {
    try {
      final result = await fetchShop();
      if (result != null) {
        _avatars = result['avatars'] ?? [];
        _banners = result['banners'] ?? [];
        _themes = result['themes'] ?? [];
      }
    } catch (e) {
      AppLogger.e('Error fetching shop data: ${e.toString()}');
    }
  }

  Future<void> refreshShop() async {
    try {
      await _fetchShopData();

      final userAsync = _ref.read(userProvider);
      userAsync.whenData((user) {
        if (user != null) {
          _userCoins = user.coins ?? 0;
        }
      });
    } catch (e) {
      AppLogger.e('Error refreshing shop: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }

  Future<Map<String, dynamic>?> fetchShop() async {
    try {
      final currentUser = firebase_auth.FirebaseAuth.instance.currentUser;
      if (currentUser == null) {
        throw Exception('User not authenticated');
      }

      final token = await currentUser.getIdToken();

      final response = await http.get(
        Uri.parse('$baseUrl/shop'),
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Parse avatars
        final List<ShopItem> avatars = data['avatars'] != null
            ? (data['avatars'] as List)
                .map((item) => ShopItem.fromJson(item, 'avatar'))
                .toList()
            : [];

        // Parse banners
        final List<ShopItem> banners = data['banners'] != null
            ? (data['banners'] as List)
                .map((item) => ShopItem.fromJson(item, 'banner'))
                .toList()
            : [];

        // Parse themes
        final List<ShopItem> themes = data['themes'] != null
            ? (data['themes'] as List)
                .map((item) => ShopItem.fromJson(item, 'theme'))
                .toList()
            : [];

        return {
          'avatars': avatars,
          'banners': banners,
          'themes': themes,
        };
      } else {
        AppLogger.e(
            'Failed to fetch shop: ${response.statusCode} ${response.body}');
        return null;
      }
    } catch (e) {
      AppLogger.e('Error in fetchShop: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }

  Future<bool?> buyItem(ItemType type, String itemLink) async {
    try {
      final currentUser = firebase_auth.FirebaseAuth.instance.currentUser;
      if (currentUser == null) {
        throw Exception('User not authenticated');
      }

      final token = await currentUser.getIdToken();

      String itemType;
      switch (type) {
        case ItemType.avatar:
          itemType = 'avatar';
          break;
        case ItemType.banner:
          itemType = 'banner';
          break;
        case ItemType.theme:
          itemType = 'theme';
          break;
        default:
          throw ArgumentError('Invalid item type');
      }

      AppLogger.d('Sending buy request - Type: $itemType, Link: $itemLink');

      final response = await http.post(
        Uri.parse('$baseUrl/shop'),
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer $token',
        },
        body: json.encode({
          'type': itemType,
          'itemURL': itemLink,
        }),
      );

      if (response.statusCode == 200) {
        AppLogger.d('Purchase successful: ${response.body}');

        _fetchShopData();

        final userAsync = _ref.read(userProvider);
        userAsync.whenData((user) {
          if (user != null) {
            _userCoins = user.coins ?? 0;
          }
        });

        final data = json.decode(response.body);
        return data as bool?;
      } else {
        AppLogger.e(
            'Failed to buy item: ${response.statusCode} ${response.body}');
        return null;
      }
    } catch (e) {
      AppLogger.e('Error in buyItem: ${e.toString()}');
      throw Exception(getCustomError(e));
    }
  }

  void dispose() {
    isLoggedIn.removeListener(_updateShopData);
  }
}
