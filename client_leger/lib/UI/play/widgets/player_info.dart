import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/providers/play/waiting_page_provider.dart';
import 'package:client_leger/utilities/confirmation_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PlayerInfoWidget extends ConsumerWidget {
  final dynamic player;
  final bool isOrganizer;

  const PlayerInfoWidget({
    Key? key,
    required this.player,
    required this.isOrganizer,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;
    final socketManager = WebSocketManager.instance;
    final isNotPlayer = socketManager.playerName != player.name || isOrganizer;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 8),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              colorScheme.secondary.withValues(alpha: 0.4),
              if (isNotPlayer) colorScheme.secondary.withValues(alpha: 0.3),
              if (isNotPlayer) colorScheme.primary.withValues(alpha: 0.6),
              if (isNotPlayer) colorScheme.primary,
              if (isNotPlayer) colorScheme.primary,
              if (isNotPlayer) colorScheme.primary.withValues(alpha: 0.6),
              if (isNotPlayer) colorScheme.secondary.withValues(alpha: 0.3),
              colorScheme.secondary.withValues(alpha: 0.4),
            ],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(35),
          border: Border.all(
            color: colorScheme.tertiary,
            width: 2,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Avatar
            AvatarBannerWidget(
              avatarUrl: player.avatar,
              bannerUrl: player.banner,
              size: 44, // This is equivalent to radius*2 (22*2)
              avatarFit: BoxFit.cover,
            ),

            // Username text
            Text(
              player.name,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: colorScheme.onPrimary,
              ),
            ),

            // Ban button (conditionally shown)
            socketManager.isOrganizer && player.name != "Organisateur"
                ? ElevatedButton(
                    onPressed: () async {
                      final shouldBan =
                          await confirmBanDialog(context, player.name);
                      if (shouldBan) {
                        ref
                            .read(waitingPageProvider.notifier)
                            .banPlayer(player.name);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor:
                          colorScheme.primary.withValues(alpha: 0.8),
                      foregroundColor: colorScheme.onPrimary,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(25),
                        side: BorderSide(
                          color: colorScheme.tertiary,
                          width: 2,
                        ),
                      ),
                    ),
                    child: const Text(
                      "Exclure",
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )
                : const SizedBox(width: 80),
          ],
        ),
      ),
    );
  }
}
