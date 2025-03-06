import 'package:client_leger/UI/play/widgets/game_creation_popup.dart';
import 'package:client_leger/backend-communication-services/models/quiz.dart';
import 'package:client_leger/backend-communication-services/quizzes/quiz_service.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';

class GameCreationPage extends StatelessWidget {
  const GameCreationPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme; // Get theme colors

    return FutureBuilder<List<Quiz>>(
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
            style: TextStyle(color: colorScheme.onSurface),
          ));
        } else {
          final quizzes = snapshot.data!;
          return ListView.builder(
            itemCount: quizzes.length,
            itemBuilder: (context, index) {
              final quiz = quizzes[index];
              return GestureDetector(
                onTap: () =>
                    GameCreationPopup.show(context, quiz), // Show popup on tap
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
                  child: Container(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          colorScheme.primaryContainer,
                          colorScheme.primary
                        ], // Theme colors
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Center(
                      child: Text(
                        quiz.title,
                        style: TextStyle(
                          fontSize: 24,
                          color: colorScheme.onPrimary, // Text color from theme
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          );
        }
      },
    );
  }
}
