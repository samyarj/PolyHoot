import 'dart:convert';
import 'package:client_leger/environment_config.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/models/question.dart';
import 'package:client_leger/models/quiz.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:http/http.dart' as http;

String baseUrl = EnvironmentConfig.serverUrl;
String getQuizzesUrl = "$baseUrl/quizzes";

Future<List<Quiz>> getAllQuizzes() async {
  try {
    final response = await http.get(Uri.parse(getQuizzesUrl));
    if (response.statusCode == 200) {
      final quizzesJson = json.decode(response.body);
      final quizzes = (quizzesJson as List<dynamic>)
          .map((quiz) => Quiz.fromJson(quiz))
          .toList();
      filterQuizzes(quizzes);
      return removeModeAleatoire(quizzes);
    } else {
      AppLogger.e(
          "La liste de questionnaires n'a pas pu être chargée : ${response.statusCode}");
      throw Exception("La liste de questionnaires n'a pas pu être chargée");
    }
  } catch (e) {
    AppLogger.e("La liste de questionnaires n'a pas pu être chargée : $e");
    throw Exception("La liste de questionnaires n'a pas pu être chargée");
  }
}

void removeChoicesQrl(List<Question> questions) {
  for (final question in questions) {
    if (question.type == QuestionType.QRL.name) {
      question.choices = null;
    }
  }
}

void filterQuizzes(List<Quiz> quizzes) {
  for (final quiz in quizzes) {
    removeChoicesQrl(quiz.questions);
  }
}

List<Quiz> removeModeAleatoire(List<Quiz> quizzes) {
  return quizzes.where((quiz) => quiz.title != "Mode aléatoire").toList();
}
