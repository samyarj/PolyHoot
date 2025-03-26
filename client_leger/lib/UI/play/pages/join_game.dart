import 'dart:ui';

import 'package:client_leger/UI/global/header_title.dart';
import 'package:client_leger/UI/play/widgets/game_creation_popup.dart';
import 'package:client_leger/UI/router/routes.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/providers/play/join_game_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:toastification/toastification.dart';

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
        WidgetsBinding.instance.addPostFrameCallback((_) {
          WebSocketManager.instance.isPlaying = true;
          GoRouter.of(context).go('${Paths.play}/${Paths.waitingPage}');
        });
      }

      // Show toast for error message if it exists
      if (next.popUpMessage.isNotEmpty &&
          (previous == null || previous.popUpMessage != next.popUpMessage)) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showToast(context, next.popUpMessage);
        });
      }
    });

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Container(
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
          ),
          Positioned.fill(
            child: IgnorePointer(
              child: Center(
                child: Transform.translate(
                  offset: const Offset(0, -40),
                  child: SizedBox(
                    height: MediaQuery.of(context).size.height * 0.35,
                    child: ImageFiltered(
                      imageFilter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: Image.asset(
                        'assets/logo.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Animated Title
                    const AnimatedTitleWidget(
                      title: 'SALONS',
                      fontSize: 48,
                    ),

                    const SizedBox(height: 30),

                    // Lobbies List
                    Container(
                      width: MediaQuery.of(context).size.width *
                          0.50, // Game list container width
                      decoration: BoxDecoration(
                        color: colorScheme.surface.withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: colorScheme.secondary.withValues(alpha: 0.3),
                            spreadRadius: 2,
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: SizedBox(
                        height: 350,
                        child: joinState.lobbys.isEmpty
                            ? Center(
                                child: Text(
                                  "Aucun salon disponible",
                                  style: TextStyle(
                                    color: colorScheme.onSurface,
                                    fontSize: 18,
                                  ),
                                ),
                              )
                            : ListView.builder(
                                itemCount: joinState.lobbys.length,
                                itemBuilder: (context, index) {
                                  final lobby = joinState.lobbys[index];
                                  return Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 15),
                                    child: Align(
                                      child: SizedBox(
                                        width:
                                            MediaQuery.of(context).size.width *
                                                0.42,
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color: colorScheme.secondary
                                                .withValues(alpha: 0.5),
                                            borderRadius:
                                                BorderRadius.circular(25),
                                          ),
                                          padding: const EdgeInsets.symmetric(
                                              vertical: 10, horizontal: 15),
                                          child: Column(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Padding(
                                                padding:
                                                    const EdgeInsets.all(8.0),
                                                child: Row(
                                                  children: [
                                                    Expanded(
                                                      child: Text(
                                                        lobby.title,
                                                        style: TextStyle(
                                                          color: colorScheme
                                                              .onPrimary,
                                                          fontSize: 18,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                      ),
                                                    ),
                                                    Row(
                                                      children: [
                                                        Row(
                                                          children: [
                                                            Icon(Icons.people,
                                                                color: colorScheme
                                                                    .onPrimary),
                                                            SizedBox(width: 4),
                                                            Text(
                                                              '${lobby.nbPlayers}',
                                                              style: TextStyle(
                                                                color: colorScheme
                                                                    .onPrimary,
                                                                fontSize: 16,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                        const SizedBox(
                                                            width: 10),
                                                        Container(
                                                          height: 20,
                                                          width: 2,
                                                          color: colorScheme
                                                              .onPrimary
                                                              .withValues(
                                                                  alpha: 0.5),
                                                        ), // Divider
                                                        const SizedBox(
                                                            width: 10),

                                                        GestureDetector(
                                                          onTap: () {
                                                            final quiz = joinNotifier
                                                                .getQuizByTitle(
                                                                    lobby
                                                                        .title);
                                                            AppLogger.i(
                                                                "Showing quiz: ${quiz.title}");
                                                            GameCreationPopup.show(
                                                                context, quiz,
                                                                forCreation:
                                                                    false,
                                                                questionListHeight:
                                                                    280);
                                                          },
                                                          child: Icon(
                                                            Icons.description,
                                                            color: colorScheme
                                                                .onPrimary,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              ElevatedButton(
                                                onPressed: lobby.isLocked
                                                    ? null
                                                    : () {
                                                        joinNotifier
                                                            .validGameId(
                                                                lobby.roomId);
                                                      },
                                                style: ElevatedButton.styleFrom(
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      vertical: 10,
                                                      horizontal: 60),
                                                  backgroundColor:
                                                      colorScheme.primary,
                                                  disabledBackgroundColor:
                                                      colorScheme.primary
                                                          .withValues(
                                                              alpha: 0.75),
                                                  foregroundColor:
                                                      colorScheme.onPrimary,
                                                  disabledForegroundColor:
                                                      colorScheme.onPrimary
                                                          .withValues(
                                                              alpha: 0.75),
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius:
                                                        const BorderRadius.all(
                                                            Radius.circular(
                                                                40)),
                                                    side: lobby.isLocked
                                                        ? BorderSide.none
                                                        : BorderSide(
                                                            color: colorScheme
                                                                .tertiary
                                                                .withValues(
                                                                    alpha: 0.8),
                                                            width: 2.5,
                                                          ),
                                                  ),
                                                ),
                                                child: Row(
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  children: [
                                                    Text(
                                                      lobby.isLocked
                                                          ? 'Verrouillé'
                                                          : 'Joindre',
                                                      style: TextStyle(
                                                        color: lobby.isLocked
                                                            ? colorScheme
                                                                .onPrimary
                                                                .withValues(
                                                                    alpha: 0.75)
                                                            : colorScheme
                                                                .onPrimary,
                                                        fontSize: 16,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                      ),
                                                    ),
                                                    const SizedBox(width: 16),
                                                    Icon(
                                                      lobby.isLocked
                                                          ? Icons.lock
                                                          : Icons.lock_open,
                                                      color: lobby.isLocked
                                                          ? colorScheme
                                                              .onPrimary
                                                              .withValues(
                                                                  alpha: 0.75)
                                                          : colorScheme
                                                              .onPrimary,
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Room Code Input
                    Container(
                      width: MediaQuery.of(context).size.width * 0.33,
                      decoration: BoxDecoration(
                        color: colorScheme.surface.withValues(alpha: 0.7),
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(
                          color: colorScheme.onPrimary.withValues(alpha: 0.3),
                          width: 2,
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(
                          vertical: 15, horizontal: 25),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  "Code d'accès:",
                                  style: TextStyle(
                                    color: colorScheme.onPrimary,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(width: 15),
                                Expanded(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: colorScheme.primary,
                                      borderRadius: BorderRadius.circular(40),
                                      border: Border.all(
                                        color: colorScheme.tertiary,
                                        width: 2,
                                      ),
                                    ),
                                    child: TextFormField(
                                      controller: _roomIdController,
                                      keyboardType: TextInputType.number,
                                      maxLength: 4,
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        color: colorScheme.onPrimary,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      decoration: InputDecoration(
                                        hintText: "0000",
                                        hintStyle: TextStyle(
                                          color: colorScheme.onPrimary
                                              .withValues(alpha: 0.5),
                                        ),
                                        counterText: "",
                                        filled: false,
                                        contentPadding:
                                            EdgeInsets.symmetric(vertical: 10),
                                        border: InputBorder.none,
                                      ),
                                      validator: (value) {
                                        if (value == null ||
                                            value.length != 4) {
                                          return null; // We'll show the error message separately
                                        }
                                        return null;
                                      },
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 15),
                                ElevatedButton(
                                  onPressed: () {
                                    final isValid =
                                        _formKey.currentState?.validate() ??
                                            false;
                                    if (_roomIdController.text.length != 4) {
                                      _showToast(context,
                                          "Le code doit comporter 4 chiffres.");
                                      return;
                                    }
                                    joinNotifier
                                        .validGameId(_roomIdController.text);
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: colorScheme.primary,
                                    foregroundColor: colorScheme.onPrimary,
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 12, horizontal: 20),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(40),
                                      side: BorderSide(
                                        color: colorScheme.tertiary,
                                        width: 2,
                                      ),
                                    ),
                                  ),
                                  child: Text(
                                    "Joindre",
                                    style: TextStyle(
                                      color: colorScheme.onPrimary,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 18),
                            Center(
                              child: Text(
                                "Le code d'accès doit comporter 4 chiffres.",
                                style: TextStyle(
                                  color: colorScheme.tertiary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showToast(BuildContext context, String message) {
    toastification.show(
      context: context,
      title: Text(message),
      type: ToastificationType.error,
      autoCloseDuration: const Duration(seconds: 3),
      alignment: Alignment.topCenter,
      style: ToastificationStyle.flatColored,
      showIcon: true,
    );
  }
}
