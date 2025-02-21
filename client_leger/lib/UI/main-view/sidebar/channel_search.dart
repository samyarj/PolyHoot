import 'package:client_leger/UI/main-view/sidebar/joined_channels_carousel.dart';
import 'package:client_leger/backend-communication-services/models/chat_channels.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:flutter/material.dart';

class JoinChannelSearch extends StatefulWidget {
  const JoinChannelSearch({super.key});

  @override
  State<JoinChannelSearch> createState() => _JoinChannelSearchState();
}

class _JoinChannelSearchState extends State<JoinChannelSearch> {
  String? _selectedChannel;
  late ChannelManager _channelManager;
  final TextEditingController _textEditingController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final GlobalKey _autocompleteKey = GlobalKey();

  @override
  void initState() {
    _channelManager = ChannelManager();
    super.initState();
  }

  void _joinChannel() async {
    ScaffoldMessenger.of(context).clearSnackBars();
    await _channelManager.joinChannel(_textEditingController.text.trim());
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Canal $_selectedChannel rejoint !')),
    );

    _textEditingController.clear();
    _focusNode.unfocus();
    _selectedChannel = null;
  }

  void removeJoinedChannel(String channel) async {
    ScaffoldMessenger.of(context).clearSnackBars();
    await _channelManager.quitChannel(channel);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Canal $channel quitté !')),
    );
  }

  @override
  void dispose() {
    _textEditingController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _focusNode.unfocus(),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: StreamBuilder<List<ChatChannel>>(
              stream: _channelManager.fetchAllChannels(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return CircularProgressIndicator();
                }

                if (snapshot.hasError) {
                  return Text("An error occured");
                }

                final channels = snapshot.data ?? [];

                return Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: RawAutocomplete<String>(
                            key: _autocompleteKey,
                            focusNode: _focusNode,
                            textEditingController: _textEditingController,
                            optionsViewOpenDirection:
                                OptionsViewOpenDirection.up,
                            optionsBuilder:
                                (TextEditingValue textEditingValue) {
                              return channels
                                  .where((channel) =>
                                      channel.name.toLowerCase().contains(
                                            textEditingValue.text.toLowerCase(),
                                          ))
                                  .map((channel) => channel.name);
                            },
                            onSelected: (String selectedChannel) {
                              setState(() {
                                _selectedChannel = selectedChannel;
                              });
                            },
                            optionsViewBuilder: (context, onSelected, options) {
                              return Align(
                                alignment: Alignment.bottomCenter,
                                child: Material(
                                  elevation: 4.0,
                                  child: SizedBox(
                                    height: 200.0,
                                    child: ListView.separated(
                                        itemBuilder: (context, index) {
                                          final option =
                                              options.elementAt(index);
                                          return ListTile(
                                              title: Text(option),
                                              onTap: () {
                                                onSelected(option);
                                              });
                                        },
                                        separatorBuilder: (context, index) =>
                                            const Divider(),
                                        itemCount: options.length),
                                  ),
                                ),
                              );
                            },
                            fieldViewBuilder: (context, controller, focusNode,
                                onEditingComplete) {
                              return TextField(
                                controller: _textEditingController,
                                focusNode: _focusNode,
                                decoration: InputDecoration(
                                  suffixIcon: IconButton(
                                    icon:
                                        Icon(Icons.clear, color: Colors.white),
                                    onPressed: () {
                                      setState(() {
                                        _textEditingController.clear();
                                        _selectedChannel = null;
                                      });
                                    },
                                  ),
                                  labelText: 'Choisir un canal',
                                  labelStyle: TextStyle(color: Colors.white),
                                  fillColor: Colors.white,
                                  border: OutlineInputBorder(),
                                ),
                                style: TextStyle(color: Colors.white),
                              );
                            },
                          ),
                        ),
                        SizedBox(width: 8),
                        IconButton(
                          onPressed:
                              _selectedChannel == null ? null : _joinChannel,
                          icon: Icon(Icons.group_add),
                          color: Colors.white,
                          tooltip: 'Joindre',
                        ),
                      ],
                    ),
                    SizedBox(height: 32),
                    JoinedChannelsCarousel(
                      joinedChannels: channels
                          .where((channel) => channel.isUserInChannel)
                          .toList(),
                      callback: removeJoinedChannel,
                    ),
                  ],
                );
              }),
        ),
      ),
    );
  }
}
