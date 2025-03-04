import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/confirmation/confirmation_messages.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/models/chat_channels.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ChannelSearch extends ConsumerStatefulWidget {
  const ChannelSearch(
      {super.key,
      required this.joinableChannels,
      required this.onDeleteChannel});
  final List<ChatChannel> joinableChannels;
  final Future<void> Function(String) onDeleteChannel;

  @override
  ConsumerState<ChannelSearch> createState() => _ChannelSearchState();
}

class _ChannelSearchState extends ConsumerState<ChannelSearch> {
  late ChannelManager _channelManager;
  final TextEditingController _searchChannelTextController =
      TextEditingController();
  final TextEditingController _textChannelController = TextEditingController();

  final FocusNode _focusNode = FocusNode();
  List<ChatChannel> _filteredChannels = [];

  @override
  void initState() {
    _channelManager = ChannelManager();
    _filteredChannels = widget.joinableChannels;
    super.initState();
  }

  void _filterChannels(String query) {
    setState(() {
      _filteredChannels = widget.joinableChannels
          .where((channel) =>
              channel.name.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });
  }

  @override
  void dispose() {
    _searchChannelTextController.dispose();
    _textChannelController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.joinableChannels.isEmpty
        ? Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Center(
                  child: Text(
                    'Aucun canal trouvé',
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                ),
              ),
              addChannel()
            ],
          )
        : SingleChildScrollView(
            physics:
                const AlwaysScrollableScrollPhysics(), // to prevent a bug, do not remove
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TapRegion(
                  onTapOutside: (_) => FocusScope.of(context).unfocus(),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: TextField(
                      controller: _searchChannelTextController,
                      focusNode: _focusNode,
                      decoration: InputDecoration(
                        suffixIcon: IconButton(
                          icon: Icon(Icons.clear, color: Colors.white),
                          onPressed: () {
                            setState(() {
                              _searchChannelTextController.clear();
                              _filteredChannels = widget.joinableChannels;
                            });
                          },
                        ),
                        labelText: 'Chercher un canal',
                        labelStyle: TextStyle(color: Colors.white),
                        fillColor: Colors.white,
                        border: OutlineInputBorder(),
                      ),
                      style: TextStyle(color: Colors.white),
                      onChanged: _filterChannels,
                    ),
                  ),
                ),
                SizedBox(
                  height: 300,
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _filteredChannels.length,
                    itemBuilder: (context, index) {
                      final channel = _filteredChannels[index];
                      return ListTile(
                        title: Text(
                          channel.name,
                          style: TextStyle(color: Colors.white, fontSize: 18),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: Icon(
                                Icons.add_circle,
                                color: Colors.white,
                                size: 30,
                              ),
                              onPressed: () async {
                                await _channelManager.joinChannel(
                                    ref, channel.name);
                              },
                            ),
                            IconButton(
                              icon: Icon(
                                Icons.delete,
                                size: 30,
                                color: Colors.white,
                              ),
                              onPressed: () async {
                                await showConfirmationDialog(
                                  context,
                                  "$deleteChannel ${channel.name} ?",
                                  () => widget.onDeleteChannel(channel.name),
                                );
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                addChannel(),
              ],
            ),
          );
  }

  Widget addChannel() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        TapRegion(
          onTapOutside: (_) => FocusScope.of(context).unfocus(),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              style: TextStyle(color: Colors.white),
              controller: _textChannelController,
              decoration: InputDecoration(
                labelText: "Nom du nouveau canal",
                labelStyle: TextStyle(color: Colors.white),
                fillColor: Colors.white,
                border: OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(Icons.clear, color: Colors.white),
                  onPressed: () {
                    _textChannelController.clear();
                  },
                ),
              ),
            ),
          ),
        ),
        ElevatedButton(
          onPressed: () async {
            final channelName = _textChannelController.text.trim();
            if (channelName.isEmpty) return;
            try {
              await _channelManager
                  .createChannel(_textChannelController.text.trim());
              _textChannelController.clear();
            } catch (e) {
              if (!mounted) return;
              showErrorDialog(context, getCustomError(e));
            }
          },
          style: TextButton.styleFrom(
            padding: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16.0),
            ),
            backgroundColor: const Color.fromARGB(87, 21, 3, 87),
            foregroundColor: Colors.white,
            elevation: 2.0,
          ),
          child: Text(
            "Créer le canal",
            style: TextStyle(color: Colors.white, fontSize: 16),
          ),
        ),
      ],
    );
  }
}
