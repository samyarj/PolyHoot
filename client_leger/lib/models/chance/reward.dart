import 'package:client_leger/models/enums.dart';
import 'package:client_leger/utilities/logger.dart';

class Reward {
  final RewardType type;
  final RewardRarity rarity;
  final double odds;
  final dynamic value; // String for avatar/border/theme or int for coin amount

  Reward({
    required this.type,
    required this.rarity,
    required this.odds,
    required this.value,
  });

  factory Reward.fromJson(Map<String, dynamic> json) {
    AppLogger.i("Reward.fromJson: $json");
    return Reward(
      type: RewardType.values.firstWhere((e) => e.value == json['type']),
      rarity: RewardRarity.values.firstWhere((e) => e.value == json['rarity']),
      odds: (json['odds'] as num).toDouble(),
      value: json['value'],
    );
  }
}
