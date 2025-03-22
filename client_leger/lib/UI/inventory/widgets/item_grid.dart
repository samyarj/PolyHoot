import 'package:client_leger/UI/inventory/widgets/inventory_item.dart';
import 'package:flutter/material.dart';

enum ItemType {
  avatar,
  banner,
  theme,
}

class ItemGrid extends StatelessWidget {
  final List<dynamic> items;
  final ItemType itemType;
  final Function onItemSelected;
  final int crossAxisCount; // New parameter
  final double itemSize; // New parameter
  final double spacing; // Optional spacing parameter

  const ItemGrid({
    Key? key,
    required this.items,
    required this.itemType,
    required this.onItemSelected,
    this.crossAxisCount = 4, // Default value
    this.itemSize = 80.0, // Default value
    this.spacing = 10.0, // Default spacing
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
        return InventoryItem(
          item: items[index],
          itemType: itemType,
          onTap: () => onItemSelected(items[index]),
          size: itemSize, // Pass the size to InventoryItem
        );
      },
    );
  }
}
