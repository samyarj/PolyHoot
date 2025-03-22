enum QuestionType {
  QCM,
  QRL,
  QRE,
}

extension QuestionTypeExtension on QuestionType {
  String get name {
    switch (this) {
      case QuestionType.QCM:
        return 'QCM';
      case QuestionType.QRL:
        return 'QRL';
      case QuestionType.QRE:
        return 'QRE';
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
  Exact,
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
      case ChoiceFeedback.Exact:
        return 'exact';
    }
  }
}

enum RewardType {
  Theme('theme'),
  Avatar('avatar'),
  Border('border'),
  Coins('coins');

  final String value;
  const RewardType(this.value);
}

enum RewardRarity {
  Common('common'),
  Rare('rare'),
  VeryRare('very-rare');

  final String value;
  const RewardRarity(this.value);
}
