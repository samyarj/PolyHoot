import 'package:client_leger/UI/global/header_title.dart';
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
        waitingState.players.isNotEmpty;

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
        resizeToAvoidBottomInset: false,
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
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                const SizedBox(height: 25),

                // Room Code at the top (if organizer)
                if (socketManager.isOrganizer && waitingState.gameTitle.isEmpty)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
                    decoration: BoxDecoration(
                      color: colorScheme.primary.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: colorScheme.tertiary.withValues(alpha: 0.5),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: colorScheme.tertiary.withValues(alpha: 0.5),
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

                const SizedBox(height: 10),

                // Players counter as animated title
                const AnimatedTitleWidget(
                  title: "JOUEURS",
                  fontSize: 40,
                ),

                const SizedBox(height: 20),

                // Player List Container
                Expanded(
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.55,
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
                        : waitingState.players.isEmpty
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
                                itemCount: waitingState.players.length,
                                itemBuilder: (context, index) {
                                  final player = waitingState.players[index];
                                  return Padding(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 6, horizontal: 20),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 22, vertical: 8),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            colorScheme.secondary
                                                .withValues(alpha: 0.6),
                                            colorScheme.secondary
                                                .withValues(alpha: 0.3),
                                            colorScheme.primary
                                                .withValues(alpha: 0.6),
                                            colorScheme.primary,
                                            colorScheme.primary,
                                            colorScheme.primary
                                                .withValues(alpha: 0.6),
                                            colorScheme.secondary
                                                .withValues(alpha: 0.3),
                                            colorScheme.secondary
                                                .withValues(alpha: 0.6),
                                          ],
                                          begin: Alignment.centerLeft,
                                          end: Alignment.centerRight,
                                        ),
                                        borderRadius: BorderRadius.circular(35),
                                        border: Border.all(
                                          color: colorScheme.tertiary,
                                          width: 2,
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          // Avatar
                                          CircleAvatar(
                                            backgroundImage: const AssetImage(
                                                'assets/default-avatar.png'),
                                            backgroundColor:
                                                colorScheme.secondary,
                                            radius: 18,
                                          ),

                                          // Username text
                                          Text(
                                            player,
                                            style: TextStyle(
                                              fontSize: 20,
                                              fontWeight: FontWeight.bold,
                                              color: colorScheme.onPrimary,
                                            ),
                                          ),

                                          // Ban button (conditionally shown)
                                          socketManager.isOrganizer &&
                                                  player != "Organisateur"
                                              ? ElevatedButton(
                                                  onPressed: () {
                                                    ref
                                                        .read(
                                                            waitingPageProvider
                                                                .notifier)
                                                        .banPlayer(player);
                                                  },
                                                  style:
                                                      ElevatedButton.styleFrom(
                                                    backgroundColor: colorScheme
                                                        .primary
                                                        .withValues(alpha: 0.8),
                                                    foregroundColor:
                                                        colorScheme.onPrimary,
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 20,
                                                        vertical: 12),
                                                    shape:
                                                        RoundedRectangleBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              25),
                                                      side: BorderSide(
                                                        color: colorScheme
                                                            .tertiary,
                                                        width: 2,
                                                      ),
                                                    ),
                                                  ),
                                                  child: const Text(
                                                    "Exclure",
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                    ),
                                                  ),
                                                )
                                              : const SizedBox(
                                                  width:
                                                      80), // Empty space to maintain alignment when no button
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
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
                            Text(
                              waitingState.gameLocked
                                  ? "La partie est verrouillée"
                                  : "Il faut verrouiller la partie et avoir au moins 1 joueur pour commencer",
                              style: TextStyle(
                                fontSize: 14,
                                color: colorScheme.onPrimary,
                              ),
                              textAlign: TextAlign.center,
                            ),

                            const SizedBox(height: 16),

                            // Toggle lock and start button in a row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                // Start game button
                                if (socketManager.isOrganizer)
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
                                        borderRadius: BorderRadius.circular(40),
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
                                if (socketManager.isOrganizer)
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
                                else
                                  Container(
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
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Quit button in an Align to position it at the right
                    Align(
                      alignment: Alignment.centerRight,
                      child: Padding(
                        padding: const EdgeInsets.only(right: 30),
                        child: ElevatedButton(
                          onPressed: () {
                            requestLeaveWaitingPage(context, ref);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: colorScheme.primary.withValues(
                              alpha: 0.9,
                            ),
                            foregroundColor: colorScheme.onPrimary,
                            padding: const EdgeInsets.symmetric(
                                vertical: 15, horizontal: 20),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(40),
                              side: BorderSide(
                                color: colorScheme.tertiary,
                                width: 2,
                              ),
                            ),
                          ),
                          child: const Text(
                            "Quitter",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
              ],
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
    });
  }
}
