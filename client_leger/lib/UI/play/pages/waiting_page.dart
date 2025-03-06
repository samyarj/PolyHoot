import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/providers/waiting_page_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class WaitingPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final waitingState = ref.watch(waitingPageProvider);
    final socketManager = WebSocketManager.instance;

    leaveWaitingpage() {
      if (socketManager.isOrganizer) {
        ref.read(waitingPageProvider.notifier).leaveWaitingPageAsOrganizer();
      } else {
        ref.read(waitingPageProvider.notifier).leaveWaitingPageAsPlayer();
      }
      Navigator.pop(context);
    }

    return Scaffold(
      appBar: AppBar(title: Text("Salle d'attente")),
      body: Center(
        child: waitingState.gameTitle.isNotEmpty
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    waitingState.gameTitle.isNotEmpty
                        ? waitingState.gameTitle
                        : "Chargement...",
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
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
                                  fontSize: 18, fontWeight: FontWeight.bold)),
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
                              final player = waitingState.players[index];
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
                                              .read(
                                                  waitingPageProvider.notifier)
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
                            socketManager.isOrganizer && waitingState.gameLocked
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
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        ElevatedButton(
                          onPressed: waitingState.players.isEmpty ||
                                  !waitingState.gameLocked
                              ? null
                              : () {
                                  ref
                                      .read(waitingPageProvider.notifier)
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
                    onPressed: leaveWaitingpage,
                    style:
                        ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    child: Text("Quitter"),
                  ),
                  if (waitingState.banned)
                    Text("Vous avez été banni !",
                        style: TextStyle(
                            color: Colors.red, fontWeight: FontWeight.bold)),
                  if (waitingState.organizerDisconnected)
                    Text("L'organisateur a quitté la partie !",
                        style: TextStyle(
                            color: Colors.red, fontWeight: FontWeight.bold)),
                  if (waitingState.timerEnded)
                    Text("La partie va commencer !",
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
      ),
    );
  }
}
