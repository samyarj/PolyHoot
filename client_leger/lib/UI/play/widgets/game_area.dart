import 'package:client_leger/UI/play/widgets/control_section.dart';
import 'package:client_leger/UI/play/widgets/question_content.dart';
import 'package:client_leger/UI/play/widgets/question_section.dart';
import 'package:flutter/material.dart';

// Main Game Area
class GameArea extends StatelessWidget {
  const GameArea({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Question section with timer and points
            QuestionSection(),
            const SizedBox(height: 20),

            // Question specific section (QCM, QRL)
            QuestionContent(),
            const SizedBox(height: 20),

            // Game controls section
            ControlSection(),
          ],
        ),
      ),
    );
  }
}
