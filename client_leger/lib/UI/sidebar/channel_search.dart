import 'package:client_leger/UI/sidebar/joined_channels_carousel.dart';
import 'package:flutter/material.dart';

class JoinChannelSearch extends StatefulWidget {
  const JoinChannelSearch({super.key});

  @override
  State<JoinChannelSearch> createState() => _JoinChannelSearchState();
}

class _JoinChannelSearchState extends State<JoinChannelSearch> {
  String? _selectedChannel;

  final TextEditingController _textEditingController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final GlobalKey _autocompleteKey = GlobalKey();

  final List<String> _channelsAvailable = [
    'General',
    'The BIRDS',
    'Music Lovers',
    'Foodies',
    '3.5+ only',
    "Test1",
    "Test2",
    "Test3",
  ]..sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));

  final List<String> _joinedChannels = ['General', "Test1", "Test2", "Test3"];

  void _joinChannel() {
    if (!_joinedChannels.contains(_selectedChannel)) {
      ScaffoldMessenger.of(context).clearSnackBars();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Canal $_selectedChannel rejoint !')),
      );
      setState(() {
        _joinedChannels.add(_selectedChannel!);
      });
    } else {
      ScaffoldMessenger.of(context).clearSnackBars();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Vous êtes déjà dans le canal $_selectedChannel !',
            style: TextStyle(
              color: Theme.of(context).colorScheme.onErrorContainer,
            ),
          ),
          backgroundColor: Theme.of(context).colorScheme.errorContainer,
        ),
      );
    }
    _textEditingController.clear();
    _focusNode.unfocus();
    _selectedChannel = null;
  }

  void removeJoinedChannel(String channel) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Canal $channel quitté !')),
    );
    setState(() {
      _joinedChannels.remove(channel);
    });
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
      onTap: () => _focusNode.unfocus(), // Dismiss keyboard on tap outside
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: RawAutocomplete<String>(
                      key: _autocompleteKey,
                      focusNode: _focusNode,
                      textEditingController: _textEditingController,
                      optionsViewOpenDirection: OptionsViewOpenDirection.up,
                      optionsBuilder: (TextEditingValue textEditingValue) {
                        return _channelsAvailable
                            .where((channel) => channel.toLowerCase().contains(
                                  textEditingValue.text.toLowerCase(),
                                ))
                            .toList();
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
                                    final option = options.elementAt(index);
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
                      fieldViewBuilder:
                          (context, controller, focusNode, onEditingComplete) {
                        return TextField(
                          controller: _textEditingController,
                          focusNode: _focusNode,
                          decoration: InputDecoration(
                            suffixIcon: IconButton(
                              icon: Icon(Icons.clear, color: Colors.white),
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
                    onPressed: _selectedChannel == null ? null : _joinChannel,
                    icon: Icon(Icons.group_add),
                    color: Colors.white,
                    tooltip: 'Joindre',
                  ),
                ],
              ),
              SizedBox(height: 32),
              JoinedChannelsCarousel(
                joinedChannels: _joinedChannels,
                callback: removeJoinedChannel,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
