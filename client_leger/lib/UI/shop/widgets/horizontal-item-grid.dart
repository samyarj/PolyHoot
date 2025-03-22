import 'package:client_leger/UI/inventory/widgets/item_grid.dart';
import 'package:client_leger/UI/shop/widgets/empty-message.dart';
import 'package:client_leger/UI/shop/widgets/shop-item-widget.dart';
import 'package:flutter/material.dart';

class HorizontalItemGrid extends StatelessWidget {
  final List<dynamic> items;
  final ItemType itemType;
  final Function onItemSelected;
  final double itemSize;
  final double spacing;
  final String sectionTitle;
  final Widget? emptyWidget;
  final Map<dynamic, int> priceMap;

  const HorizontalItemGrid({
    Key? key,
    required this.items,
    required this.itemType,
    required this.onItemSelected,
    required this.sectionTitle,
    required this.priceMap,
    this.itemSize = 70.0,
    this.spacing = 10.0,
    this.emptyWidget,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section title (without arrow)
        Padding(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                sectionTitle,
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
          EmptyMessage(
            message: 'Aucun item disponible pour le moment.',
          )
        else
          SizedBox(
            height: itemSize + 20,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.only(right: spacing),
                  child: ShopItemWidget(
                    item: items[index],
                    itemType: itemType,
                    onTap: () => onItemSelected(items[index]),
                    price: priceMap[items[index]] ?? 0,
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
