import 'dart:async';
import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/confirmation/confirmation_messages.dart';
import 'package:client_leger/UI/main-view/sidebar/channel_search.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:client_leger/models/chat_channels.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class Channels extends StatefulWidget {
  const Channels({
    super.key,
    required this.onChannelPicked,
    required this.channelsNotifier,
    required this.userUid,
  });

  final Function(int, String) onChannelPicked;
  final ValueNotifier<List<ChatChannel>> channelsNotifier;
  final String? userUid;

  @override
  State<Channels> createState() => _ChannelsState();
}

class _ChannelsState extends State<Channels> {
  final ChannelManager channelManager = ChannelManager();
  List<ChatChannel> userChannels = [];
  List<ChatChannel> joinableChannels = [];
  List<ChatChannel> _filteredChannels = [];
  List<ChatChannel> _previousJoinableChannels = [];
  String currentQuery = "";

  Future<void> onDeleteChannel(String channel) async {
    await channelManager.deleteChannel(channel);
  }

  bool areEquals(List<ChatChannel> list1, List<ChatChannel> list2) {
    if (list1.length != list2.length) return false;
    for (int i = 0; i < list1.length; i++) {
      if (list1[i].name != list2[i].name) return false;
    }
    return true;
  }

  void _filterChannels(String query) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (query != currentQuery ||
          !areEquals(_previousJoinableChannels, joinableChannels)) {
        currentQuery = query;
        _previousJoinableChannels = joinableChannels;
        setState(() {
          AppLogger.i("Filtering channels with query: $query");

          _filteredChannels = joinableChannels
              .where((channel) =>
                  channel.name.toLowerCase().contains(query.toLowerCase()))
              .toList();
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return ValueListenableBuilder(
      valueListenable: widget.channelsNotifier,
      builder: (context, channels, _) {
        userChannels =
            channels.where((channel) => channel.isUserInChannel).toList();

        joinableChannels =
            channels.where((channel) => !channel.isUserInChannel).toList();

        _filterChannels(currentQuery);

        return DefaultTabController(
          length: 2,
          child: Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom + 16,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TabBar(
                  labelColor: colorScheme.onPrimary,
                  unselectedLabelColor: colorScheme.tertiary,
                  labelStyle: TextStyle(fontSize: 18),
                  indicator: BoxDecoration(
                    color: colorScheme.secondary.withValues(alpha: 0.55),
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  tabs: [
                    Tab(
                      text: 'Vos canaux',
                    ),
                    Tab(text: 'Joindre'),
                  ],
                ),
                Expanded(
                  child: TabBarView(
                    children: [
                      _buildUserChannels(
                          userChannels, widget.userUid, colorScheme),
                      ChannelSearch(
                        filteredChannels: _filteredChannels,
                        onDeleteChannel: onDeleteChannel,
                        currentUserUid: widget.userUid,
                        filterChannels: _filterChannels,
                        currentQuery: currentQuery,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  _buildUserChannels(List<ChatChannel> userChannels, String? currentUserUid,
      ColorScheme colorScheme) {
    if (userChannels.isEmpty) {
      return Center(
        child: Text(
          'Vous êtes dans aucun canal.',
          style: TextStyle(color: colorScheme.onPrimary),
        ),
      );
    }

    return ListView.builder(
      itemCount: userChannels.length,
      itemBuilder: (context, index) {
        final channel = userChannels[index];
        return ListTile(
          leading: IconButton(
            icon: Icon(
              FontAwesomeIcons.comment,
              color: colorScheme.onPrimary,
            ),
            onPressed: () => widget.onChannelPicked(2, channel.name),
          ),
          title: Text(
            channel.name,
            style: TextStyle(color: colorScheme.onPrimary, fontSize: 18),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: Icon(Icons.exit_to_app,
                    size: 30, color: colorScheme.onPrimary),
                onPressed: () async {
                  await showConfirmationDialog(
                      context,
                      "$quitChannel ${channel.name} ?",
                      () => channelManager.quitChannel(
                          currentUserUid, channel.name),
                      null);
                },
              ),
              IconButton(
                icon:
                    Icon(Icons.delete, size: 30, color: colorScheme.onPrimary),
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
    );
  }
}
