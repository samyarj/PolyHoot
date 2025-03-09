enum QuestionType {
  QCM,
  QRL,
}

extension QuestionTypeExtension on QuestionType {
  String get name {
    switch (this) {
      case QuestionType.QCM:
        return 'QCM';
      case QuestionType.QRL:
        return 'QRL';
    }
  }
}

enum ChoiceFeedback {
  First,
  Correct,
  Partial,
  Incorrect,
  Awaiting,
  AwaitingCorrection,
  Idle,
}

extension ChoiceFeedbackExtension on ChoiceFeedback {
  String get name {
    switch (this) {
      case ChoiceFeedback.First:
        return 'first';
      case ChoiceFeedback.Correct:
        return 'correct';
      case ChoiceFeedback.Partial:
        return 'partial';
      case ChoiceFeedback.Incorrect:
        return 'incorrect';
      case ChoiceFeedback.Awaiting:
        return 'awaiting';
      case ChoiceFeedback.AwaitingCorrection:
        return 'awaitingCorrection';
      case ChoiceFeedback.Idle:
        return 'idle';
    }
  }
}
