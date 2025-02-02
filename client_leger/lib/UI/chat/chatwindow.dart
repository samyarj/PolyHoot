import 'package:client_leger/backend-communication-services/auth/auth_service.dart'
    as auth_service;
import 'package:client_leger/backend-communication-services/models/chat_message.dart';
import 'package:client_leger/backend-communication-services/models/user.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ChatWindow extends StatefulWidget {
  const ChatWindow(
      {super.key, required this.channel}); // faudrait avoir aussi le username

  final String channel; // selon le nom du channel on montre la liste de message

  @override
  State<ChatWindow> createState() => _ChatWindowState();
}

class _ChatWindowState extends State<ChatWindow> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _listViewScrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  late ChannelManager _channelManager;
  late Future<User> _user;

  @override
  void initState() {
    _channelManager = ChannelManager();
    _user = auth_service.currentSignedInUser;
    // Scroll to bottom after the first frame is rendered
    _scrollToBottom();
    _focusNode.addListener(() {
      if (_focusNode.hasFocus) {
        _scrollToBottom();
      }
    });
    super.initState();
  }

  @override
  void dispose() {
    _textController.dispose();
    _listViewScrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        Future.delayed(Duration(milliseconds: 300), () {
          if (_listViewScrollController.hasClients) {
            _listViewScrollController.jumpTo(
              _listViewScrollController.position.maxScrollExtent,
            );
          }
        });
      },
    );
  }

  void sendMessage() {
    if (_textController.text.trim().isNotEmpty) {
      _channelManager.sendMessage(widget.channel, _textController.text);
      _textController.clear();
      _focusNode.requestFocus();
    }
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
              child: SingleChildScrollView(
                // sinon overflow on focus when keyboard appears
                child: Column(
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundImage: user?.avatarEquipped != null
                              ? NetworkImage(user!.avatarEquipped!)
                              : AssetImage('assets/default_avatar.png'),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          user?.username ?? 'Inconnu',
                          style: TextStyle(fontSize: 18),
                        ),
                        Spacer(),
                        Text(widget.channel, style: TextStyle(fontSize: 18)),
                      ],
                    ),
                    Divider(),
                    const SizedBox(height: 10),
                    StreamBuilder<List<ChatMessage>>(
                        stream: _channelManager
                            .getMessagesForChannel(widget.channel),
                        builder: (context, snapshot) {
                          if (!snapshot.hasData) {
                            return Center(child: CircularProgressIndicator());
                          }
                          final chatMessages = snapshot.data!;

                          // Scroll to bottom when new messages are added
                          _scrollToBottom();

                          return SizedBox(
                            height: 500,
                            child: ListView.builder(
                              controller: _listViewScrollController,
                              itemCount: chatMessages.length,
                              itemBuilder: (context, index) {
                                final message = chatMessages[index];
                                final isUserMessage = message.uid == user!.uid;
                                return Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Align(
                                    alignment: isUserMessage
                                        ? Alignment.centerRight
                                        : Alignment.centerLeft,
                                    child: LayoutBuilder(
                                        builder: (context, constraints) {
                                      return Container(
                                        constraints: BoxConstraints(
                                            maxWidth:
                                                constraints.maxWidth * 0.7),
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
                                          borderRadius: BorderRadius.only(
                                            topLeft: Radius.circular(15),
                                            topRight: Radius.circular(15),
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
                                              '${message.username}: ${message.message}',
                                              softWrap: true,
                                              style: TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 18),
                                            ),
                                            Text(
                                              DateFormat('d MMM HH:mm:ss', 'fr')
                                                  .format(message.date),
                                              style: TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 16),
                                            ),
                                          ],
                                        ),
                                      );
                                    }),
                                  ),
                                );
                              },
                            ),
                          );
                        }),
                    TextField(
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
                      onSubmitted: (_) => sendMessage(),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
