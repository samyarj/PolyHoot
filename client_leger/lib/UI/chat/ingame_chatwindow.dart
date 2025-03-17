import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/backend-communication-services/chat/ingame_chat_service.dart';
import 'package:client_leger/models/ingame_chat_messages.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

class InGameChatWindow extends ConsumerStatefulWidget {
  const InGameChatWindow({super.key});

  @override
  ConsumerState<InGameChatWindow> createState() => _ChatWindowState();
}

class _ChatWindowState extends ConsumerState<InGameChatWindow> {
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final InGameChatService _inGameChatManager = InGameChatService();

  @override
  void initState() {
    _inGameChatManager
        .setUsernameAndInitialize(ref.read(userProvider).value!.username);
    super.initState();
  }

  String formatDate(DateTime date) {
    return DateFormat('HH:mm:ss')
        .format(date.toUtc().subtract(Duration(hours: 4))); // UTC-5
  }

  @override
  void dispose() {
    AppLogger.i("Disposing InGameChatWindow");
    _inGameChatManager.reset();
    super.dispose();
  }

  void sendMessage() {
    if (_textController.text.trim().isNotEmpty) {
      try {
        _inGameChatManager.sendMessageToRoom(_textController.text.trim());
      } catch (e) {
        if (!mounted) return;
        showErrorDialog(context, e.toString());
      }
    }
    _textController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.read(userProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
        backgroundColor: colorScheme.primary,
        resizeToAvoidBottomInset: true,
        body: userState.when(
            data: (user) {
              return SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Text("Partie",
                          style: TextStyle(
                              fontSize: 18,
                              color: colorScheme.onPrimary,
                              fontWeight: FontWeight.bold)),
                      Divider(
                          color: colorScheme.onPrimary.withValues(alpha: 0.5)),
                      Expanded(
                        child: SingleChildScrollView(
                          // sinon overflow on focus when keyboard appears
                          child: Column(
                            children: [
                              SizedBox(
                                height: 475,
                                child: ValueListenableBuilder<
                                    List<InGameChatMessage>>(
                                  valueListenable: _inGameChatManager
                                      .inGameChatMessagesNotifier,
                                  builder: (context, chatMessages, child) {
                                    return ListView.builder(
                                      reverse: true,
                                      itemCount: chatMessages.length,
                                      itemBuilder: (context, index) {
                                        final message = chatMessages[index];
                                        final isUserMessage = message.author ==
                                            _inGameChatManager.getAuthor();
                                        final isSystemMessage =
                                            message.author == 'System';
                                        if (isSystemMessage) {
                                          return Padding(
                                            padding: const EdgeInsets.all(8.0),
                                            child: Align(
                                              alignment: Alignment.center,
                                              child: LayoutBuilder(builder:
                                                  (context, constraints) {
                                                return Container(
                                                  constraints: BoxConstraints(
                                                      maxWidth:
                                                          constraints.maxWidth *
                                                              0.7),
                                                  padding: EdgeInsets.all(12),
                                                  decoration: BoxDecoration(
                                                    color: colorScheme
                                                        .primaryContainer,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            15),
                                                  ),
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        message.author,
                                                        style: TextStyle(
                                                            color: colorScheme
                                                                .onPrimaryContainer,
                                                            fontSize: 18,
                                                            fontWeight:
                                                                FontWeight
                                                                    .bold),
                                                      ),
                                                      Text(
                                                        message.message,
                                                        softWrap: true,
                                                        style: TextStyle(
                                                          color: colorScheme
                                                              .onPrimaryContainer,
                                                          fontSize: 18,
                                                          fontStyle:
                                                              FontStyle.italic,
                                                        ),
                                                      ),
                                                      Align(
                                                        alignment: Alignment
                                                            .bottomRight,
                                                        child: Text(
                                                          formatDate(
                                                              message.date!),
                                                          style: TextStyle(
                                                              color: colorScheme
                                                                  .onPrimaryContainer
                                                                  .withValues(
                                                                      alpha:
                                                                          0.7),
                                                              fontSize: 16),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                              }),
                                            ),
                                          );
                                        }
                                        return Padding(
                                          padding: const EdgeInsets.all(8.0),
                                          child: Align(
                                            alignment: isUserMessage
                                                ? Alignment.centerRight
                                                : Alignment.centerLeft,
                                            child: LayoutBuilder(builder:
                                                (context, constraints) {
                                              return Container(
                                                constraints: BoxConstraints(
                                                    maxWidth:
                                                        constraints.maxWidth *
                                                            0.7),
                                                padding: EdgeInsets.all(12),
                                                decoration: BoxDecoration(
                                                  gradient: LinearGradient(
                                                    colors: isUserMessage
                                                        ? [
                                                            colorScheme
                                                                .secondary
                                                                .withValues(
                                                                    alpha: 0.8),
                                                            colorScheme
                                                                .secondary
                                                          ]
                                                        : [
                                                            colorScheme.surface
                                                                .withValues(
                                                                    alpha: 0.8),
                                                            colorScheme.surface
                                                          ],
                                                    begin: Alignment.topLeft,
                                                    end: Alignment.bottomRight,
                                                  ),
                                                  borderRadius:
                                                      BorderRadius.only(
                                                    topLeft:
                                                        Radius.circular(15),
                                                    topRight:
                                                        Radius.circular(15),
                                                    bottomLeft: isUserMessage
                                                        ? Radius.circular(15)
                                                        : Radius.circular(0),
                                                    bottomRight: isUserMessage
                                                        ? Radius.circular(0)
                                                        : Radius.circular(15),
                                                  ),
                                                  boxShadow: [
                                                    BoxShadow(
                                                        color: Colors.black
                                                            .withValues(
                                                                alpha: 0.2),
                                                        spreadRadius: 2,
                                                        blurRadius: 6),
                                                  ],
                                                ),
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      message.author,
                                                      style: TextStyle(
                                                          color: isUserMessage
                                                              ? colorScheme
                                                                  .onSecondary
                                                              : colorScheme
                                                                  .onSurface,
                                                          fontSize: 18,
                                                          fontWeight:
                                                              FontWeight.bold),
                                                    ),
                                                    Text(
                                                      message.message,
                                                      softWrap: true,
                                                      style: TextStyle(
                                                          color: isUserMessage
                                                              ? colorScheme
                                                                  .onSecondary
                                                              : colorScheme
                                                                  .onSurface,
                                                          fontSize: 18),
                                                    ),
                                                    Align(
                                                      alignment:
                                                          Alignment.bottomRight,
                                                      child: Text(
                                                        formatDate(
                                                            message.date!),
                                                        style: TextStyle(
                                                            color: (isUserMessage
                                                                    ? colorScheme
                                                                        .onSecondary
                                                                    : colorScheme
                                                                        .onSurface)
                                                                .withValues(
                                                                    alpha: 0.7),
                                                            fontSize: 16),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              );
                                            }),
                                          ),
                                        );
                                      },
                                    );
                                  },
                                ),
                              ),
                              TapRegion(
                                onTapOutside: (_) =>
                                    FocusScope.of(context).unfocus(),
                                child: TextField(
                                  controller: _textController,
                                  focusNode: _focusNode,
                                  minLines: 1,
                                  maxLines: null,
                                  style:
                                      TextStyle(color: colorScheme.onSurface),
                                  decoration: InputDecoration(
                                    hintText: 'Écrivez un message...',
                                    filled: true,
                                    fillColor: colorScheme.surface,
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(20),
                                      borderSide: BorderSide.none,
                                    ),
                                    suffixIcon: IconButton(
                                      icon: Icon(Icons.send,
                                          color: colorScheme.secondary),
                                      onPressed: () => sendMessage(),
                                    ),
                                    hintStyle: TextStyle(
                                      color: colorScheme.onPrimary
                                          .withValues(alpha: 0.7),
                                    ),
                                  ),
                                  textInputAction: TextInputAction.send,
                                  onEditingComplete: sendMessage,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
            loading: () => Center(child: ThemedProgressIndicator()),
            error: (error, stack) => Center(child: Text('Error: $error'))));
  }
}
