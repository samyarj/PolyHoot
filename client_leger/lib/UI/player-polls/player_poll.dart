import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/global/themed_progress_indicator.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/polls/poll-history-service.dart';
import 'package:client_leger/models/polls/published-poll-model.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class PlayerPoll extends StatefulWidget {
  const PlayerPoll(
      {super.key, required this.selectedPoll, required this.closeDialog});

  final PublishedPoll selectedPoll;
  final Function(bool isSuccess) closeDialog;

  @override
  State<PlayerPoll> createState() => _PlayerPollState();
}

enum PollState {
  NotStarted('not_started'),
  Started('started'),
  Finished('finished');

  final String value;
  const PollState(this.value);
}

class _PlayerPollState extends State<PlayerPoll> {
  PollState _currentState = PollState.NotStarted;
  int _currentQuestionIndex = 0;
  int? _selectedChoiceIndex;
  final List<int> _playerAnswers = [];
  bool _isLoadingSubmit = false;
  final PollHistoryService _pollService = PollHistoryService();

// pas nécessaire mais par mesure de précaution
  @override
  void initState() {
    AppLogger.w("PlayerPoll initState called");
    super.initState();
    _currentState = PollState.NotStarted;
    _currentQuestionIndex = 0;
    _selectedChoiceIndex = null;
    _playerAnswers.clear();
    _isLoadingSubmit = false;
  }

