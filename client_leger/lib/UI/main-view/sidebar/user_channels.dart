import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/confirmation/confirmation_messages.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:client_leger/models/chat_channels.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class UserChannels extends StatefulWidget {
  const UserChannels({
    super.key,
    required this.filteredChannels,
    required this.filterChannels,
    required this.currentUserUid,
    required this.currentQuery,
    required this.onChannelPicked,
  });

  final List<ChatChannel>
      filteredChannels; // filtered by parent, what we display
  final Function(String) filterChannels; // parent callback
  final String? currentUserUid;
  final String currentQuery;
  final Function(int, String) onChannelPicked;

  @override
  State<UserChannels> createState() => _UserChannelsState();
}

class _UserChannelsState extends State<UserChannels> {
  final ChannelManager _channelManager = ChannelManager();
  final TextEditingController _searchChannelTextController =
      TextEditingController();
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    if (widget.currentQuery.isNotEmpty) {
      _searchChannelTextController.text = widget.currentQuery;
    }
    super.initState();
  }

  Future<void> onDeleteChannel(String channel) async {
    await _channelManager.deleteChannel(channel);
  }

  @override
  void dispose() {
    _searchChannelTextController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return SingleChildScrollView(
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
                    icon: Icon(Icons.clear, color: colorScheme.onPrimary),
                    onPressed: () {
                      _searchChannelTextController.clear();
                      widget.filterChannels("");
                    },
                  ),
                  labelText: 'Chercher un canal',
                  labelStyle: TextStyle(color: colorScheme.onPrimary),
                  fillColor: colorScheme.surface.withValues(alpha: 0.3),
                  filled: true,
                  border: OutlineInputBorder(
                    borderSide: BorderSide(color: colorScheme.secondary),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                        color: colorScheme.onPrimary.withValues(alpha: 0.5)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: colorScheme.secondary),
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                style: TextStyle(color: colorScheme.onPrimary),
                onChanged: (query) => widget.filterChannels(query),
              ),
            ),
          ),
          SizedBox(
            height: 450,
            child: widget.filteredChannels.isEmpty
                ? Text(
                    'Aucun canal trouvé.',
                    style: TextStyle(
                      color: colorScheme.onPrimary,
                      fontSize: 16,
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    itemCount: widget.filteredChannels.length,
                    itemBuilder: (context, index) {
                      final channel = widget.filteredChannels[index];
                      return ListTile(
                        leading: IconButton(
                          icon: Icon(
                            FontAwesomeIcons.comment,
                            color: colorScheme.onPrimary,
                          ),
                          onPressed: () =>
                              widget.onChannelPicked(2, channel.name),
                        ),
                        title: Text(
                          channel.name,
                          style: TextStyle(
                              color: colorScheme.onPrimary, fontSize: 18),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: Icon(FontAwesomeIcons.rightFromBracket,
                                  color: colorScheme.onPrimary),
                              onPressed: () async {
                                await showConfirmationDialog(
                                    context,
                                    "$quitChannel ${channel.name} ?",
                                    () => _channelManager.quitChannel(
                                        widget.currentUserUid, channel.name),
                                    null);
                              },
                            ),
                            IconButton(
                              icon: Icon(Icons.delete,
                                  size: 30, color: colorScheme.onPrimary),
                              onPressed: () async {
                                await showConfirmationDialog(
                                    context,
                                    "$deleteChannel ${channel.name} ?",
                                    () => onDeleteChannel(channel.name),
                                    null);
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
