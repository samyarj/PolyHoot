import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/UI/play/widgets/game-qr-code-dialog.dart';
import 'package:client_leger/UI/play/widgets/leave_game_button.dart';
import 'package:client_leger/UI/play/widgets/player_info.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/providers/play/waiting_page_provider.dart';
import 'package:client_leger/utilities/confirmation_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:toastification/toastification.dart';

class WaitingPage extends ConsumerWidget {
  WaitingPage({super.key});
  final socketManager = WebSocketManager.instance;

  void requestLeaveWaitingPage(BuildContext context, WidgetRef ref) async {
    final shouldExit = await showExitConfirmationDialog(context);
    if (!context.mounted) return;
    if (shouldExit) {
      ref.read(waitingPageProvider.notifier).confirmLeaveWaitingPage();
      _leavePage(context);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final waitingState = ref.watch(waitingPageProvider);
    final colorScheme = Theme.of(context).colorScheme;
    final canStartGame = socketManager.isOrganizer &&
        waitingState.gameLocked &&
        waitingState.playersInfo.isNotEmpty;

    ref.listen(waitingPageProvider, (previous, next) {
      if (next.banned) {
        _showToast(context, "Vous avez été banni de la salle d'attente !");
        _leavePage(context);
      } else if (next.organizerDisconnected && !socketManager.isOrganizer) {
        _showToast(context, "L'organisateur a quitté la salle d'attente !");
        _leavePage(context);
      } else if (next.timerEnded) {
        final route =
            socketManager.isOrganizer ? Paths.organizerVue : Paths.playerVue;
        GoRouter.of(context).go('/play/$route');
      }
    });

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          requestLeaveWaitingPage(context, ref);
        }
      },
      child: Scaffold(
        resizeToAvoidBottomInset: true,
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                colorScheme.primary,
                colorScheme.primary.withValues(alpha: 0.4),
                colorScheme.secondary,
              ],
            ),
          ),
          width: double.infinity,
          height: double.infinity,
          child: SafeArea(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  const SizedBox(height: 25),

                  // Room Code at the top (if organizer)
                  // Inside the WaitingPage build method where the room ID is displayed
// Replace the existing Room Code container with this:

                  if (socketManager.isOrganizer &&
                      waitingState.gameTitle.isEmpty)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 6),
                          decoration: BoxDecoration(
                            color: colorScheme.primary.withValues(alpha: 0.8),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color:
                                  colorScheme.tertiary.withValues(alpha: 0.5),
                              width: 2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color:
                                    colorScheme.tertiary.withValues(alpha: 0.5),
                                blurRadius: 6,
                                spreadRadius: 1,
                                offset: Offset(0, 1),
                              ),
                            ],
                          ),
                          child: Text(
                            socketManager.roomId ?? "0000",
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: colorScheme.onPrimary,
                              letterSpacing: 4,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: () {
                            showDialog(
                              context: context,
                              builder: (context) => GameQRCodeDialog(
                                roomId: socketManager.roomId ?? "0000",
                                gameTitle:
                                    "Salle de ${socketManager.playerName}",
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: colorScheme.primary.withValues(alpha: 0.8),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color:
                                    colorScheme.tertiary.withValues(alpha: 0.5),
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: colorScheme.tertiary
                                      .withValues(alpha: 0.5),
                                  blurRadius: 6,
                                  spreadRadius: 1,
                                  offset: Offset(0, 1),
                                ),
                              ],
                            ),
                            child: Icon(
                              Icons.qr_code,
                              color: colorScheme.onPrimary,
                              size: 24,
                            ),
                          ),
                        ),
                      ],
                    ),

                  const SizedBox(height: 10),

                  // Players counter as animated title
                  const AnimatedTitleWidget(
                    title: "JOUEURS",
                    fontSize: 40,
                  ),

                  const SizedBox(height: 20),

                  // Player List Container - Changed from Expanded to fixed-height Container
                  Container(
                    width: MediaQuery.of(context).size.width * 0.55,
                    height: 250,
                    constraints: const BoxConstraints(maxHeight: 350),
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: colorScheme.primary.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                          color: colorScheme.tertiary.withValues(alpha: 0.7),
                          width: 3),
                    ),
                    child: waitingState.gameTitle.isNotEmpty
                        ? Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                waitingState.gameTitle.isNotEmpty
                                    ? waitingState.gameTitle
                                    : "Chargement...",
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.onPrimary,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 20),
                              Text(
                                waitingState.time != null
                                    ? "Temps restant: ${waitingState.time} sec"
                                    : "Préparation...",
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.tertiary,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          )
                        : waitingState.playersInfo.isEmpty
                            ? Center(
                                child: Text(
                                  "Invitez vos amis à rejoindre la partie !",
                                  style: TextStyle(
                                    fontSize: 18,
                                    color: colorScheme.onPrimary,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 18, horizontal: 50),
                                itemCount: waitingState.playersInfo.length,
                                itemBuilder: (context, index) {
                                  final player =
                                      waitingState.playersInfo[index];
                                  final isOrganizer =
                                      WebSocketManager.instance.isOrganizer;

                                  return PlayerInfoWidget(
                                    player: player,
                                    isOrganizer: isOrganizer,
                                  );
                                },
                              ),
                  ),

                  const SizedBox(height: 20),

                  Column(
                    children: [
                      Center(
                        child: Container(
                          width: MediaQuery.of(context).size.width * 0.40,
                          margin: const EdgeInsets.symmetric(vertical: 5),
                          padding: const EdgeInsets.symmetric(
                              vertical: 16, horizontal: 10),
                          decoration: BoxDecoration(
                            color: colorScheme.primary.withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                                color:
                                    colorScheme.tertiary.withValues(alpha: 0.7),
                                width: 3),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Lock status text first
                              if (socketManager.isOrganizer)
                                Text(
                                  waitingState.gameLocked
                                      ? "La partie est verrouillée"
                                      : "Il faut verrouiller la partie et avoir au moins 1 joueur pour commencer",
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: colorScheme.onPrimary,
                                  ),
                                  textAlign: TextAlign.center,
                                )
                              else
                                Text(
                                  waitingState.gameLocked
                                      ? "La partie est verrouillée"
                                      : "En attente de l'organisateur pour démarrer la partie",
                                  style: TextStyle(
                                    fontSize: 18,
                                    color: colorScheme.onPrimary,
                                  ),
                                  textAlign: TextAlign.center,
                                ),

                              const SizedBox(height: 16),
                              if (socketManager.isOrganizer &&
                                  waitingState.gameTitle.isEmpty)
                                // Toggle lock and start button in a row
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    // Start game button

                                    ElevatedButton(
                                      onPressed: canStartGame
                                          ? () {
                                              ref
                                                  .read(waitingPageProvider
                                                      .notifier)
                                                  .startGameCountdown(5);
                                            }
                                          : null,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: colorScheme.primary
                                            .withValues(alpha: 0.9),
                                        foregroundColor: colorScheme.onPrimary,
                                        disabledBackgroundColor: colorScheme
                                            .primary
                                            .withValues(alpha: 0.4),
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 12, horizontal: 16),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(40),
                                          side: canStartGame
                                              ? BorderSide(
                                                  color: colorScheme.tertiary,
                                                  width: 2,
                                                )
                                              : BorderSide.none,
                                        ),
                                      ),
                                      child: Text(
                                        "Commencer la partie",
                                        style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: canStartGame
                                                ? colorScheme.onPrimary
                                                : colorScheme.onPrimary
                                                    .withValues(alpha: 0.6)),
                                      ),
                                    ),
                                    const SizedBox(width: 12),

                                    // Toggle lock icon
                                    GestureDetector(
                                      onTap: () {
                                        ref
                                            .read(waitingPageProvider.notifier)
                                            .toggleGameLock();
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: colorScheme.primary
                                              .withValues(alpha: 0.9),
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: colorScheme.tertiary,
                                            width: 2,
                                          ),
                                        ),
                                        child: Icon(
                                          waitingState.gameLocked
                                              ? Icons.lock
                                              : Icons.lock_open,
                                          size: 22,
                                          color: colorScheme.onPrimary,
                                        ),
                                      ),
                                    )
                                  ],
                                ),
                            ],
                          ),
                        ),
                      ),

                      // Quit button in an Align to position it at the right
                      LeaveGameButton(
                        text: "Quitter",
                        onPressed: () {
                          requestLeaveWaitingPage(context, ref);
                        },
                        alignRight: true,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
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
      autoCloseDuration: const Duration(seconds: 3),
      alignment: Alignment.topCenter,
      style: ToastificationStyle.flatColored,
      showIcon: true,
    );
  }

  void _leavePage(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final route =
          socketManager.isOrganizer ? '/play' : '/play/${Paths.joinGame}';
      GoRouter.of(context).go(route);
      WebSocketManager.instance.isPlaying = false;
    });
  }
}
