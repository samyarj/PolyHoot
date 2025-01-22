import 'package:client_leger/UI/mockdata/mockdata.dart';
import 'package:flutter/material.dart';

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

  List<ChatMessage> chatMessages = [];

  @override
  void initState() {
    chatMessages = mockChats[widget.channel] ?? [];
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
    Future.delayed(Duration(milliseconds: 100), () {
      if (_listViewScrollController.hasClients) {
        _listViewScrollController
            .jumpTo(_listViewScrollController.position.maxScrollExtent);
      }
    });
  }

  void sendMessage() {
    if (_textController.text.trim().isNotEmpty) {
      setState(
        () {
          chatMessages.add(
            ChatMessage(
              message: _textController.text,
              author: mockUser["username"],
              date: DateTime.now(),
            ),
          );
        },
      );
      mockChats[widget.channel] = chatMessages;
      _textController.clear();
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SafeArea(
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
                      backgroundImage: NetworkImage(
                        mockUser[
                            'avatar_equipped'], // TODO: remplacer par l'avatar du joueur
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(mockUser["username"], style: TextStyle(fontSize: 18)),
                    Spacer(),
                    Text(widget.channel, style: TextStyle(fontSize: 18)),
                  ],
                ),
                Divider(),
                const SizedBox(height: 10),
                SizedBox(
                  height: 500,
                  child: ListView.builder(
                    controller: _listViewScrollController,
                    itemCount: chatMessages.length,
                    itemBuilder: (context, index) {
                      final message = chatMessages[index];
                      final isUserMessage =
                          message.author == mockUser["username"];
                      return Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Align(
                          alignment: isUserMessage
                              ? Alignment.centerRight
                              : Alignment.centerLeft,
                          child: LayoutBuilder(builder: (context, constraints) {
                            return Container(
                              constraints: BoxConstraints(
                                  maxWidth: constraints.maxWidth * 0.7),
                              padding: EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: isUserMessage
                                      ? [Color(0xFF47AE6C), Color(0xFF2ECC71)]
                                      : [Color(0xFF4A69BB), Color(0xFF3B5998)],
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
                                      color: Colors.black.withOpacity(0.2),
                                      spreadRadius: 2,
                                      blurRadius: 6),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${message.author}: ${message.message}',
                                    softWrap: true,
                                    style: TextStyle(
                                        color: Colors.white, fontSize: 18),
                                  ),
                                  Text(
                                    message.date.toString(),
                                    style: TextStyle(
                                        color: Colors.white, fontSize: 16),
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
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
