import 'question.dart';

class Quiz {
  String? id;
  String title;
  String description;
  String lastModification;
  int duration;
  List<Question> questions;
  bool? visibility;

  Quiz({
    this.id,
    required this.title,
    required this.description,
    required this.lastModification,
    required this.duration,
    required this.questions,
    this.visibility,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      lastModification: json['lastModification'],
      duration: json['duration'],
      questions: (json['questions'] as List)
          .map((question) => Question.fromJson(question))
          .toList(),
      visibility: json['visibility'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'lastModification': lastModification,
      'duration': duration,
      'questions': questions.map((question) => question.toJson()).toList(),
      'visibility': visibility,
    };
  }
}
