import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/backend-communication-services/chat/ingame_chat_service.dart';
import 'package:client_leger/backend-communication-services/report/report_service.dart';
import 'package:client_leger/models/ingame_chat_messages.dart';
import 'package:client_leger/providers/messages/messages_notif_provider.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/helper_functions.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import 'package:toastification/toastification.dart';

class InGameChatWindow extends ConsumerStatefulWidget {
  const InGameChatWindow({super.key});

  @override
  ConsumerState<InGameChatWindow> createState() => _ChatWindowState();
}

class _ChatWindowState extends ConsumerState<InGameChatWindow> {
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final InGameChatService _inGameChatManager = InGameChatService();
  final ReportService _reportService = ReportService();
  late final MessageNotifNotifier _notifier;

  @override
  void initState() {
    _notifier = ref.read(messageNotifProvider.notifier);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _notifier.currentDisplayedChannel = inGameChat;

      _notifier.markChatAsRead(inGameChat);
    });
    super.initState();
  }

  String formatDate(DateTime date) {
    return DateFormat('HH:mm:ss')
        .format(date.toUtc().subtract(Duration(hours: 4))); // UTC-5
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

  _confirmReportPlayer(
      String? uid, String playerUsername, BuildContext context) async {
    await showConfirmationDialog(
      context,
      "Êtes-vous sûr de vouloir signaler le joueur $playerUsername ?",
      () => _reportPlayer(uid),
      null,
    );
  }

  _reportPlayer(String? uid) async {
    if (uid == null) {
      return;
    }
    final bool? isReported = await _reportService.reportPlayer(uid);
    if (isReported == null && mounted) {
      showToast(context, "Une erreur a eu lieu",
          type: ToastificationType.error);
    } else if (isReported! && mounted) {
      showToast(context,
          'Merci pour votre contribution à la bonne atmosphère du jeu. Le joueur est signalé.',
          type: ToastificationType.success);
    } else if (mounted) {
      showToast(context, 'Vous avez déjà signalé ce joueur.',
          type: ToastificationType.info);
    }
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
                                height: 425,
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
                                                                    alpha: 0.4),
                                                            colorScheme
                                                                .secondary
                                                                .withValues(
                                                                    alpha: 0.7),
                                                          ]
                                                        : [
                                                            colorScheme.surface
                                                                .withValues(
                                                                    alpha: 0.6),
                                                            colorScheme.surface,
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
                                                    Row(
                                                      mainAxisSize:
                                                          MainAxisSize.min,
                                                      children: [
                                                        SizedBox(
                                                          width: 50,
                                                          child:
                                                              AvatarBannerWidget(
                                                            avatarUrl:
                                                                message.avatar,
                                                            bannerUrl:
                                                                message.border,
                                                            size: 50,
                                                            avatarFit:
                                                                BoxFit.cover,
                                                          ),
                                                        ),
                                                        SizedBox(width: 8),
                                                        Expanded(
                                                          child: Text(
                                                            message.author,
                                                            style: TextStyle(
                                                                color: isUserMessage
                                                                    ? colorScheme
                                                                        .onSecondary
                                                                    : colorScheme
                                                                        .onSurface,
                                                                fontSize: 18,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold),
                                                            overflow: TextOverflow
                                                                .ellipsis, // Prevents text overflow
                                                            softWrap:
                                                                false, // Keeps text in one line
                                                          ),
                                                        ),
                                                        if (!isUserMessage)
                                                          IconButton(
                                                            icon: Icon(
                                                                FontAwesomeIcons
                                                                    .triangleExclamation,
                                                                color: colorScheme
                                                                    .onSecondary),
                                                            onPressed: () =>
                                                                _confirmReportPlayer(
                                                                    message.uid,
                                                                    message
                                                                        .author,
                                                                    context),
                                                          ),
                                                      ],
                                                    ),
                                                    SizedBox(height: 8),
                                                    Padding(
                                                      padding:
                                                          const EdgeInsets.only(
                                                              left: 8.0),
                                                      child: Text(
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
                              ValueListenableBuilder<List<String>>(
                                valueListenable:
                                    _inGameChatManager.quickRepliesNotifier,
                                builder: (context, quickReplies, _) {
                                  return Column(
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          if (quickReplies.isNotEmpty)
                                            Icon(
                                              Icons.chevron_left,
                                              color: colorScheme.secondary
                                                  .withAlpha(200),
                                            ),
                                          Container(
                                            width: 325,
                                            alignment: Alignment.center,
                                            child: SingleChildScrollView(
                                              scrollDirection: Axis.horizontal,
                                              child: Row(
                                                spacing: 8.0,
                                                children: [
                                                  for (final reply
                                                      in quickReplies)
                                                    ElevatedButton(
                                                      style: ButtonStyle(
                                                        padding:
                                                            WidgetStateProperty
                                                                .all(
                                                          EdgeInsets.symmetric(
                                                              horizontal: 16,
                                                              vertical: 8),
                                                        ),
                                                        backgroundColor:
                                                            WidgetStateProperty
                                                                .all(
                                                          Theme.of(context)
                                                              .colorScheme
                                                              .secondary
                                                              .withAlpha(
                                                                  200), // Background color
                                                        ),
                                                        shape:
                                                            WidgetStateProperty
                                                                .all(
                                                          RoundedRectangleBorder(
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        50), // Rounded corners
                                                            side: BorderSide(
                                                              color: colorScheme
                                                                  .onPrimary
                                                                  .withAlpha(
                                                                      200),
                                                              width: 3,
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                      onPressed: () {
                                                        _textController.text =
                                                            reply;
                                                        sendMessage();
                                                        _inGameChatManager
                                                            .requestQuickReplies();
                                                      },
                                                      child: Text(
                                                        reply,
                                                        style: TextStyle(
                                                            fontSize: 16,
                                                            color: Theme.of(
                                                                    context)
                                                                .colorScheme
                                                                .onTertiary),
                                                      ),
                                                    ),
                                                ],
                                              ),
                                            ),
                                          ),
                                          if (quickReplies.isNotEmpty)
                                            Icon(
                                              Icons.chevron_right,
                                              color: colorScheme.secondary
                                                  .withAlpha(200),
                                            ),
                                        ],
                                      ),
                                      quickReplies.isNotEmpty
                                          ? SizedBox(height: 8)
                                          : SizedBox(height: 56),
                                    ],
                                  );
                                },
                              ),
                              TapRegion(
                                onTapOutside: (_) =>
                                    FocusScope.of(context).unfocus(),
                                child: TextField(
                                  maxLength: 200,
                                  controller: _textController,
                                  focusNode: _focusNode,
                                  minLines: 1,
                                  maxLines: null,
                                  style:
                                      TextStyle(color: colorScheme.onSurface),
                                  decoration: InputDecoration(
                                    counterStyle:
                                        TextStyle(color: colorScheme.onPrimary),
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
