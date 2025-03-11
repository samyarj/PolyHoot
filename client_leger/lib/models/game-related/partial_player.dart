// PartialPlayer model
class PartialPlayer {
  final String name;
  final bool isInGame;
  final int points;
  final bool submitted;

  PartialPlayer({
    required this.name,
    required this.isInGame,
    required this.points,
    required this.submitted,
  });

  // Copy with method for immutability
  PartialPlayer copyWith({
    String? name,
    bool? isInGame,
    int? points,
    bool? submitted,
  }) {
    return PartialPlayer(
      name: name ?? this.name,
      isInGame: isInGame ?? this.isInGame,
      points: points ?? this.points,
      submitted: submitted ?? this.submitted,
    );
  }
}
