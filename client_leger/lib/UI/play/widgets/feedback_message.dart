import 'package:client_leger/models/enums.dart';
import 'package:client_leger/models/question.dart';
import 'package:flutter/material.dart';

Widget buildFeedbackMessage(
    ChoiceFeedback choiceFeedback, Question currentQuestion) {
  switch (choiceFeedback) {
    case ChoiceFeedback.First:
      if (currentQuestion.type == QuestionType.QCM.name) {
        return Text(
          'Félicitations, vous êtes le premier à avoir bien répondu! Un bonus de point de 20% vous est accordé',
          style: TextStyle(fontSize: 20),
        );
      }
      break;
    case ChoiceFeedback.Exact:
      if (currentQuestion.type == QuestionType.QRE.name) {
        return Text(
          'Félicitations, c\'était la réponse exacte! Un bonus de point de 20% vous est accordé',
          style: TextStyle(fontSize: 20),
        );
      }
      break;
    case ChoiceFeedback.Correct:
      return Text(
        'Bonne réponse${currentQuestion.type == 'QCM' ? ', mais pas la première!' : '!'} Tous les points sont accordés.',
        style: TextStyle(fontSize: 20),
      );
    case ChoiceFeedback.Awaiting:
      return Text(
        'En attente de la réponse des autres joueurs.',
        style: TextStyle(fontSize: 20),
      );
    case ChoiceFeedback.Idle:
      return Text(
        'En attente de votre ${currentQuestion.type == 'QCM' ? 'sélection de choix.' : 'réponse.'}',
        style: TextStyle(fontSize: 20),
      );
    case ChoiceFeedback.AwaitingCorrection:
      return Text(
        'Nous attendons la correction de l\'organisateur...',
        style: TextStyle(fontSize: 20),
      );
    case ChoiceFeedback.Incorrect:
      return Text(
        'Mauvaise réponse, aucun point accordé.',
        style: TextStyle(fontSize: 20),
      );
    case ChoiceFeedback.Partial:
      if (currentQuestion.type == 'QRL') {
        return Text(
          'Pas tout à fait! L\'organisateur vous a accordé des points partiels.',
          style: TextStyle(fontSize: 20),
        );
      }
      break;
  }
  return Container();
}
