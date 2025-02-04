import 'package:client_leger/UI/chat/chatwindow.dart';
import 'package:flutter/material.dart';

class JoinedChannelsCarousel extends StatelessWidget {
  const JoinedChannelsCarousel(
      {super.key, required this.joinedChannels, required this.callback});

  final List<String> joinedChannels;
  final Function callback;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: joinedChannels.length,
        itemBuilder: (context, index) {
          final channel = joinedChannels[index];
          return InkWell(
            onTap: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                enableDrag: false,
                builder: (BuildContext context) {
                  return ChatWindow(channel: channel);
                },
              );
            },
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 8,
              ),
              decoration: BoxDecoration(
                color: Colors.blueAccent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Text(
                    channel,
                    style: const TextStyle(color: Colors.white),
                  ),
                  const SizedBox(width: 4),
                  if (channel != "General")
                    GestureDetector(
                      onTap: () {
                        callback(channel);
                      },
                      child: const Icon(
                        Icons.close,
                        color: Colors.white,
                        size: 16,
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
