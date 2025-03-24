// PartialPlayer model
class PartialPlayer {
  final String name;
  final bool isInGame;
  final String avatarEquipped;
  final String bannerEquipped;
  final int points;
  final bool submitted;

  PartialPlayer({
    required this.name,
    required this.isInGame,
    required this.points,
    required this.avatarEquipped,
    required this.bannerEquipped,
    required this.submitted,
  });

  // Copy with method for immutability
  PartialPlayer copyWith({
    String? name,
    bool? isInGame,
    int? points,
    bool? submitted,
    String? avatarEquipped,
    String? bannerEquipped,
  }) {
    return PartialPlayer(
      name: name ?? this.name,
      isInGame: isInGame ?? this.isInGame,
      points: points ?? this.points,
      submitted: submitted ?? this.submitted,
      avatarEquipped: avatarEquipped ?? this.avatarEquipped,
      bannerEquipped: bannerEquipped ?? this.bannerEquipped,
    );
  }
}
