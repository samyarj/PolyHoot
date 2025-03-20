import 'reward.dart';

class LootBoxContainer {
  final List<Reward> rewards;
  final String image; // Image of the lootbox
  final num price;

  LootBoxContainer({
    required this.rewards,
    required this.image,
    required this.price,
  });

  factory LootBoxContainer.fromJson(Map<String, dynamic> json) {
    return LootBoxContainer(
      rewards: (json['rewards'] as List<dynamic>)
          .map((reward) => Reward.fromJson(reward as Map<String, dynamic>))
          .toList(),
      image: json['image'] as String,
      price: json['price'] as num,
    );
  }
}
