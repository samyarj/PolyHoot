class QuestionChoice {
  String text;
  bool? isCorrect;
  bool? isSelected;

  QuestionChoice({
    required this.text,
    this.isCorrect,
    this.isSelected,
  });

  factory QuestionChoice.fromJson(Map<String, dynamic> json) {
    return QuestionChoice(
      text: json['text'],
      isCorrect: json['isCorrect'],
      isSelected: json['isSelected'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'text': text,
      'isCorrect': isCorrect,
      'isSelected': isSelected,
    };
  }
}