  selectChoice(int answerIndex) {
    setState(() {
      _selectedChoiceIndex = answerIndex;
    });
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < widget.selectedPoll.questions.length - 1 &&
        _selectedChoiceIndex != null) {
      _playerAnswers.add(_selectedChoiceIndex!);
      setState(() {
        _currentQuestionIndex++;
        _selectedChoiceIndex = null;
      });
    } else if (_selectedChoiceIndex != null) {
      _playerAnswers.add(_selectedChoiceIndex!);
      setState(() {
        _currentState = PollState.Finished;
        _selectedChoiceIndex = null;
      });
    }
  }

  onSubmit(BuildContext context) async {
    final String? userUid = FirebaseAuth.instance.currentUser?.uid;
    if (userUid == null || widget.selectedPoll.id == null) {
      return;
    } else {
      try {
        setState(() {
          _isLoadingSubmit = true;
        });
        await _pollService.sendAnsweredPlayerPoll(
            _playerAnswers, widget.selectedPoll.id!, userUid);
        if (mounted) {
          widget.closeDialog(true);
        }
      } catch (e) {
        if (mounted) {
          showErrorDialog(context, getCustomError(e));
          widget.closeDialog(false);
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoadingSubmit = false;
          });
        }
      }
    }
  }

  BorderRadius getBorderRadius(int index) {
    int? totalChoices =
        widget.selectedPoll.questions[_currentQuestionIndex].choices?.length;

    if (index == 0) {
      return totalChoices == 2
          ? BorderRadius.only(
              bottomLeft: Radius.circular(30),
            )
          : BorderRadius.only(
              topLeft: Radius.circular(30),
            );
    } else if (index == 1) {
      return totalChoices == 2
          ? BorderRadius.only(
              bottomRight: Radius.circular(30),
            )
          : BorderRadius.only(
              topRight: Radius.circular(30),
            );
    } else if (index == 2) {
      return BorderRadius.only(
        bottomLeft: Radius.circular(30),
      );
    }
    return BorderRadius.only(
      bottomRight: Radius.circular(30),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Center(
            child: Text(
              widget.selectedPoll.title,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
            ),
          ),
          _currentState == PollState.NotStarted
              ? Container(
                  height: MediaQuery.of(context).size.height * 0.5,
                  width: MediaQuery.of(context).size.width * 0.4,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: colorScheme.surface,
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(
                      color: colorScheme.tertiary
                          .withValues(alpha: 0.3), // Border color
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
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        RichText(
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: 'Description: ',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.onSurface,
                                ),
                              ),
                              TextSpan(
                                text: widget.selectedPoll.description,
                                style: TextStyle(
                                  fontSize: 20,
                                  color: colorScheme.onSurface,
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: 32),
                        Text(
                          "Questions:",
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: colorScheme.onSurface,
                          ),
                        ),
                        SizedBox(height: 6),
                        ...widget.selectedPoll.questions
                            .asMap()
                            .entries
                            .map((entry) {
                          final index = entry.key;
                          final question = entry.value;
                          return Padding(
                            padding: const EdgeInsets.all(6.0),
                            child: RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: '${index + 1}. ',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: colorScheme.onSurface,
                                    ),
                                  ),
                                  TextSpan(
                                    text: question.text,
                                    style: TextStyle(
                                      fontSize: 18,
                                      color: colorScheme.onSurface,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                )
              : _currentState == PollState.Finished
                  ? Container(
                      height: MediaQuery.of(context).size.height * 0.5,
                      width: MediaQuery.of(context).size.width * 0.4,
                      decoration: BoxDecoration(
                        color: colorScheme.surface,
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(
                          color: colorScheme.tertiary
                              .withValues(alpha: 0.3), // Border color
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
                      alignment: Alignment.center,
                      child: Text(
                        "Merci pour vos réponses !",
                        style: TextStyle(
                          fontSize: 24,
                          color: colorScheme.onSurface,
                        ),
                      ),
                    )
                  : Container(
                      padding: const EdgeInsets.only(
                          top: 15, left: 4, right: 4, bottom: 4),
                      height: MediaQuery.of(context).size.height * 0.5,
                      width: MediaQuery.of(context).size.width * 0.4,
                      decoration: BoxDecoration(
                        color: colorScheme.surface,
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(
                          color: colorScheme.tertiary
                              .withValues(alpha: 0.3), // Border color
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
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Center(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 8.0, horizontal: 16),
                                child: Text(
                                  widget.selectedPoll
                                      .questions[_currentQuestionIndex].text,
                                  style: TextStyle(
                                    fontSize: 18,
                                    color: colorScheme.onSurface,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          GridView.count(
                            shrinkWrap: true,
                            crossAxisCount: 2,
                            childAspectRatio: 2,
                            mainAxisSpacing: 4,
                            crossAxisSpacing: 4,
                            children: [
                              ...widget.selectedPoll
                                  .questions[_currentQuestionIndex].choices!
                                  .asMap()
                                  .entries
                                  .map(
                                (entry) {
                                  int choiceIndex = entry.key;
                                  final choice = entry.value;
                                  final isSelected =
                                      choiceIndex == _selectedChoiceIndex;

                                  return GestureDetector(
                                    onTap: () => selectChoice(choiceIndex),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? colorScheme.tertiary
                                            : colorScheme.secondary.withAlpha(
                                                150), // 153 is approximately 60% opacity
                                        borderRadius:
                                            getBorderRadius(choiceIndex),
                                      ),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 8),
                                      alignment: Alignment.center,
                                      child: SingleChildScrollView(
                                        child: Text(
                                          choice.text,
                                          style: TextStyle(
                                              fontSize: 16,
                                              color: isSelected
                                                  ? colorScheme.primary
                                                  : colorScheme.onPrimary),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
          _isLoadingSubmit
              ? ThemedProgressIndicator()
              : TextButton(
                  onPressed: () {
                    _currentState == PollState.NotStarted
                        ? setState(() {
                            _currentState = PollState.Started;
                            _currentQuestionIndex = 0;
                          })
                        : _currentState == PollState.Finished
                            ? onSubmit(context)
                            : _selectedChoiceIndex == null
                                ? null
                                : _nextQuestion();
                  },
                  style: ButtonStyle(
                    backgroundColor: WidgetStateProperty.all(
                      colorScheme.surface,
                    ),
                    shape: WidgetStateProperty.all(
                      RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(50), // Rounded corners
                        side: BorderSide(
                          color: colorScheme.tertiary.withOpacity(0.5),
                          width: 3,
                        ),
                      ),
                    ),
                  ),
                  child: Text(
                    _currentState == PollState.NotStarted
                        ? "Débuter"
                        : _currentState == PollState.Finished
                            ? "Soumettre vos réponses"
                            : "Prochaine question",
                    style: TextStyle(
                      color: colorScheme.onSurface,
                      fontSize: 20,
                    ),
                  ),
                ),
        ],
      ),
    );
  }
}
