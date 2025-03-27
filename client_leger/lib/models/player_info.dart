class PlayerInfo {
  bool submitted;
  bool userFirst;
  List<bool> choiceSelected;
  bool waitingForQuestion;
  bool exactAnswer;

  PlayerInfo({
    required this.submitted,
    required this.userFirst,
    required this.choiceSelected,
    required this.waitingForQuestion,
    required this.exactAnswer,
  });

  PlayerInfo copyWith({
    bool? submitted,
    bool? userFirst,
    List<bool>? choiceSelected,
    bool? waitingForQuestion,
    bool? exactAnswer,
  }) {
    return PlayerInfo(
      submitted: submitted ?? this.submitted,
      userFirst: userFirst ?? this.userFirst,
      choiceSelected: choiceSelected ?? this.choiceSelected,
      waitingForQuestion: waitingForQuestion ?? this.waitingForQuestion,
      exactAnswer: exactAnswer ?? this.exactAnswer,
    );
  }
}
