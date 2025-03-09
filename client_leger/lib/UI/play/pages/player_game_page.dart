import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/models/enums.dart';
import 'package:client_leger/providers/play/game_player_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PlayerGamePage extends ConsumerStatefulWidget {
  const PlayerGamePage({super.key});

  @override
  ConsumerState<PlayerGamePage> createState() => _PlayerGamePageState();
}

class _PlayerGamePageState extends ConsumerState<PlayerGamePage> {
  int? _selectedChoiceIndex;

  @override
  Widget build(BuildContext context) {
    final playerGameState = ref.watch(gameClientProvider);
    final playerGameNotifier = ref.read(gameClientProvider.notifier);
    final colorScheme = Theme.of(context).colorScheme;

    ref.listen(gameClientProvider, (previous, next) {
      if (next.shouldNavigateToResults) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          GoRouter.of(context).go('${Paths.play}/${Paths.resultsView}');
        });
      }
    });

    return Column(
      children: [
        Row(
          children: [
            Text(playerGameState.currentQuestion.points.toString(),
                style: TextStyle(color: colorScheme.onSurface)),
            Text(playerGameState.currentQuestion.text),
            Text(
              playerGameState.time.toString(),
            ),
          ],
        ),
        if (playerGameState.currentQuestion.type == QuestionType.QCM.name)
          ...playerGameState.currentQuestion.choices!
              .asMap()
              .entries
              .map((entry) {
            int choiceIndex = entry.key;
            final choice = entry.value;
            return ListTile(
              title: Text(choice.text),
              leading: Radio(
                value: choice,
                groupValue: _selectedChoiceIndex,
                onChanged: (value) {
                  _selectedChoiceIndex = choiceIndex;
                  playerGameNotifier.selectChoice(choiceIndex);
                },
              ),
            );
          }),
      ],
    );
  }

  // ...
}
