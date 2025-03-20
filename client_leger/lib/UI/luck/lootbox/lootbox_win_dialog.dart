import 'package:client_leger/UI/luck/lootbox/lootbox_coin_svg.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_rarity_design.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_theme_design.dart';
import 'package:client_leger/models/chance/reward.dart';
import 'package:client_leger/models/enums.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

String getRewardMessage(Reward reward) {
  switch (reward.type) {
    case RewardType.Avatar:
      return "Vous avez gagné l'avatar suivant :";
    case RewardType.Border:
      return "Vous avez gagné le border suivant :";
    case RewardType.Theme:
      return "Vous avez gagné le thème suivant :";
    case RewardType.Coins:
      return "Vous avez gagné le montant d'argent :";
  }
}

openLootBoxWinDialog(Reward reward, BuildContext context) {
  return showDialog<void>(
    context: context,
    barrierDismissible: false, // user must tap button!
    builder: (BuildContext context) {
      return Dialog(
        child: Container(
          width: 400,
          height: 300,
          decoration: getDecoration(reward.rarity).copyWith(
              border: Border.all(
                color: Theme.of(context).colorScheme.onPrimary, // Border color
                width: 4, // Border width
              ),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context)
                      .colorScheme
                      .tertiary
                      .withValues(alpha: 0.3),
                  spreadRadius: 2,
                  blurRadius: 10,
                ),
              ]),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Title
              Text(
                'Félicitations!',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimary,
                  fontWeight: reward.rarity == RewardRarity.Common
                      ? FontWeight.bold
                      : null,
                  fontSize: 18,
                ),
              ),
              SizedBox(height: 8),
              Text(
                getRewardMessage(reward),
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimary,
                  fontWeight: reward.rarity == RewardRarity.Common
                      ? FontWeight.bold
                      : null,
                  fontSize: 16,
                ),
              ),
              // Reward Content
              reward.value is String && reward.type != RewardType.Theme
                  ? ClipOval(
                      child: Image.network(
                        reward.value,
                        fit: BoxFit.scaleDown,
                        width: 80, // Specify width
                        height: 80, // Specify height
                      ),
                    )
                  : reward.type == RewardType.Theme
                      ? getContainer(reward.value)
                      : Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Theme.of(context).colorScheme.primary),
                          child: FittedBox(
                            fit: BoxFit.none,
                            child: SvgPicture.string(
                              getCoinSvg(reward.value),
                              colorFilter: ColorFilter.mode(
                                  Theme.of(context).colorScheme.onPrimary,
                                  BlendMode.srcIn),
                            ),
                          ),
                        ),
              if (reward.type == RewardType.Coins)
                Text(
                  reward.value.toString(),
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              // close button
              GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Container(
                  margin: const EdgeInsets.only(top: 8),
                  width: 80,
                  height: 40, // Fixed height for medium button
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8), // Padding for content
                  decoration: BoxDecoration(
                    color: Theme.of(context)
                        .colorScheme
                        .onPrimary, // Background color
                    border: Border.all(
                      color:
                          Theme.of(context).colorScheme.primary, // Border color
                      width: 3,
                    ),
                    borderRadius: BorderRadius.circular(50), // Rounded corners
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    "Fermer", // Button text
                    style: TextStyle(
                      fontSize: 14,
                      color:
                          Theme.of(context).colorScheme.primary, // Text color
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}
