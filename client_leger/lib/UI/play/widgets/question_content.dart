import 'package:client_leger/UI/play/widgets/question-answer-display.dart';
import 'package:flutter/material.dart';

class QuestionContentSection extends StatelessWidget {
  const QuestionContentSection({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.tertiary,
          width: 2,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: QuestionAnswerDisplay(),
      ),
    );
  }
}
