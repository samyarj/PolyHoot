import 'package:client_leger/UI/inventory/widgets/inventory_section.dart';
import 'package:client_leger/UI/inventory/widgets/preview_section.dart';
import 'package:client_leger/backend-communication-services/inventory/inventory_service.dart';
import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class InventoryPage extends ConsumerStatefulWidget {
  const InventoryPage({Key? key}) : super(key: key);

  @override
  ConsumerState<InventoryPage> createState() => _InventoryPageState();
}

class _InventoryPageState extends ConsumerState<InventoryPage> {
  AppTheme? currentTheme;
  String? currentAvatar;
  String? currentBanner;
  bool isChangingTheme = false;
  bool isChangingAvatar = false;
  bool isChangingBanner = false;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _refreshInventory();
  }

  Future<void> _refreshInventory() async {
    setState(() {
      isLoading = true;
    });

    try {
      // Get the inventory service from the provider
      final inventoryService = ref.read(inventoryServiceProvider);
      await inventoryService.refreshInventory();

      // Log inventory contents
      AppLogger.d('Available avatars: ${inventoryService.avatars.length}');
      AppLogger.d('Available banners: ${inventoryService.banners.length}');
      AppLogger.d('Available themes: ${inventoryService.themes.length}');
    } catch (e) {
      AppLogger.e('Error refreshing inventory: $e');
      // Show error message if needed
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final inventoryService = ref.watch(inventoryServiceProvider);

    bool canEquip = !(currentTheme == null &&
        currentAvatar == null &&
        currentBanner == null);
    bool waitingForServerEquip =
        isChangingAvatar || isChangingBanner || isChangingTheme;

    // Debug the inventory contents
    AppLogger.d(
        'RENDER - Avatars: ${inventoryService.avatars.length}, Banners: ${inventoryService.banners.length}');

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [colorScheme.primary, colorScheme.secondary],
          ),
        ),
        child: isLoading
            ? Center(
                child: CircularProgressIndicator(
                  color: colorScheme.onPrimary,
                ),
              )
            : Row(
                children: [
                  // Left section - Inventory items (60% of space)
                  Expanded(
                    flex: 6,
                    child: InventorySection(
                      avatars: inventoryService.avatars,
                      banners: inventoryService.banners,
                      themes: inventoryService.themes,
                      onAvatarSelected: _selectAvatar,
                      onBannerSelected: _selectBanner,
                      onThemeSelected: _selectTheme,
                    ),
                  ),

                  // Divider
                  Container(
                    width: 1,
                    margin: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          colorScheme.tertiary,
                          colorScheme.tertiary,
                          Colors.transparent,
                        ],
                        stops: const [0.0, 0.1, 0.9, 1.0],
                      ),
                    ),
                  ),

                  // Right section - Preview and equip button (40% of space)
                  Expanded(
                    flex: 4,
                    child: PreviewSection(
                      currentTheme: currentTheme,
                      currentAvatar: currentAvatar,
                      currentBanner: currentBanner,
                      equippedAvatar: inventoryService.equippedAvatar,
                      equippedBanner: inventoryService.equippedBanner,
                      canEquip: canEquip,
                      waitingForServerEquip: waitingForServerEquip,
                      onEquip: _equip,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  void _selectAvatar(String avatarUrl) {
    final inventoryService = ref.read(inventoryServiceProvider);

    setState(() {
      currentTheme = null;
      currentAvatar = avatarUrl;

      if (currentBanner == null && inventoryService.equippedBanner != null) {
        currentBanner = inventoryService.equippedBanner;
      }
    });
  }

  void _selectBanner(String bannerUrl) {
    final inventoryService = ref.read(inventoryServiceProvider);

    setState(() {
      currentTheme = null;
      currentBanner = bannerUrl;

      if (currentAvatar == null && inventoryService.equippedAvatar != null) {
        currentAvatar = inventoryService.equippedAvatar;
      }
    });
  }

  void _selectTheme(AppTheme theme) {
    setState(() {
      currentAvatar = null;
      currentBanner = null;
      currentTheme = theme;
    });
  }

  void _equip() {
    if (!(currentTheme == null &&
        currentAvatar == null &&
        currentBanner == null)) {
      if (currentTheme != null) {
        _setTheme(currentTheme!);
      } else {
        if (currentAvatar != null) {
          _setAvatar(currentAvatar!);
        }
        if (currentBanner != null) {
          _setBanner(currentBanner!);
        }
      }
    }

    _resetSelection();
  }

  void _setAvatar(String avatarUrl) {
    if (!isChangingAvatar) {
      setState(() {
        isChangingAvatar = true;
      });

      final inventoryService = ref.read(inventoryServiceProvider);
      inventoryService.setAvatar(avatarUrl).then((isAvatarEquipped) {
        if (!isAvatarEquipped) {
          _showErrorDialog(
              "Vous ne possédez pas l'avatar que vous voulez équiper.");
        }

        setState(() {
          isChangingAvatar = false;
        });
      }).catchError((error) {
        _showErrorDialog(error.toString());
        setState(() {
          isChangingAvatar = false;
        });
      });
    }
  }

  void _setBanner(String bannerUrl) {
    if (!isChangingBanner) {
      setState(() {
        isChangingBanner = true;
      });

      final inventoryService = ref.read(inventoryServiceProvider);
      inventoryService.setBanner(bannerUrl).then((isBannerEquipped) {
        if (!isBannerEquipped) {
          _showErrorDialog(
              "Vous ne possédez pas la bordure d'avatar que vous voulez équiper.");
        }

        setState(() {
          isChangingBanner = false;
        });
      }).catchError((error) {
        _showErrorDialog(error.toString());
        setState(() {
          isChangingBanner = false;
        });
      });
    }
  }

  void _setTheme(AppTheme theme) {
    if (!isChangingTheme) {
      setState(() {
        isChangingTheme = true;
      });

      final inventoryService = ref.read(inventoryServiceProvider);
      inventoryService.setTheme(theme).then((isThemeEquipped) {
        if (!isThemeEquipped) {
          _showErrorDialog(
              "Vous ne possédez pas le thème de couleur que vous voulez équiper.");
        }

        setState(() {
          isChangingTheme = false;
        });
      }).catchError((error) {
        _showErrorDialog(error.toString());
        setState(() {
          isChangingTheme = false;
        });
      });
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Erreur'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _resetSelection() {
    setState(() {
      currentTheme = null;
      currentAvatar = null;
      currentBanner = null;
    });
  }
}
