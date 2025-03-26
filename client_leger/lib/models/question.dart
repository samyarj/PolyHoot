import 'qre_attributes.dart';
import 'question_choice.dart';

class Question {
  String? id;
  String type;
  String text;
  String? image;
  int points;
  List<QuestionChoice>? choices;
  String? lastModified;
  QreAttributes? qreAttributes;

  Question({
    this.id,
    required this.type,
    required this.text,
    required this.points,
    this.image,
    this.choices,
    this.lastModified,
    this.qreAttributes,
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
      image: json['image'],
      lastModified: json['lastModified'],
      qreAttributes: json['qreAttributes'] != null
          ? QreAttributes.fromJson(json['qreAttributes'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'text': text,
      'image': image,
      'points': points,
      'choices': choices?.map((choice) => choice.toJson()).toList(),
      'lastModified': lastModified,
      'qreAttributes': qreAttributes?.toJson(),
    };
  }
}
