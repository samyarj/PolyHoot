import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/quiz.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class GameCreationPopup {
  static void show(BuildContext context, Quiz quiz) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final ScrollController scrollController = ScrollController();

    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          insetPadding: EdgeInsets.symmetric(horizontal: 40.0, vertical: 24.0),
          child: Container(
            width: 700,
            height: 550,
            decoration: BoxDecoration(
              color: colorScheme.surface,
              borderRadius: BorderRadius.circular(15),
              border: Border.all(color: colorScheme.secondary, width: 3),
            ),
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          quiz.title,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: colorScheme.onPrimary,
                          ),
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: colorScheme.secondary, width: 2),
                        ),
                        child: IconButton(
                          icon: Icon(Icons.close, color: colorScheme.onPrimary),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RichText(
                          text: TextSpan(
                            style: TextStyle(
                              fontSize: 16,
                              color: colorScheme.onPrimary,
                            ),
                            children: [
                              TextSpan(
                                text: "Description: ",
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              TextSpan(text: quiz.description),
                            ],
                          ),
                        ),
                        const SizedBox(height: 10),
                        RichText(
                          text: TextSpan(
                            style: TextStyle(
                              fontSize: 16,
                              color: colorScheme.onPrimary,
                            ),
                            children: [
                              TextSpan(
                                text: "Temps par question: ",
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              TextSpan(text: "${quiz.duration} sec"),
                            ],
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          "Questions:",
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: colorScheme.onPrimary,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Container(
                            height: 220,
                            child: ScrollbarTheme(
                              data: ScrollbarThemeData(
                                thumbColor: WidgetStateProperty.all(colorScheme
                                    .secondary
                                    .withValues(alpha: 0.4)),
                                thickness: WidgetStateProperty.all(4),
                                radius: const Radius.circular(8),
                              ),
                              child: Scrollbar(
                                controller: scrollController,
                                thumbVisibility: true,
                                child: SingleChildScrollView(
                                  controller: scrollController,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: List.generate(
                                        quiz.questions.length, (index) {
                                      final question = quiz.questions[index];
                                      return Padding(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 4),
                                        child: Text(
                                          "${index + 1}. ${question.text} : ${question.type}",
                                          style: TextStyle(
                                            fontSize: 16,
                                            color: colorScheme.onPrimary,
                                          ),
                                        ),
                                      );
                                    }),
                                  ),
                                ),
                              ),
                            )),
                        const SizedBox(height: 20),
                        Align(
                          alignment: Alignment.center,
                          child: ElevatedButton(
                            onPressed: () {
                              _createGame(context, quiz);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: colorScheme.surface,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 24, vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(40),
                                side: BorderSide(
                                    color: colorScheme.secondary, width: 2),
                              ),
                              elevation: 0,
                            ),
                            child: Text(
                              "Créer une partie",
                              style: TextStyle(
                                fontSize: 18,
                                color: colorScheme.onPrimary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  static void _createGame(BuildContext context, Quiz quiz) {
    final socket = WebSocketManager.instance;

    socket.webSocketSender(JoinEvents.Create.value, quiz.toJson(), (roomId) {
      socket.setRoomId(roomId);
      socket.isOrganizer = true;
      Navigator.pop(context);
      GoRouter.of(context).push('${Paths.play}/${Paths.waitingPage}');
    });
  }
}
