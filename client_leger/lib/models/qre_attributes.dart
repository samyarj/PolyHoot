class QreAttributes {
  final int goodAnswer;
  final int minBound;
  final int maxBound;
  final int tolerance;

  QreAttributes({
    required this.goodAnswer,
    required this.minBound,
    required this.maxBound,
    required this.tolerance,
  });

  factory QreAttributes.fromJson(Map<String, dynamic> json) {
    return QreAttributes(
      goodAnswer: json['goodAnswer'],
      minBound: json['minBound'],
      maxBound: json['maxBound'],
      tolerance: json['tolerance'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'goodAnswer': goodAnswer,
      'minBound': minBound,
      'maxBound': maxBound,
      'tolerance': tolerance,
    };
  }
}