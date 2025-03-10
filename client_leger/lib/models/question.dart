import 'question_choice.dart';

class Question {
  String? id;
  String type;
  String text;
  int points;
  List<QuestionChoice>? choices;
  String? lastModified;

  Question({
    this.id,
    required this.type,
    required this.text,
    required this.points,
    this.choices,
    this.lastModified,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      type: json['type'],
      text: json['text'],
      points: json['points'],
      choices: json['choices'] != null
          ? (json['choices'] as List)
              .map((choice) => QuestionChoice.fromJson(choice))
              .toList()
          : null,
      lastModified: json['lastModified'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'text': text,
      'points': points,
      'choices': choices?.map((choice) => choice.toJson()).toList(),
      'lastModified': lastModified,
    };
  }
}
