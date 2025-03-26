import 'package:client_leger/models/enums.dart';

class ShopItem {
  final String name;
  final String link; // Changed from url to link to match backend
  final int price;
  final ItemType type;

  ShopItem({
    required this.name,
    required this.link,
    required this.price,
    required this.type,
  });

  factory ShopItem.fromJson(Map<String, dynamic> json, String type) {
    ItemType itemType;
    switch (type) {
      case 'avatar':
        itemType = ItemType.avatar;
        break;
      case 'banner':
        itemType = ItemType.banner;
        break;
      case 'theme':
        itemType = ItemType.theme;
        break;
      default:
        throw ArgumentError('Invalid item type: $type');
    }

    // Extract name from link if not provided
    String name = json['name'] ?? '';
    if (name.isEmpty && json['link'] != null) {
      // Extract name from link - take the filename without extension
      final linkStr = json['link'] as String;
      final segments = linkStr.split('/');
      if (segments.isNotEmpty) {
        final filename = segments.last;
        final nameWithoutExt = filename.split('.').first;
        name = nameWithoutExt;
      }
    }

    return ShopItem(
      name: name,
      link: json['link'] ?? '', // Using 'link' as per backend format
      price: json['price'] ?? 0,
      type: itemType,
    );
  }
}
