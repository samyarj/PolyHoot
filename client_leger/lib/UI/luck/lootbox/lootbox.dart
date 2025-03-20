import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_coin_svg.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_rarity_design.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_theme_design.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_win_dialog.dart';
import 'package:client_leger/backend-communication-services/chance/lootbox_service.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/models/chance/lootbox_container.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/providers/user_provider.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';

class LootBox extends ConsumerStatefulWidget {
  const LootBox({super.key});

  @override
  ConsumerState<LootBox> createState() => _LootBoxState();
}

class _LootBoxState extends ConsumerState<LootBox> {
  final lootBoxService = LootboxService();
  late List<LootBoxContainer> lootBoxes = [];
  bool _isLoadingOpenBox = false;
  int? _indexOfLoadingBox;

  Future<void> loadLootBoxes() async {
    try {
      final boxes = await lootBoxService.getBoxes();
      if (mounted) {
        setState(() {
          lootBoxes = boxes;
        });
      }
    } catch (e) {
      if (mounted) showErrorDialog(context, e.toString());
    }
  }

  @override
  void initState() {
    loadLootBoxes();
    super.initState();
  }

  void openBox(int index) async {
    try {
      setState(
        () {
          _isLoadingOpenBox = true;
          _indexOfLoadingBox = index;
        },
      );
      final result = await lootBoxService.openBox(index);
      setState(
        () {
          _isLoadingOpenBox = false;
          _indexOfLoadingBox = null;
        },
      );
      if (result == null && mounted) {
        showErrorDialog(context,
            "Vous n'avez pas assez d'argent pour vous procurer cette Loot Box.");
      } else if (result == false && mounted) {
        showErrorDialog(context,
            "Vous possèdez déjà l'item obtenu. Vous recevrez le prix de la lootBox en retour dans votre compte.");
      } else if (mounted) {
        openLootBoxWinDialog(result, context);
      }
    } catch (e) {
      if (mounted) showErrorDialog(context, getCustomError(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return userState.when(data: (user) {
      return lootBoxes.isEmpty
          ? Center(child: ThemedProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(8.0),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    Align(
                      alignment: Alignment.topRight,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: colorScheme.primary,
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(
                            color: colorScheme.tertiary
                                .withValues(alpha: 0.3), // Border color
                            width: 2, // Border width
                          ),
                          boxShadow: [
                            BoxShadow(
                              color:
                                  colorScheme.tertiary.withValues(alpha: 0.3),
                              spreadRadius: 2,
                              blurRadius: 10,
                            ),
                          ],
                        ),
                        child: Text(
                          "Facteur de pitié : ${user?.pity} %",
                          style: TextStyle(color: colorScheme.onPrimary),
                        ),
                      ),
                    ),
                    ...lootBoxes.asMap().entries.map((entry) {
                      final index = entry.key;
                      final container = entry.value;
                      return Column(
                        children: [
                          Text(
                            "${container.image} ${container.price} coins",
                            style: TextStyle(
                              color: colorScheme.onPrimary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Container(
                            margin: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: colorScheme.primary,
                              borderRadius: BorderRadius.circular(30),
                              border: Border.all(
                                color: colorScheme.tertiary
                                    .withValues(alpha: 0.3), // Border color
                                width: 2, // Border width
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: colorScheme.tertiary
                                      .withValues(alpha: 0.3),
                                  spreadRadius: 2,
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            // listView of rewards
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              child: Column(
                                children: [
                                  SizedBox(
                                    width: 800,
                                    height: 132,
                                    child: ListView.separated(
                                      padding: const EdgeInsets.all(8),
                                      scrollDirection: Axis.horizontal,
                                      itemCount: container.rewards.length,
                                      separatorBuilder: (context, index) =>
                                          SizedBox(
                                        width: 16,
                                      ),
                                      itemBuilder: (context, index) {
                                        final reward = container.rewards[index];
                                        return Container(
                                          width: 100,
                                          height: 100,
                                          decoration:
                                              getDecoration(reward.rarity),
                                          padding: const EdgeInsets.all(8),
                                          alignment: Alignment.center,
                                          child: Column(
                                            children: [
                                              reward.value is String &&
                                                      reward.type !=
                                                          RewardType.Theme
                                                  ? ClipOval(
                                                      child: Image.network(
                                                        reward.value,
                                                        fit: BoxFit.scaleDown,
                                                        width:
                                                            80, // Specify width
                                                        height:
                                                            80, // Specify height
                                                      ),
                                                    )
                                                  : reward.type ==
                                                          RewardType.Theme
                                                      ? getContainer(
                                                          reward.value)
                                                      : Container(
                                                          width: 80,
                                                          height: 80,
                                                          decoration: BoxDecoration(
                                                              shape: BoxShape
                                                                  .circle,
                                                              color: colorScheme
                                                                  .primary),
                                                          child: FittedBox(
                                                            fit: BoxFit.none,
                                                            child: SvgPicture
                                                                .string(
                                                              getCoinSvg(
                                                                  reward.value),
                                                              colorFilter:
                                                                  ColorFilter.mode(
                                                                      colorScheme
                                                                          .onPrimary,
                                                                      BlendMode
                                                                          .srcIn),
                                                            ),
                                                          ),
                                                        ),
                                              Text(
                                                "${reward.odds} %",
                                                style: TextStyle(
                                                  color: colorScheme.onPrimary,
                                                  fontWeight: reward.rarity !=
                                                          RewardRarity.Common
                                                      ? FontWeight.bold
                                                      : null,
                                                ),
                                              ),
                                            ],
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                  // ouvrir pour button
                                  Divider(
                                      indent: 64, endIndent: 64, thickness: 2),
                                  GestureDetector(
                                    onTap: _isLoadingOpenBox
                                        ? null
                                        : () {
                                            openBox(index);
                                          },
                                    child: Container(
                                      margin: const EdgeInsets.only(top: 8),
                                      width: 200,
                                      height:
                                          50, // Fixed height for medium button
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8), // Padding for content
                                      decoration: BoxDecoration(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .primary, // Background color
                                        border: Border.all(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .tertiary, // Border color
                                          width: 3,
                                        ),
                                        borderRadius: BorderRadius.circular(
                                            50), // Rounded corners
                                      ),
                                      alignment: Alignment.center,
                                      child: _isLoadingOpenBox &&
                                              _indexOfLoadingBox == index
                                          ? ThemedProgressIndicator()
                                          : Text(
                                              "Ouvrir pour ${container.price} coins", // Button text
                                              style: TextStyle(
                                                fontSize: 14,
                                                color: Theme.of(context)
                                                    .colorScheme
                                                    .onPrimary, // Text color
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      );
                    })
                  ],
                ),
              ),
            );
    }, loading: () {
      return Center(
        child: ThemedProgressIndicator(),
      );
    }, error: (error, stack) {
      return Center(
        child: Text('Error: $error'),
      );
    });
  }
}
