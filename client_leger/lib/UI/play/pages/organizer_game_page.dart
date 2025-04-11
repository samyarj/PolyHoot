import 'package:client_leger/UI/play/widgets/game_area.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/providers/play/game_organizer_provider.dart';
import 'package:client_leger/utilities/confirmation_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:toastification/toastification.dart';

class OrganizerGamePage extends ConsumerWidget {
  const OrganizerGamePage({super.key});

  void requestAbandonGame(BuildContext context, WidgetRef ref) async {
    final shouldAbandon = await showExitConfirmationDialog(context);
    if (!context.mounted) return;
    if (shouldAbandon) {
      ref.read(organizerProvider.notifier).abandonGame();
      WebSocketManager().isPlaying = false;
      context.go(Paths.play);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(organizerProvider.notifier);
    final colorScheme = Theme.of(context).colorScheme;

    ref.listen(organizerProvider, (previous, next) {
      if (next.shouldNavigateToResults) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          final resultPlayerList = notifier.getResultPlayerList();
          WebSocketManager().isPlaying = false;
          context.go('${Paths.play}/${Paths.resultsView}',
              extra: resultPlayerList);
        });
      } else if (next.allPlayersLeft) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showToast(context, 'Tous les joueurs ont quitté la partie');
          context.go(Paths.play);
          WebSocketManager().isPlaying = false;
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
        body: Container(
          height: MediaQuery.of(context).size.height,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                colorScheme.primary,
                colorScheme.primary,
                colorScheme.secondary,
              ],
            ),
          ),
          child: SafeArea(child: ImprovedGameArea()),
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
