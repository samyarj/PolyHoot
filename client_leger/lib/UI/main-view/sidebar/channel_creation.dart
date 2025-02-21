import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/models/chat_channels.dart';
import 'package:client_leger/business/channel_manager.dart';
import 'package:flutter/material.dart';

void showChatroomModal(BuildContext context) {
  final TextEditingController channelController = TextEditingController();
  ChannelManager channelManager = ChannelManager();

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (context) {
      return Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          bottom: MediaQuery.of(context).viewInsets.bottom + 16,
          top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "Canaux de discussion",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10),
            SizedBox(
              height: 200,
              child: StreamBuilder<List<ChatChannel>>(
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
                    return const Text('No channels available.');
                  }

                  return ListView.builder(
                    itemCount: channels.length,
                    itemBuilder: (context, index) {
                      final channel = channels[index];
                      return ListTile(
                        title: Text(channel.name),
                        trailing: SizedBox(
                          width: 75,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                channel.isUserInChannel
                                    ? Icons.check_circle
                                    : Icons.remove_circle,
                                color: channel.isUserInChannel
                                    ? Colors.green
                                    : Colors.red,
                              ),
                              IconButton(
                                icon: Icon(Icons.delete),
                                onPressed: () async => {
                                  await channelManager
                                      .deleteChannel(channel.name)
                                },
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
            SizedBox(height: 10),
            TextField(
              controller: channelController,
              decoration: InputDecoration(
                labelText: "Nom du nouveau canal",
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: () async {
                final channelName = channelController.text.trim();
                if (channelName != "users" && channelName != "globalChat") {
                  try {
                    await channelManager
                        .createChannel(channelController.text.trim());
                  } catch (e) {
                    showErrorDialog(context, getCustomError(e));
                  }
                }
              },
              child: Text("Créer le canal"),
            ),
          ],
        ),
      );
    },
  );
}
