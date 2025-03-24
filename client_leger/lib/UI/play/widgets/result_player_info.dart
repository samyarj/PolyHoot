import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_coin_svg.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_rarity_design.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/models/player_data.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ResultPlayerInfo extends StatelessWidget {
  const ResultPlayerInfo(
      {super.key, required this.player, required this.maxPoints});

  final PlayerData player;
  final int maxPoints;

  @override
  Widget build(BuildContext context) {
    final bool isWinner = player.points == maxPoints;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      margin: isWinner && player.isInGame
          ? const EdgeInsets.symmetric(horizontal: 20)
          : const EdgeInsets.symmetric(horizontal: 60),
      decoration: isWinner && player.isInGame
          ? BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).colorScheme.secondary.withAlpha(
                      (0.50 * 255).toInt()), // Reduced to 50% opacity
                  Theme.of(context).colorScheme.secondary.withAlpha(
                      (0.30 * 255).toInt()), // Reduced to 30% opacity
                  Theme.of(context).colorScheme.secondary.withAlpha(
                      (0.50 * 255).toInt()), // Reduced to 50% opacity
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context).colorScheme.secondary.withAlpha(
                      (0.40 * 255).toInt()), // Reduced to 60% opacity
                  blurRadius: 20, // Reduced blur for a softer effect
                  spreadRadius: 0,
                  offset: Offset(0, 0),
                ),
                BoxShadow(
                  color: Theme.of(context).colorScheme.tertiary.withAlpha(
                      (0.20 * 255).toInt()), // Reduced to 40% opacity
                  blurRadius: 10, // Reduced blur for a softer effect
                  spreadRadius: 0,
                  offset: Offset(0, 0),
                ),
              ],
              borderRadius:
                  BorderRadius.circular(30), // Add rounded corners if needed
            )
          : BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).colorScheme.secondary.withAlpha(128),
                  Theme.of(context).colorScheme.primary.withAlpha(128),
                  Theme.of(context).colorScheme.secondary.withAlpha(128),
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context).colorScheme.tertiary.withAlpha(204),
                  blurRadius: 10,
                ),
              ],
            ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // avatar + border
          AvatarBannerWidget(
            avatarUrl: player.equippedAvatar,
            bannerUrl: player.equippedBanner,
            size: 70,
            avatarFit: BoxFit.cover,
          ),
          // player name
          Text(
            player.name,
            style: TextStyle(fontSize: 18.0),
          ),
          // reward
          player.isInGame &&
                  player.reward != null &&
                  player.reward!.type == RewardType.Border
              ? Stack(
                  alignment: Alignment.center,
                  children: [
                    Image.network(
                      player.reward!.value,
                      fit: BoxFit.cover,
                      width: 70, // Slightly bigger than the inner container
                      height: 70,
                    ),
                    // The actual content you want inside the circular frame
                    Container(
                      width: 60,
                      height: 60,
                      decoration: getDecoration(player.reward!.rarity),
                    ),
                  ],
                )
              : Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Theme.of(context).colorScheme.tertiary,
                        blurRadius: 15,
                        spreadRadius: 0,
                        offset: Offset(0, 0),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (player.isInGame &&
                          player.reward != null &&
                          player.reward!.type == RewardType.Border)
                        ClipOval(
                          child: Image.network(
                            player.reward!.value,
                            fit: BoxFit.scaleDown,
                            width: 70, // Specify width
                            height: 70, // Specify height
                          ),
                        )
                      else if (player.isInGame &&
                          player.reward != null &&
                          player.reward!.type == RewardType.Coins) ...[
                        FittedBox(
                          fit: BoxFit.none,
                          child: SvgPicture.string(
                            getCoinSvg(player.reward!.value),
                            colorFilter: ColorFilter.mode(
                                Theme.of(context).colorScheme.onPrimary,
                                BlendMode.srcIn),
                          ),
                        ),
                        Text(
                          "${player.reward!.value}",
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.onPrimary,
                            fontWeight:
                                player.reward!.rarity != RewardRarity.Common
                                    ? FontWeight.bold
                                    : null,
                          ),
                        ),
                      ] else if (!player.isInGame)
                        Icon(
                          FontAwesomeIcons.x,
                          color: Theme.of(context)
                              .colorScheme
                              .tertiary, // Set the color
                          size: 34.0, // Set the size
                        )
                    ],
                  ),
                ),
          // points
          Text(
            '${player.points} points',
            style: TextStyle(fontSize: 18.0),
          ),

          // bonus
          Text(
            '${player.noBonusesObtained} bonus',
            style: TextStyle(fontSize: 18.0),
          ),
        ],
      ),
    );
  }
}
