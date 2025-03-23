import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/UI/global/unified_item_gird.dart';
import 'package:client_leger/UI/shop/widgets/empty-message.dart';
import 'package:client_leger/UI/shop/widgets/shop-confirmation-dialog.dart';
import 'package:client_leger/backend-communication-services/shop/shop-service.dart';
import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/utilities/enums.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:toastification/toastification.dart';

class ShopPage extends ConsumerStatefulWidget {
  const ShopPage({Key? key}) : super(key: key);

  @override
  ConsumerState<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends ConsumerState<ShopPage> {
  bool isLoading = true;
  bool isPurchasing = false;

  // Lists to convert ShopItems to the format expected by InventorySection
  List<String> _avatarUrls = [];
  List<String> _bannerUrls = [];
  List<AppTheme> _themeItems = [];

  // Maps to store price information by URL
  Map<String, int> _avatarPrices = {};
  Map<String, int> _bannerPrices = {};
  Map<AppTheme, int> _themePrices = {};

  @override
  void initState() {
    super.initState();
    _refreshShop();
  }

  Future<void> _refreshShop() async {
    setState(() {
      isLoading = true;
    });

    try {
      final shopService = ref.read(shopServiceProvider);
      await shopService.refreshShop();

      _convertShopItems(shopService);
    } catch (e) {
      AppLogger.e('Error refreshing shop: $e');

      if (mounted) {
        showToast(
          context,
          "Erreur lors du chargement de la boutique",
          type: ToastificationType.error,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  void _convertShopItems(ShopService shopService) {
    // Clear previous data
    _avatarUrls = [];
    _bannerUrls = [];
    _themeItems = [];
    _avatarPrices = {};
    _bannerPrices = {};
    _themePrices = {};

    // Log total counts to debug
    AppLogger.d('Converting shop items...');
    AppLogger.d('Avatar items count: ${shopService.avatars.length}');
    AppLogger.d('Banner items count: ${shopService.banners.length}');
    AppLogger.d('Theme items count: ${shopService.themes.length}');

    // Use debug method to print raw shop contents
    shopService.debugShopContents();

    // Process avatars
    for (var item in shopService.avatars) {
      _avatarUrls.add(item.link);
      _avatarPrices[item.link] = item.price;
    }

    // Process banners
    for (var item in shopService.banners) {
      _bannerUrls.add(item.link);
      _bannerPrices[item.link] = item.price;
    }

    // Process themes
    for (var item in shopService.themes) {
      final theme = getAppThemeFromString(item.name);
      _themeItems.add(theme);
      _themePrices[theme] = item.price;
    }

    // Log the converted data for debugging
    AppLogger.d('After conversion:');
    AppLogger.d('Avatar URLs count: ${_avatarUrls.length}');
    AppLogger.d('Banner URLs count: ${_bannerUrls.length}');
    AppLogger.d('Theme items count: ${_themeItems.length}');
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

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
        child: Column(
          children: [
            // Shop header
            const AnimatedTitleWidget(title: 'Boutique'),

            // Shop content
            Expanded(
              child: isLoading
                  ? Center(
                      child: CircularProgressIndicator(
                        color: colorScheme.onPrimary,
                      ),
                    )
                  : SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 16),

                          // Avatars section
                          UnifiedItemGrid.horizontal(
                            items: _avatarUrls,
                            itemType: ItemType.avatar,
                            onItemSelected: _handleAvatarSelection,
                            sectionTitle: 'Avatars',
                            priceMap: _avatarPrices,
                            itemSize: 90,
                            emptyWidget: EmptyMessage(
                              message:
                                  'Aucun avatar disponible dans la boutique pour le moment.',
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Banners section
                          UnifiedItemGrid.horizontal(
                            items: _bannerUrls,
                            itemType: ItemType.banner,
                            onItemSelected: _handleBannerSelection,
                            sectionTitle: 'Bannières d\'avatar',
                            priceMap: _bannerPrices,
                            itemSize: 90,
                            emptyWidget: EmptyMessage(
                              message:
                                  'Aucune bannière disponible dans la boutique pour le moment.',
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Themes section
                          UnifiedItemGrid.horizontal(
                            items: _themeItems,
                            itemType: ItemType.theme,
                            onItemSelected: _handleThemeSelection,
                            sectionTitle: 'Thèmes de couleur',
                            priceMap: _themePrices,
                            itemSize: 90,
                            emptyWidget: EmptyMessage(
                              message:
                                  'Aucun thème disponible dans la boutique pour le moment.',
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleAvatarSelection(String link) async {
    if (isPurchasing) return;

    // Get price for this avatar
    int price = _avatarPrices[link] ?? 0;

    // Log the selection for debugging
    AppLogger.d('Avatar selected: $link, Price: $price');

    // Show confirmation dialog
    bool confirmed = await showShopConfirmationDialog(
      context: context,
      type: 'avatar',
      itemUrl: link,
      price: price,
    );

    if (!confirmed) return;

    await _purchaseItem(ItemType.avatar, link);
  }

  Future<void> _handleBannerSelection(String link) async {
    if (isPurchasing) return;

    // Get price for this banner
    int price = _bannerPrices[link] ?? 0;

    // Log the selection for debugging
    AppLogger.d('Banner selected: $link, Price: $price');

    // Show confirmation dialog
    bool confirmed = await showShopConfirmationDialog(
      context: context,
      type: 'banner',
      itemUrl: link,
      price: price,
    );

    if (!confirmed) return;

    await _purchaseItem(ItemType.banner, link);
  }

  Future<void> _handleThemeSelection(AppTheme theme) async {
    if (isPurchasing) return;

    // Get price for this theme
    int price = _themePrices[theme] ?? 0;

    // Show confirmation dialog
    bool confirmed = await showShopConfirmationDialog(
      context: context,
      type: 'theme',
      itemUrl: appThemeToString(theme),
      price: price,
    );

    if (!confirmed) return;

    await _purchaseItem(ItemType.theme, appThemeToString(theme));
  }

  Future<void> _purchaseItem(ItemType type, String itemUrl) async {
    setState(() {
      isPurchasing = true;
    });

    try {
      final shopService = ref.read(shopServiceProvider);
      final result = await shopService.buyItem(type, itemUrl);

      if (result == true) {
        _showSuccessMessage();
      } else if (result == false) {
        _showAlreadyOwnedMessage();
      } else {
        _showNotEnoughCoinsMessage();
      }

      // Refresh the shop data
      await shopService.refreshShop();
      _convertShopItems(shopService); // Update our converted lists
    } catch (e) {
      _showErrorMessage(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          isPurchasing = false;
        });
      }
    }
  }

  void _showSuccessMessage() {
    showToast(
      context,
      'Merci pour votre achat, vous le retrouverez dans votre inventaire.',
      type: ToastificationType.success,
    );
  }

  void _showAlreadyOwnedMessage() {
    showToast(
      context,
      "Vous possédez déjà l'item obtenu. Vous serez remboursé sur l'item.",
      type: ToastificationType.info,
      duration: const Duration(seconds: 4),
    );
  }

  void _showNotEnoughCoinsMessage() {
    showToast(
      context,
      "Vous n'avez pas assez d'argent pour vous procurer l'item :(.",
      type: ToastificationType.error,
      duration: const Duration(seconds: 4),
    );
  }

  void _showErrorMessage(String message) {
    showToast(
      context,
      message,
      type: ToastificationType.error,
      duration: const Duration(seconds: 4),
    );
  }
}
