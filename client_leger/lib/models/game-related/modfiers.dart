// Modifiers model
class Modifiers {
  final bool paused;
  final bool alertMode;

  Modifiers({
    required this.paused,
    required this.alertMode,
  });

  // Copy with method for immutability
  Modifiers copyWith({
    bool? paused,
    bool? alertMode,
  }) {
    return Modifiers(
      paused: paused ?? this.paused,
      alertMode: alertMode ?? this.alertMode,
    );
  }
}
