import 'package:client_leger/UI/global/avatar_banner_widget.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_coin_svg.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_rarity_design.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/models/player_data.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class ResultPlayerInfo extends StatelessWidget {
  const ResultPlayerInfo({super.key, required this.player});

  final PlayerData player;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
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
      padding: const EdgeInsets.symmetric(horizontal: 15),
      constraints: const BoxConstraints(minHeight: 20),
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
            style: TextStyle(fontSize: 16.0),
          ),
          // reward
          Container(
            width: 100,
            height: 100,
            // decoration: getDecoration(player.reward.rarity),
            padding: const EdgeInsets.all(8),
            alignment: Alignment.center,
            child: Column(
              children: [
                player.reward.type == RewardType.Border
                    ? ClipOval(
                        child: Image.network(
                          player.reward.value,
                          fit: BoxFit.scaleDown,
                          width: 70, // Specify width
                          height: 70, // Specify height
                        ),
                      )
                    : player.reward.type == RewardType.Coins
                        ? Container(
                            width: 70,
                            height: 70,
                            decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Theme.of(context).colorScheme.primary),
                            child: FittedBox(
                              fit: BoxFit.none,
                              child: SvgPicture.string(
                                getCoinSvg(player.reward.value),
                                colorFilter: ColorFilter.mode(
                                    Theme.of(context).colorScheme.onPrimary,
                                    BlendMode.srcIn),
                              ),
                            ),
                          )
                        : SizedBox(),
                if (player.reward.type == RewardType.Coins)
                  Text(
                    "${player.reward.value}",
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimary,
                      fontWeight: player.reward.rarity != RewardRarity.Common
                          ? FontWeight.bold
                          : null,
                    ),
                  ),
              ],
            ),
          ),
          // points
          Text(
            '${player.points} points',
            style: TextStyle(fontSize: 16.0),
          ),

          // bonus
          Text(
            '${player.noBonusesObtained} bonus',
            style: TextStyle(fontSize: 16.0),
          ),
        ],
      ),
    );
  }
}
