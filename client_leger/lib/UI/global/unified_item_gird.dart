import 'package:client_leger/UI/global/item_widget.dart';
import 'package:client_leger/UI/shop/widgets/empty-message.dart';
import 'package:client_leger/utilities/enums.dart';
import 'package:flutter/material.dart';

enum GridLayout {
  grid, // Regular grid layout
  horizontal // Horizontal scrolling layout
}

class UnifiedItemGrid extends StatelessWidget {
  final List<dynamic> items;
  final ItemType itemType;
  final Function onItemSelected;
  final GridLayout layout;
  final String? sectionTitle;
  final int crossAxisCount;
  final double itemSize;
  final double spacing;
  final Widget? emptyWidget;
  final Map<dynamic, int>? priceMap;
  final bool isShopItem;

  const UnifiedItemGrid({
    Key? key,
    required this.items,
    required this.itemType,
    required this.onItemSelected,
    this.layout = GridLayout.grid,
    this.sectionTitle,
    this.crossAxisCount = 4,
    this.itemSize = 80.0,
    this.spacing = 10.0,
    this.emptyWidget,
    this.priceMap,
    this.isShopItem = false,
  }) : super(key: key);

  // Factory constructor for regular grid layout (inventory style)
  factory UnifiedItemGrid.grid({
    Key? key,
    required List<dynamic> items,
    required ItemType itemType,
    required Function onItemSelected,
    int crossAxisCount = 4,
    double itemSize = 80.0,
    double spacing = 10.0,
  }) {
    return UnifiedItemGrid(
      key: key,
      items: items,
      itemType: itemType,
      onItemSelected: onItemSelected,
      layout: GridLayout.grid,
      crossAxisCount: crossAxisCount,
      itemSize: itemSize,
      spacing: spacing,
      isShopItem: false,
    );
  }

  // Factory constructor for horizontal layout (shop style)
  factory UnifiedItemGrid.horizontal({
    Key? key,
    required List<dynamic> items,
    required ItemType itemType,
    required Function onItemSelected,
    required String sectionTitle,
    required Map<dynamic, int> priceMap,
    double itemSize = 70.0,
    double spacing = 10.0,
    Widget? emptyWidget,
  }) {
    return UnifiedItemGrid(
      key: key,
      items: items,
      itemType: itemType,
      onItemSelected: onItemSelected,
      layout: GridLayout.horizontal,
      sectionTitle: sectionTitle,
      itemSize: itemSize,
      spacing: spacing,
      emptyWidget: emptyWidget,
      priceMap: priceMap,
      isShopItem: true,
    );
  }

  @override
  Widget build(BuildContext context) {
    return layout == GridLayout.grid
        ? _buildGridLayout()
        : _buildHorizontalLayout(context);
  }

  // Regular grid layout (for inventory items)
  Widget _buildGridLayout() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: spacing,
        mainAxisSpacing: spacing,
        childAspectRatio: 1.0,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        return isShopItem && priceMap != null
            ? ItemWidget.shop(
                item: items[index],
                itemType: itemType,
                onTap: () => onItemSelected(items[index]),
                price: priceMap![items[index]] ?? 0,
                size: itemSize,
              )
            : ItemWidget.inventory(
                item: items[index],
                itemType: itemType,
                onTap: () => onItemSelected(items[index]),
                size: itemSize,
              );
      },
    );
  }

  // Horizontal layout with section title (for shop items)
  Widget _buildHorizontalLayout(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section title (only if provided)
        if (sectionTitle != null)
          Padding(
            padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  sectionTitle!,
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
            ),
          ),
        const SizedBox(height: 8),

        // Items or empty message
        if (items.isEmpty && emptyWidget != null)
          emptyWidget!
        else if (items.isEmpty)
          const EmptyMessage(
            message: 'Aucun item disponible pour le moment.',
          )
        else
          SizedBox(
            height: isShopItem ? itemSize + 20 : itemSize,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.only(right: spacing),
                  child: isShopItem && priceMap != null
                      ? ItemWidget.shop(
                          item: items[index],
                          itemType: itemType,
                          onTap: () => onItemSelected(items[index]),
                          price: priceMap![items[index]] ?? 0,
                          size: itemSize,
                        )
                      : ItemWidget.inventory(
                          item: items[index],
                          itemType: itemType,
                          onTap: () => onItemSelected(items[index]),
                          size: itemSize,
                        ),
                );
              },
            ),
          ),
      ],
    );
  }
}
