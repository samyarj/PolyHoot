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

    ref.listen(waitingPageProvider, (previous, next) {
      if (next.banned) {
        _showToast(context, "Vous avez été banni !");
        _leavePage(context);
      } else if (next.organizerDisconnected && !socketManager.isOrganizer) {
        _showToast(context, "L'organisateur a quitté la partie !");
        _leavePage(context);
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
        body: Column(
          children: [
            const SizedBox(height: 20),
            Text(
              "Salle d'attente",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Expanded(
              child: Center(
                child: waitingState.gameTitle.isNotEmpty
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            waitingState.gameTitle.isNotEmpty
                                ? waitingState.gameTitle
                                : "Chargement...",
                            style: TextStyle(
                                fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            waitingState.time != null
                                ? "Temps restant: ${waitingState.time} sec"
                                : "Préparation...",
                            style: TextStyle(fontSize: 30, color: Colors.red),
                          ),
                        ],
                      )
                    : Column(
                        children: [
                          if (socketManager.isOrganizer)
                            Container(
                              padding: EdgeInsets.all(10),
                              margin: EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: Colors.amber.shade100,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Column(
                                children: [
                                  Text("Code de la salle",
                                      style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold)),
                                  Text(socketManager.roomId ?? "Chargement...",
                                      style: TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.black)),
                                ],
                              ),
                            ),
                          Text(
                            "Joueurs dans la salle : ${waitingState.players.length}",
                            style: TextStyle(fontSize: 20),
                          ),
                          const SizedBox(height: 10),
                          Expanded(
                            child: waitingState.players.isEmpty
                                ? Center(
                                    child: Text(
                                        "Invitez vos amis à rejoindre la partie !",
                                        style: TextStyle(fontSize: 16)))
                                : ListView.builder(
                                    itemCount: waitingState.players.length,
                                    itemBuilder: (context, index) {
                                      final player =
                                          waitingState.players[index];
                                      return ListTile(
                                        leading: Icon(Icons.person,
                                            color: player == "Organisateur"
                                                ? Colors.green
                                                : Colors.blue),
                                        title: Text(player),
                                        trailing: socketManager.isOrganizer &&
                                                player != "Organisateur"
                                            ? IconButton(
                                                icon: Icon(Icons.block,
                                                    color: Colors.red),
                                                onPressed: () {
                                                  ref
                                                      .read(waitingPageProvider
                                                          .notifier)
                                                      .banPlayer(player);
                                                },
                                              )
                                            : null,
                                      );
                                    },
                                  ),
                          ),
                          if (socketManager.isOrganizer)
                            Column(
                              children: [
                                Icon(
                                    socketManager.isOrganizer &&
                                            waitingState.gameLocked
                                        ? Icons.lock
                                        : Icons.lock_open,
                                    size: 30),
                                ElevatedButton(
                                  onPressed: () {
                                    ref
                                        .read(waitingPageProvider.notifier)
                                        .toggleGameLock();
                                  },
                                  child: Text(waitingState.gameLocked
                                      ? "Déverrouiller"
                                      : "Verrouiller"),
                                ),
                                Text(
                                  waitingState.gameLocked
                                      ? (waitingState.players.length >= 1
                                          ? "Vous pouvez commencer!"
                                          : "Il faut au moins un joueur pour commencer!")
                                      : "Il faut verrouiller la partie pour commencer!",
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold),
                                ),
                                ElevatedButton(
                                  onPressed: waitingState.players.isEmpty ||
                                          !waitingState.gameLocked
                                      ? null
                                      : () {
                                          ref
                                              .read(
                                                  waitingPageProvider.notifier)
                                              .startGameCountdown(5);
                                        },
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.green),
                                  child: Text("Commencer la partie"),
                                ),
                              ],
                            ),
                          if (!socketManager.isOrganizer)
                            Column(
                              children: [
                                Text(
                                  waitingState.gameLocked
                                      ? "L'organisateur est prêt à démarrer la partie!"
                                      : "Veuillez attendre que l'organisateur démarre la partie.",
                                  style: TextStyle(fontSize: 16),
                                ),
                              ],
                            ),
                          ElevatedButton(
                            onPressed: () {
                              requestLeaveWaitingPage(context, ref);
                            },
                            style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red),
                            child: Text("Quitter"),
                          ),
                        ],
                      ),
              ),
            ),
          ],
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
      //backgroundColor: Colors.red,
      style: ToastificationStyle.flatColored,
      showIcon: true,
    );
  }

  void _leavePage(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      GoRouter.of(context).pop();
    });
  }
}
