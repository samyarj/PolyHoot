import 'package:client_leger/UI/play/widgets/game_area.dart';
import 'package:client_leger/UI/play/widgets/title_bar.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:client_leger/utilities/confirmation_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:toastification/toastification.dart';

// Main Page Widget
class OrganizerGamePage extends ConsumerWidget {
  const OrganizerGamePage({super.key});

  void requestAbandonGame(BuildContext context, WidgetRef ref) async {
    final shouldAbandon = await showExitConfirmationDialog(context);
    if (!context.mounted) return;
    if (shouldAbandon) {
      ref.read(organizerProvider.notifier).abandonGame();
      context.go(Paths.play);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(organizerProvider.notifier);

    ref.listen(organizerProvider, (previous, next) {
      if (next.shouldNavigateToResults) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          final resultPlayerList = notifier.getResultPlayerList();
          context.go('${Paths.play}/${Paths.resultsView}',
              extra: resultPlayerList);
        });
      } else if (next.allPlayersLeft) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showToast(context, 'Tous les joueurs ont quitté la partie');
          context.go(Paths.play);
        });
      }
    });

    return PopScope(
      onPopInvokedWithResult: (didPop, result) async {
        if (!didPop) {
          requestAbandonGame(context, ref);
        }
      },
      canPop: false,
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              const TitleBar(),
              Expanded(
                child: GameArea(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showToast(BuildContext context, String message) {
    toastification.show(
      context: context,
      title: Text(message),
      type: ToastificationType.info,
      autoCloseDuration: Duration(seconds: 3),
      alignment: Alignment.topCenter,
      style: ToastificationStyle.flatColored,
      showIcon: true,
    );
  }
}
