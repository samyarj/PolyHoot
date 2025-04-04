import 'package:client_leger/models/question.dart';

class Poll {
  final String? id;
  final String title;
  final String description;
  final List<Question> questions;
  final bool expired;
  final String? endDate;
  final bool isPublished;

  Poll({
    this.id,
    required this.title,
    required this.description,
    required this.questions,
    required this.expired,
    this.endDate,
    required this.isPublished,
  });

  factory Poll.fromJson(Map<String, dynamic> json) {
    return Poll(
      id: json['id'] as String?,
      title: json['title'] as String,
      description: json['description'] as String,
      questions: (json['questions'] as List<dynamic>)
          .map((q) => Question.fromJson(q as Map<String, dynamic>))
          .toList(),
      expired: json['expired'] as bool,
      endDate: json['endDate'] as String?,
      isPublished: json['isPublished'] as bool,
    );
  }
}

class PublishedPoll extends Poll {
  final String publicationDate;
  final Map<String, List<int>> totalVotes;

  PublishedPoll({
    String? id,
    required String title,
    required String description,
    required List<Question> questions,
    required bool expired,
    String? endDate,
    required this.publicationDate,
    required this.totalVotes,
  }) : super(
          id: id,
          title: title,
          description: description,
          questions: questions,
          expired: expired,
          endDate: endDate,
          isPublished: true,
        );

  factory PublishedPoll.fromJson(Map<String, dynamic> json) {
    Map<String, List<int>> totalVotesMap = {};

    if (json['totalVotes'] != null) {
      final votes = json['totalVotes'] as Map<String, dynamic>;
      votes.forEach((key, value) {
        totalVotesMap[key] =
            (value as List<dynamic>).map((v) => v as int).toList();
      });
    }

    return PublishedPoll(
      id: json['id'] as String?,
      title: json['title'] as String,
      description: json['description'] as String,
      questions: (json['questions'] as List<dynamic>)
          .map((q) => Question.fromJson(q as Map<String, dynamic>))
          .toList(),
      expired: json['expired'] as bool,
      endDate: json['endDate'] as String?,
      publicationDate: json['publicationDate'] as String,
      totalVotes: totalVotesMap,
    );
  }
}
