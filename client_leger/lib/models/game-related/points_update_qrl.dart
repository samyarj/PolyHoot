// PointsUpdateQRL model
class PointsUpdateQRL {
  final String playerName;
  final double points;

  PointsUpdateQRL({
    required this.playerName,
    required this.points,
  });

  // Convert to map for JSON serialization
  Map<String, dynamic> toJson() {
    return {
      'playerName': playerName,
      'points': points,
    };
  }
}
