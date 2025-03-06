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
