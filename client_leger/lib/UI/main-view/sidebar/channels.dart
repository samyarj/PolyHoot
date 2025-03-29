import 'dart:async';
import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/confirmation/confirmation_messages.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/main-view/sidebar/channel_search.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:client_leger/models/chat_channels.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class Channels extends ConsumerStatefulWidget {
  const Channels(
      {super.key,
      required this.onChannelPicked,
      required this.getRecentChannel,
      required this.nullifyRecentChannel});

  final Function(int, String) onChannelPicked;
  final String? Function() getRecentChannel;
  final void Function() nullifyRecentChannel;

  @override
  ConsumerState<Channels> createState() => _ChannelsState();
}

class _ChannelsState extends ConsumerState<Channels> {
  final ChannelManager channelManager = ChannelManager();
  List<ChatChannel> userChannels = [];
  List<ChatChannel> joinableChannels = [];
  List<ChatChannel> _filteredChannels = [];
  StreamSubscription<List<ChatChannel>>? _channelsSubscription;
  String currentQuery = "";

  @override
  void initState() {
    _filteredChannels = joinableChannels;
    super.initState();
  }

  Future<void> onDeleteChannel(String channel) async {
    await channelManager.deleteChannel(channel);
    if (widget.getRecentChannel() == channel) {
      widget.nullifyRecentChannel();
    }
  }

  void _filterChannels(String query) {
    setState(() {
      AppLogger.i("Filtering channels with query: $query");
      if (query != currentQuery) {
        currentQuery = query;
      }
      _filteredChannels = joinableChannels
          .where((channel) =>
              channel.name.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });
  }

  _subscribeToChannels(String currentUserUid) {
    if (_channelsSubscription != null) return;
    try {
      AppLogger.i("subscribing to channels");
      _channelsSubscription =
          channelManager.fetchAllChannels(currentUserUid).listen((newChannels) {
        // it is the whole updated list of channels everytime
        AppLogger.i("in the channels subscription callback");

        userChannels =
            newChannels.where((channel) => channel.isUserInChannel).toList();

        joinableChannels =
            newChannels.where((channel) => !channel.isUserInChannel).toList();

        _filterChannels(currentQuery);
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

  @override
  void dispose() {
    AppLogger.w("in the dispose method of channels");
    _channelsSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    AppLogger.i("in the build method of channels");
    final colorScheme = Theme.of(context).colorScheme;
    final userState = ref.read(userProvider);

    return userState.when(
      data: (user) {
        _subscribeToChannels(user!.uid);

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
                      _buildUserChannels(userChannels, user.uid, colorScheme),
                      ChannelSearch(
                        filteredChannels: _filteredChannels,
                        onDeleteChannel: onDeleteChannel,
                        currentUserUid: user.uid,
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
      loading: () => Center(child: ThemedProgressIndicator()),
      error: (error, stack) => Center(
        child: Text(
          getCustomError(
            error,
          ),
        ),
      ),
    );
  }

  _buildUserChannels(List<ChatChannel> userChannels, String currentUserUid,
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
