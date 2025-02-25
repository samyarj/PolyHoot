import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/confirmation/confirmation_messages.dart';
import 'package:client_leger/UI/main-view/sidebar/channel_search.dart';
import 'package:client_leger/backend-communication-services/models/chat_channels.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:flutter/material.dart';

class Channels extends StatelessWidget {
  Channels(
      {super.key,
      required this.onChannelPicked,
      required this.getRecentChannel,
      required this.nullifyRecentChannel});
  final TextEditingController channelController = TextEditingController();
  final ChannelManager channelManager = ChannelManager();
  final Function(int, String) onChannelPicked;
  final String? Function() getRecentChannel;
  final void Function() nullifyRecentChannel;

  Future<void> onDeleteChannel(String channel) async {
    await channelManager.deleteChannel(channel);
    if (getRecentChannel() == channel) {
      nullifyRecentChannel();
    }
  }

  @override
  Widget build(BuildContext context) {
    List<ChatChannel> userChannels = [];
    List<ChatChannel> joinableChannels = [];
    return StreamBuilder<List<ChatChannel>>(
        stream: channelManager.fetchAllChannels(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const CircularProgressIndicator();
          }

          if (snapshot.hasError) {
            return Text('Error: ${snapshot.error}');
          }

          final channels = snapshot.data ?? [];

          if (channels.isEmpty) {
            return const Text('Aucun canal trouvé');
          }

          userChannels =
              channels.where((channel) => channel.isUserInChannel).toList();

          joinableChannels =
              channels.where((channel) => !channel.isUserInChannel).toList();

          return DefaultTabController(
            length: 2,
            child: Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
                top: 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TabBar(
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white,
                    labelStyle: TextStyle(fontSize: 18),
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
                        _buildUserChannels(userChannels),
                        _buildJoinChannels(joinableChannels),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        });
  }

  _buildUserChannels(List<ChatChannel> userChannels) {
    if (userChannels.isEmpty) {
      return Center(
        child: Text(
          'Vous êtes dans aucun canal.',
          style: TextStyle(color: Colors.white),
        ),
      );
    }

    return ListView.builder(
      itemCount: userChannels.length,
      itemBuilder: (context, index) {
        final channel = userChannels[index];
        return InkWell(
          onTap: () => onChannelPicked(2, channel.name),
          child: ListTile(
            title: Text(
              channel.name,
              style: TextStyle(color: Colors.white, fontSize: 18),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: Icon(Icons.exit_to_app, size: 30, color: Colors.white),
                  onPressed: () async {
                    await showConfirmationDialog(
                      context,
                      "$quitChannel ${channel.name} ?",
                      () => channelManager.quitChannel(channel.name),
                    );
                  },
                ),
                IconButton(
                  icon: Icon(Icons.delete, size: 30, color: Colors.white),
                  onPressed: () async {
                    await showConfirmationDialog(
                      context,
                      "$deleteChannel ${channel.name} ?",
                      () => onDeleteChannel(channel.name),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  _buildJoinChannels(List<ChatChannel> joinableChannels) {
    return ChannelSearch(
      key: ValueKey(joinableChannels),
      joinableChannels: joinableChannels,
      onDeleteChannel: onDeleteChannel,
    );
  }
}
