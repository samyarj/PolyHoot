class Stats {
  final int? nGoodAnswers;
  final int? nQuestions;
  final num? rightAnswerPercentage;
  final int? timeSpent;

  Stats({
    required this.nGoodAnswers,
    required this.nQuestions,
    required this.rightAnswerPercentage,
    required this.timeSpent,
  });

  factory Stats.fromJson(Map<String, dynamic> json) {
    return Stats(
      nGoodAnswers:
          json['nGoodAnswers'] != null ? json['nGoodAnswers'] as int : null,
      nQuestions: json['nQuestions'] != null ? json['nQuestions'] as int : null,
      rightAnswerPercentage: json['rightAnswerPercentage'] != null
          ? json['rightAnswerPercentage'] as num
          : null,
      timeSpent: json['timeSpent'] != null ? json['timeSpent'] as int : null,
    );
  }
}
