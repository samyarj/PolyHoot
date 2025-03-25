import 'package:client_leger/models/question.dart';
import 'package:flutter/material.dart';

class QuestionArea extends StatelessWidget {
  const QuestionArea(
      {super.key,
      required this.isWaitingForQuestion,
      required this.paused,
      required this.time,
      required this.playerPoints,
      required this.currentQuestion,
      required this.currentQuestionIndex});

  final bool isWaitingForQuestion;
  final bool paused;
  final int time;
  final String playerPoints;
  final Question currentQuestion;
  final int currentQuestionIndex;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      height: 300,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.primary,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(
          color: colorScheme.tertiary.withValues(alpha: 0.3), // Border color
          width: 2, // Border width
        ),
        boxShadow: [
          BoxShadow(
            color: colorScheme.tertiary.withValues(alpha: 0.3),
            spreadRadius: 2,
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          //time and players points
          Container(
            decoration: BoxDecoration(
              color: colorScheme.tertiary
                  .withAlpha(51), // Background color (20% opacity)
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(30),
                topRight: Radius.circular(30),
              ), // Rounded corners
            ),
            padding: const EdgeInsets.all(6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // time
                Container(
                  width: 302,
                  decoration: BoxDecoration(
                    color: colorScheme.primary.withAlpha(153),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                    ),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      time == 0
                          ? Text(
                              "Temps ÉCOULÉ",
                              style: TextStyle(fontSize: 16),
                            )
                          : Text.rich(
                              TextSpan(
                                text: "Temps Restant: ",
                                style: TextStyle(
                                    color: colorScheme.onSurface, fontSize: 16),
                                children: [
                                  TextSpan(
                                    text: isWaitingForQuestion
                                        ? null
                                        : time.toString(),
                                    // Bold part
                                    style:
                                        TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                      if (paused)
                        Text(
                          " PAUSE",
                          style: TextStyle(fontSize: 16),
                        ),
                    ],
                  ),
                ),

                // points
                Container(
                  width: 302,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: colorScheme.primary
                        .withAlpha(153), // 153 is approximately 60% opacity
                    borderRadius: BorderRadius.only(
                      topRight: Radius.circular(30),
                    ),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  child: Text.rich(
                    TextSpan(
                      text: "Mes points: ", // Regular text
                      style:
                          TextStyle(color: colorScheme.onSurface, fontSize: 16),
                      children: [
                        TextSpan(
                          text: playerPoints, // Bold part
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Divider
              Container(
                width: 5, // Thickness of the divider
                height: 125,
                color: colorScheme.tertiary.withAlpha(51), // Divider color
              ),

              // current question
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Container(
                    decoration: BoxDecoration(
                      color: colorScheme.secondary.withAlpha(51),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    alignment: Alignment.center,
                    padding: const EdgeInsets.all(16),
                    child: isWaitingForQuestion
                        ? Text(
                            "La prochaine question commence dans $time seconde${time == 1 ? '' : 's'}.",
                            style: TextStyle(
                                color: colorScheme.onSurface, fontSize: 16),
                          )
                        : ConstrainedBox(
                            constraints: BoxConstraints(
                              maxHeight: 80,
                            ),
                            child: SingleChildScrollView(
                              child: Text(
                                currentQuestion.text,
                                style: TextStyle(fontSize: 16),
                                softWrap: true,
                              ),
                            ),
                          ),
                  ),
                ),
              ),

              // Divider

              Container(
                width: 5, // Thickness of the divider
                height: 125,
                color: colorScheme.tertiary.withAlpha(51), // Divider color
              ),
            ],
          ),

          // #question and question points
          Container(
            decoration: BoxDecoration(
              color: colorScheme.tertiary
                  .withAlpha(51), // Background color (20% opacity)
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ), // Rounded corners
            ),
            padding: const EdgeInsets.all(6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // #question
                Container(
                  width: 302,
                  decoration: BoxDecoration(
                    color: colorScheme.primary
                        .withAlpha(153), // 153 is approximately 60% opacity
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(30),
                    ),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  alignment: Alignment.center,
                  child: Text("Question # ${currentQuestionIndex + 1}",
                      style: TextStyle(
                          color: colorScheme.onSurface, fontSize: 16)),
                ),

                // question points
                Container(
                  width: 302,
                  decoration: BoxDecoration(
                    color: colorScheme.primary
                        .withAlpha(153), // 153 is approximately 60% opacity
                    borderRadius: BorderRadius.only(
                      bottomRight: Radius.circular(30),
                    ),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  alignment: Alignment.center,
                  child: Text(
                    "${currentQuestion.points.toString()} pts",
                    style:
                        TextStyle(color: colorScheme.onSurface, fontSize: 16),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
