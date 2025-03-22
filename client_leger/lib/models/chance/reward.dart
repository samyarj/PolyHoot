import 'package:client_leger/models/enums.dart';

class Reward {
  final RewardType type;
  final RewardRarity rarity;
  final num odds;
  final dynamic
      value; // Link for avatar/border, string theme or int for coin amount

  Reward({
    required this.type,
    required this.rarity,
    required this.odds,
    required this.value,
  });

  factory Reward.fromJson(Map<String, dynamic> json) {
    return Reward(
      type: RewardType.values.firstWhere((e) => e.value == json['type']),
      rarity: RewardRarity.values.firstWhere((e) => e.value == json['rarity']),
      odds: json['odds'] as num,
      value: json['value'],
    );
  }
}
