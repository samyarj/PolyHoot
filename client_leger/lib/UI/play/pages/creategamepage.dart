import 'package:client_leger/UI/play/widgets/game_creation_popup.dart';
import 'package:client_leger/backend-communication-services/quizzes/quiz_service.dart';
import 'package:client_leger/models/quiz.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';

class GameCreationPage extends StatelessWidget {
  const GameCreationPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final softSecondary = Color.lerp(colorScheme.secondary, Colors.white, 0.2);
    final ScrollController scrollController = ScrollController();

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            colorScheme.primary,
            colorScheme.primary.withValues(alpha: 0.6),
            softSecondary!,
            colorScheme.primary.withValues(alpha: 0.6),
            colorScheme.primary,
          ],
          stops: const [0.0, 0.25, 0.5, 0.75, 1.0],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: FutureBuilder<List<Quiz>>(
        future: getAllQuizzes(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: ThemedProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(
                child: Text(
              'Erreur: ${snapshot.error}',
              style: TextStyle(color: colorScheme.error),
            ));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
                child: Text(
              "Aucun questionnaire trouvé",
              style: TextStyle(color: colorScheme.onPrimary),
            ));
          } else {
            final quizzes = snapshot.data!;

            return Center(
              child: Container(
                width: double.infinity,
                margin: EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                child: Center(
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.6,
                    padding: const EdgeInsets.symmetric(vertical: 20.0),
                    child: RawScrollbar(
                      controller: scrollController,
                      thumbColor: colorScheme.secondary.withValues(alpha: 0.7),
                      radius: const Radius.circular(20),
                      thickness: 8,
                      thumbVisibility: true,
                      child: Padding(
                        padding: const EdgeInsets.only(right: 45),
                        child: ListView.builder(
                          controller: scrollController,
                          physics: ClampingScrollPhysics(),
                          itemCount: quizzes.length,
                          padding: const EdgeInsets.symmetric(vertical: 10.0),
                          itemBuilder: (context, index) {
                            final quiz = quizzes[index];
                            return GestureDetector(
                              onTap: () =>
                                  GameCreationPopup.show(context, quiz),
                              child: Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 15),
                                child: Container(
                                  padding: EdgeInsets.symmetric(vertical: 22),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        softSecondary.withValues(alpha: 0.2),
                                        colorScheme.primary
                                            .withValues(alpha: 0.2),
                                        colorScheme.primary
                                            .withValues(alpha: 0.6),
                                        colorScheme.primary
                                            .withValues(alpha: 0.7),
                                        colorScheme.primary
                                            .withValues(alpha: 0.75),
                                        colorScheme.primary
                                            .withValues(alpha: 0.75),
                                        colorScheme.primary
                                            .withValues(alpha: 0.7),
                                        colorScheme.primary
                                            .withValues(alpha: 0.6),
                                        colorScheme.primary
                                            .withValues(alpha: 0.2),
                                        softSecondary.withValues(alpha: 0.2),
                                      ],
                                      stops: const [
                                        0.0,
                                        0.10,
                                        0.20,
                                        0.25,
                                        0.30,
                                        0.70,
                                        0.75,
                                        0.80,
                                        0.90,
                                        1.0
                                      ],
                                      begin: Alignment.centerLeft,
                                      end: Alignment.centerRight,
                                    ),
                                    borderRadius: BorderRadius.circular(40),
                                    border: Border.all(
                                      color: colorScheme.secondary
                                          .withValues(alpha: 0.25),
                                      width: 2,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: colorScheme.secondary
                                            .withValues(alpha: 0.5),
                                        blurRadius: 5,
                                        spreadRadius: 0,
                                        offset: Offset(0, 0),
                                      ),
                                    ],
                                  ),
                                  child: Center(
                                    child: Text(
                                      quiz.title,
                                      style: TextStyle(
                                        fontSize: 24,
                                        color: colorScheme.onPrimary,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          }
        },
      ),
    );
  }
}
