import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/providers/play/join_game_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class JoinGame extends ConsumerStatefulWidget {
  const JoinGame({super.key});

  @override
  ConsumerState<JoinGame> createState() => _JoinGameState();
}

class _JoinGameState extends ConsumerState<JoinGame> {
  final TextEditingController _roomIdController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  @override
  void dispose() {
    _roomIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final joinState = ref.watch(joinGameProvider);
    final joinNotifier = ref.read(joinGameProvider.notifier);
    final colorScheme = Theme.of(context).colorScheme;
    ref.listen(joinGameProvider, (previous, next) {
      if (next.isJoined) {
        Future.delayed(const Duration(milliseconds: 200), () {});
        ref.read(joinGameProvider.notifier).resetAttributes();
        WidgetsBinding.instance.addPostFrameCallback((_) {
          GoRouter.of(context).go('${Paths.play}/${Paths.waitingPage}');
        });
      }
    });

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            height: 250,
            child: joinState.lobbys.isEmpty
                ? Center(
                    child: Text("Aucun canal disponible",
                        style: TextStyle(color: colorScheme.onSurface)))
                : ListView.builder(
                    itemCount: joinState.lobbys.length,
                    itemBuilder: (context, index) {
                      final lobby = joinState.lobbys[index];
                      return Card(
                        color: colorScheme.secondaryContainer,
                        child: ListTile(
                          title: Text(
                            lobby.title,
                            style: TextStyle(
                                color: colorScheme.onSecondaryContainer),
                          ),
                          trailing: IconButton(
                            icon: Icon(Icons.add_circle,
                                color: colorScheme.primary),
                            onPressed: () =>
                                joinNotifier.validGameId(lobby.roomId),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          const SizedBox(height: 10),
          Form(
            key: _formKey,
            child: TextFormField(
              controller: _roomIdController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              validator: (value) {
                if (value == null || value.length != 4) {
                  return "Le code doit contenir exactement 4 chiffres";
                }
                return null;
              },
              decoration: InputDecoration(
                hintText: "Entrez le code de la salle",
                filled: true,
                fillColor: colorScheme.primary,
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                suffixIcon: IconButton(
                  icon: Icon(Icons.close, color: colorScheme.onSurface),
                  onPressed: () => _roomIdController.clear(),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          ElevatedButton(
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                joinNotifier.validGameId(_roomIdController.text);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: colorScheme.primary,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
            child: Text("Rejoindre la salle",
                style: TextStyle(color: colorScheme.onPrimary)),
          ),
          if (joinState.popUpMessage.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                joinState.popUpMessage,
                style: TextStyle(
                    color: colorScheme.error, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
    );
  }
}
