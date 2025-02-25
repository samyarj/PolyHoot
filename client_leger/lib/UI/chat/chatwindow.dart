import 'dart:async';

import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/models/chat_message.dart';
import 'package:client_leger/backend-communication-services/models/user.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ChatWindow extends StatefulWidget {
  const ChatWindow({super.key, required this.channel});
  final String channel;

  @override
  State<ChatWindow> createState() => _ChatWindowState();
}

class _ChatWindowState extends State<ChatWindow> {
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  late ChannelManager _channelManager;
  late Future<User> _user;
  late int? lastMessageDate; // Track last message date for pagination
  List<ChatMessage> _allMessagesDisplayed = [];
  bool isLoadingInitialMessages = true;
  StreamSubscription<List<ChatMessage>>? _messagesSubscription;
  bool _isSending = false;

  @override
  void initState() {
    _channelManager = ChannelManager();
    _user = auth_service.currentSignedInUser;

    _subscribeToMessages();

    super.initState();
  }

  void _subscribeToMessages() {
    try {
      _messagesSubscription = _channelManager
          .getMessagesForChannel(widget.channel)
          .listen((newMessages) {
        setState(() {
          _allMessagesDisplayed = [...newMessages, ..._allMessagesDisplayed];
          isLoadingInitialMessages = false;
        });
        if (_allMessagesDisplayed.isNotEmpty) {
          lastMessageDate =
              _allMessagesDisplayed.last.date.millisecondsSinceEpoch;
        }
      }, onError: (error) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          showErrorDialog(context, getCustomError(error));
        });
      });
    } catch (e) {
      // if the exception is not thrown in the stream
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showErrorDialog(context, e.toString());
      });
    }
  }

  Future<void> _onRefresh() async {
    if (lastMessageDate != null) {
      try {
        final oneFetch = await _channelManager.loadOlderMessages(
            widget.channel, lastMessageDate!);

        if (oneFetch.isNotEmpty) {
          lastMessageDate = oneFetch.last.date.millisecondsSinceEpoch;

          setState(() {
            _allMessagesDisplayed = [..._allMessagesDisplayed, ...oneFetch];
          });
        }
      } catch (e) {
        if (!mounted) return;
        showErrorDialog(context, e.toString());
      }
    }
  }

  @override
  void dispose() {
    _textController.dispose();
    _messagesSubscription?.cancel();
    super.dispose();
  }

  void sendMessage() async {
    if (_textController.text.trim().isNotEmpty && !_isSending) {
      try {
        _isSending = true;
        await _channelManager.sendMessage(widget.channel, _textController.text);
      } catch (e) {
        if (!mounted) return;
        showErrorDialog(context, e.toString());
      }
    }
    _textController.clear();
    _isSending = false;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: FutureBuilder<User?>(
        future: _user,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return Center(child: CircularProgressIndicator());
          }
          final user = snapshot.data;
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Text(widget.channel, style: TextStyle(fontSize: 18)),
                  Divider(),
                  Expanded(
                    child: SingleChildScrollView(
                      // sinon overflow on focus when keyboard appears
                      child: Column(
                        children: [
                          SizedBox(
                            height: 500,
                            child: isLoadingInitialMessages
                                ? Center(child: CircularProgressIndicator())
                                : RefreshIndicator(
                                    onRefresh: _onRefresh,
                                    child: ListView.builder(
                                      reverse: true,
                                      itemCount: _allMessagesDisplayed.length,
                                      itemBuilder: (context, index) {
                                        final message =
                                            _allMessagesDisplayed[index];
                                        final isUserMessage =
                                            message.uid == user!.uid;
                                        final isSystemMessage =
                                            message.username == 'System';
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
                                                    color: Color(0xFF4F5487),
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
                                                        message.username!,
                                                        style: TextStyle(
                                                            color: Colors.white,
                                                            fontSize: 18,
                                                            fontWeight:
                                                                FontWeight
                                                                    .bold),
                                                      ),
                                                      Text(
                                                        message.message,
                                                        softWrap: true,
                                                        style: TextStyle(
                                                          color: Colors.white,
                                                          fontSize: 18,
                                                          fontStyle:
                                                              FontStyle.italic,
                                                        ),
                                                      ),
                                                      Align(
                                                        alignment: Alignment
                                                            .bottomRight,
                                                        child: Text(
                                                          DateFormat('HH:mm:ss')
                                                              .format(
                                                                  message.date),
                                                          style: TextStyle(
                                                              color:
                                                                  Colors.white,
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
                                                            Color(0xFF47AE6C),
                                                            Color(0xFF2ECC71)
                                                          ]
                                                        : [
                                                            Color(0xFF4A69BB),
                                                            Color(0xFF3B5998)
                                                          ],
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
                                                            .withOpacity(0.2),
                                                        spreadRadius: 2,
                                                        blurRadius: 6),
                                                  ],
                                                ),
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      message.username ??
                                                          "Unknown",
                                                      style: TextStyle(
                                                          color: Colors.white,
                                                          fontSize: 18,
                                                          fontWeight:
                                                              FontWeight.bold),
                                                    ),
                                                    Text(
                                                      message.message,
                                                      softWrap: true,
                                                      style: TextStyle(
                                                          color: Colors.white,
                                                          fontSize: 18),
                                                    ),
                                                    Align(
                                                      alignment:
                                                          Alignment.bottomRight,
                                                      child: Text(
                                                        DateFormat('HH:mm:ss')
                                                            .format(
                                                                message.date),
                                                        style: TextStyle(
                                                            color: Colors.white,
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
                                    ),
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
                              decoration: InputDecoration(
                                hintText: 'Écrivez un message...',
                                suffixIcon: IconButton(
                                  icon: Icon(Icons.send),
                                  onPressed: () => sendMessage(),
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
      ),
    );
  }
}
