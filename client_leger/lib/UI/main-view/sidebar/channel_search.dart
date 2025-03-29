import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/confirmation/confirmation_messages.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:client_leger/models/chat_channels.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';

class ChannelSearch extends StatefulWidget {
  const ChannelSearch({
    super.key,
    required this.filteredChannels,
    required this.onDeleteChannel,
    required this.currentUserUid,
    required this.filterChannels,
    required this.currentQuery,
  });
  final List<ChatChannel> filteredChannels; // filtered by parent
  final Future<void> Function(String) onDeleteChannel;
  final Function(String) filterChannels; // parent callback
  final String currentUserUid;
  final String currentQuery;

  @override
  State<ChannelSearch> createState() => _ChannelSearchState();
}

class _ChannelSearchState extends State<ChannelSearch> {
  final ChannelManager _channelManager = ChannelManager();
  final TextEditingController _searchChannelTextController =
      TextEditingController();
  final TextEditingController _textChannelController = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    if (widget.currentQuery.isNotEmpty) {
      _searchChannelTextController.text = widget.currentQuery;
    }
    super.initState();
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
    AppLogger.i("Building ChannelSearch widget");
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
            height: 300,
            child: widget.filteredChannels.isEmpty
                ? Text(
                    "Aucun channel trouvé",
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
                        title: Text(
                          channel.name,
                          style: TextStyle(
                              color: colorScheme.onPrimary, fontSize: 18),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: Icon(
                                Icons.add_circle,
                                color: colorScheme.onPrimary,
                                size: 30,
                              ),
                              onPressed: () async {
                                await _channelManager.joinChannel(
                                    widget.currentUserUid, channel.name);
                              },
                            ),
                            IconButton(
                              icon: Icon(
                                Icons.delete,
                                size: 30,
                                color: colorScheme.onPrimary,
                              ),
                              onPressed: () async {
                                await showConfirmationDialog(
                                    context,
                                    "$deleteChannel ${channel.name} ?",
                                    () => widget.onDeleteChannel(channel.name),
                                    null);
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
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        TapRegion(
          onTapOutside: (_) => FocusScope.of(context).unfocus(),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              style: TextStyle(color: colorScheme.onPrimary),
              controller: _textChannelController,
              decoration: InputDecoration(
                labelText: "Nom du nouveau canal",
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
                suffixIcon: IconButton(
                  icon: Icon(Icons.clear, color: colorScheme.onPrimary),
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
          style: ElevatedButton.styleFrom(
            padding: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16.0),
            ),
            backgroundColor: colorScheme.secondary.withValues(alpha: 0.7),
            foregroundColor: colorScheme.onSecondary,
            elevation: 2.0,
          ),
          child: Text(
            "Créer le canal",
            style: TextStyle(
                color: colorScheme.onSecondary,
                fontSize: 16,
                fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}
