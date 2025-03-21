import 'package:client_leger/models/chance/lootbox_container.dart';
import 'package:client_leger/utilities/logger.dart';

class DailyFree {
  final LootBoxContainer lootbox;
  final bool canClaim;
  final double hoursLeft;
  final double minutesLeft;

  DailyFree({
    required this.lootbox,
    required this.canClaim,
    required this.hoursLeft,
    required this.minutesLeft,
  });

  factory DailyFree.fromJson(Map<String, dynamic> json) {
    AppLogger.i("DailyFree.fromJson: $json");
    return DailyFree(
      lootbox: LootBoxContainer.fromJson(
        json['lootbox'] ,
      ),
      canClaim: json['canClaim'] as bool? ?? false,
      hoursLeft: (json['hoursLeft'] as num?)?.toDouble() ?? 0.0,
      minutesLeft: (json['minutesLeft'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
