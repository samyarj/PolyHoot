import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/UI/global/item_widget.dart';
import 'package:client_leger/UI/global/unified_item_gird.dart';
import 'package:client_leger/providers/theme_provider.dart';
import 'package:client_leger/utilities/enums.dart';
import 'package:flutter/material.dart';

// Special constant to identify the "remove banner" option
const String REMOVE_BANNER_ID = "remove_banner";

class InventorySection extends StatelessWidget {
  final List<String> avatars;
  final List<String> banners;
  final List<AppTheme> themes;
  final Function(String) onAvatarSelected;
  final Function(String) onBannerSelected;
  final Function(AppTheme) onThemeSelected;

  const InventorySection({
    Key? key,
    required this.avatars,
    required this.banners,
    required this.themes,
    required this.onAvatarSelected,
    required this.onBannerSelected,
    required this.onThemeSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final itemSize = 60.0;
    final screenWidth = MediaQuery.of(context).size.width;
    final itemsPerRow = (screenWidth > 1200)
        ? 6
        : (screenWidth > 800)
            ? 4
            : 3;
    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const AnimatedTitleWidget(title: 'Inventaire', fontSize: 58),
          Container(
            height: 1,
            margin: const EdgeInsets.only(bottom: 24.0),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [
                  Colors.transparent,
                  colorScheme.tertiary,
                  colorScheme.tertiary,
                  Colors.transparent,
                ],
                stops: const [0.0, 0.3, 0.7, 1.0],
              ),
            ),
          ),

          // Scrollable content
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatars section
                  _buildSectionTitle('Avatars', colorScheme),
                  const SizedBox(height: 8),
                  avatars.isEmpty
                      ? _buildEmptyMessage(
                          'Vous n\'avez pas d\'avatars obtenus, allez-en obtenir dans la boutique ou dans les lootbox!',
                          colorScheme,
                        )
                      : UnifiedItemGrid.grid(
                          items: avatars,
                          itemType: ItemType.avatar,
                          onItemSelected: onAvatarSelected,
                          crossAxisCount: itemsPerRow,
                          itemSize: itemSize,
                        ),
                  const SizedBox(height: 24),

                  _buildSectionTitle('Bannière d\'avatar', colorScheme),
                  const SizedBox(height: 8),
                  banners.isEmpty
                      ? _buildEmptyMessage(
                          'Vous n\'avez pas de bannières obtenues, allez-en obtenir dans la boutique ou dans les lootbox!',
                          colorScheme,
                        )
                      : _buildBannerGrid(context, itemsPerRow, itemSize),
                  const SizedBox(height: 24),

                  // Themes section
                  _buildSectionTitle('Thèmes de couleur', colorScheme),
                  const SizedBox(height: 8),
                  UnifiedItemGrid.grid(
                    items: themes,
                    itemType: ItemType.theme,
                    onItemSelected: onThemeSelected,
                    crossAxisCount: itemsPerRow,
                    itemSize: itemSize,
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBannerGrid(
      BuildContext context, int itemsPerRow, double itemSize) {
    final allBannerOptions = [REMOVE_BANNER_ID, ...banners];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: itemsPerRow,
        crossAxisSpacing: 10.0,
        mainAxisSpacing: 10.0,
        childAspectRatio: 1.0,
      ),
      itemCount: allBannerOptions.length,
      itemBuilder: (context, index) {
        final item = allBannerOptions[index];

        if (item == REMOVE_BANNER_ID) {
          return _buildRemoveBannerItem(context, () {
            onBannerSelected(REMOVE_BANNER_ID);
          }, itemSize);
        } else {
          return ItemWidget.inventory(
            item: item,
            itemType: ItemType.banner,
            onTap: () => onBannerSelected(item),
            size: itemSize,
          );
        }
      },
    );
  }

  Widget _buildRemoveBannerItem(
      BuildContext context, VoidCallback onTap, double size) {
    final colorScheme = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: colorScheme.primary,
          border: Border.all(
            color: colorScheme.secondary,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.remove_circle_outline,
              color: colorScheme.onPrimary,
              size: size * 0.5,
            ),
            const SizedBox(height: 4),
            Text(
              'Retirer',
              style: TextStyle(
                color: colorScheme.onPrimary,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, ColorScheme colorScheme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: colorScheme.onPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          height: 1,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                colorScheme.tertiary,
                colorScheme.tertiary,
                Colors.transparent,
              ],
              stops: const [0.0, 0.5, 1.0],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyMessage(String message, ColorScheme colorScheme) {
    return Container(
      width: double.infinity,
      height: 100,
      alignment: Alignment.center,
      child: Text(
        message,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: colorScheme.onPrimary,
          fontStyle: FontStyle.italic,
        ),
      ),
    );
  }
}
