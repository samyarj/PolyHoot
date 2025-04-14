import 'dart:async';
import 'package:client_leger/UI/main-view/sidebar/channel_search.dart';
import 'package:client_leger/UI/main-view/sidebar/user_channels.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:client_leger/models/chat_channels.dart';
import 'package:client_leger/providers/messages/messages_notif_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Channels extends ConsumerStatefulWidget {
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
  ConsumerState<Channels> createState() => _ChannelsState();
}

class _ChannelsState extends ConsumerState<Channels> {
  final ChannelManager channelManager = ChannelManager();
  List<ChatChannel> userChannels = [];
  List<ChatChannel> joinableChannels = [];
  List<ChatChannel> _filteredJoinChannels = [];
  List<ChatChannel> _filteredUserChannels = [];
  List<ChatChannel> _previousJoinableChannels = [];
  List<ChatChannel> _previousUserChannels = [];
  String currentJoinQuery = "";
  String currentUserQuery = "";

  @override
  void initState() {
    super.initState();
    ref.read(messageNotifProvider.notifier).currentDisplayedChannel = null;
    AppLogger.e("setting current displayed channel to null");
  }

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

  void _filterJoinChannels(String query) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (query != currentJoinQuery ||
          !areEquals(_previousJoinableChannels, joinableChannels)) {
        currentJoinQuery = query;
        _previousJoinableChannels = joinableChannels;
        if (mounted) {
          setState(() {
            AppLogger.i("Filtering join channels with query: $query");

            _filteredJoinChannels = joinableChannels
                .where((channel) =>
                    channel.name.toLowerCase().contains(query.toLowerCase()))
                .toList();
          });
        }
      }
    });
  }

  void _filterUserChannels(String query) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (query != currentUserQuery ||
          !areEquals(_previousUserChannels, userChannels)) {
        currentUserQuery = query;
        _previousUserChannels = userChannels;
        if (mounted) {
          setState(() {
            AppLogger.i("Filtering user channels channels with query: $query");

            _filteredUserChannels = userChannels
                .where((channel) =>
                    channel.name.toLowerCase().contains(query.toLowerCase()))
                .toList();
          });
        }
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

        _filterJoinChannels(currentJoinQuery);
        _filterUserChannels(currentUserQuery);

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
                      UserChannels(
                        filteredChannels: _filteredUserChannels,
                        filterChannels: _filterUserChannels,
                        currentUserUid: widget.userUid,
                        currentQuery: currentUserQuery,
                        onChannelPicked: widget.onChannelPicked,
                      ),
                      ChannelSearch(
                        filteredChannels: _filteredJoinChannels,
                        onDeleteChannel: onDeleteChannel,
                        currentUserUid: widget.userUid,
                        filterChannels: _filterJoinChannels,
                        currentQuery: currentJoinQuery,
                        onChannelPicked: widget.onChannelPicked,
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
}
