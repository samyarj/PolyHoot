class PlayerInfo {
  bool submitted;
  bool userFirst;
  List<bool> choiceSelected;
  bool waitingForQuestion;

  PlayerInfo({
    required this.submitted,
    required this.userFirst,
    required this.choiceSelected,
    required this.waitingForQuestion,
  });

  PlayerInfo copyWith({
    bool? submitted,
    bool? userFirst,
    List<bool>? choiceSelected,
    bool? waitingForQuestion,
  }) {
    return PlayerInfo(
      submitted: submitted ?? this.submitted,
      userFirst: userFirst ?? this.userFirst,
      choiceSelected: choiceSelected ?? this.choiceSelected,
      waitingForQuestion: waitingForQuestion ?? this.waitingForQuestion,
    );
  }
}
