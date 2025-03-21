import 'dart:async';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_coin_svg.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_rarity_design.dart';
import 'package:client_leger/UI/luck/lootbox/lootbox_win_dialog.dart';
import 'package:client_leger/backend-communication-services/chance/lootbox_service.dart';
import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/models/chance/dailyfree.dart';
import 'package:client_leger/models/enums.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/themed_progress_indecator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class Dailyfree extends StatefulWidget {
  const Dailyfree({super.key});

  @override
  State<Dailyfree> createState() => _DailyfreeState();
}

class _DailyfreeState extends State<Dailyfree> {
  final lootBoxService = LootboxService();
  DailyFree? dailyFree;
  Timer? _timer;
  double minutesLeft = 0;
  num hoursLeft = 0;
  bool _isOpeningDailyFree = false;

  void startTimer() {
    if (_timer == null && dailyFree != null && !dailyFree!.canClaim) {
      AppLogger.i("START TIMER");
      _timer = Timer.periodic(
        const Duration(milliseconds: 12000), // 12 seconds = 0.2 minutes
        (timer) {
          AppLogger.i("Timer tick before condition");
          if (dailyFree != null && !dailyFree!.canClaim && mounted) {
            AppLogger.i("Timer tick min left = $minutesLeft");
            setState(() {
              minutesLeft -= 0.2;
              if (minutesLeft <= 0) {
                hoursLeft -= 1;
                if (hoursLeft < 0) {
                  loadDailyFree();
                }
                minutesLeft =
                    59.9999998; // So that it floors towards 59 when displayed
              }
            });
          }
        },
      );
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> loadDailyFree() async {
    try {
      if (_timer != null) {
        AppLogger.i("CANCEL TIMER");
        _timer!.cancel();
        _timer = null;
      }
      final daily = await lootBoxService.getDailyFree();
      if (!daily.canClaim) {
        hoursLeft = daily.hoursLeft;
        minutesLeft = daily.minutesLeft;
      }
      if (_isOpeningDailyFree) {
        _isOpeningDailyFree = false;
      }
      if (mounted) {
        setState(() {
          dailyFree = daily;
        });
        startTimer();
      }
    } catch (e) {
      if (mounted) showErrorDialog(context, e.toString());
    }
  }

  String getDisplayedText() {
    if (hoursLeft < 0) {
      return "Prix disponible dans moins d'une minute!";
    } else {
      if (hoursLeft > 1) {
        if (minutesLeft.floor() > 1) {
          return 'Prix disponible dans $hoursLeft heures et ${minutesLeft.floor()} minutes';
        } else if (minutesLeft.floor() == 1) {
          return 'Prix disponible dans $hoursLeft heures et ${minutesLeft.floor()} minute';
        } else {
          return 'Prix disponible dans $hoursLeft heures';
        }
      } else if (hoursLeft == 1) {
        if (minutesLeft.floor() > 1) {
          return 'Prix disponible dans $hoursLeft heure et ${minutesLeft.floor()} minutes';
        } else if (minutesLeft.floor() == 1) {
          return 'Prix disponible dans $hoursLeft heure et ${minutesLeft.floor()} minute';
        } else {
          return 'Prix disponible dans $hoursLeft heure';
        }
      } else {
        if (minutesLeft.floor() > 1) {
          return 'Prix disponible dans ${minutesLeft.floor()} minutes';
        } else if (minutesLeft.floor() == 1) {
          return 'Prix disponible dans ${minutesLeft.floor()} minute';
        } else {
          return "Prix disponible dans moins d'une minute!";
        }
      }
    }
  }

  openDailyFree() async {
    try {
      setState(
        () {
          _isOpeningDailyFree = true;
        },
      );
      final reward = await lootBoxService.openDailyFree();
      if (mounted) openLootBoxWinDialog(reward, context);
      loadDailyFree();
    } catch (e) {
      if (mounted) showErrorDialog(context, getCustomError(e));
    }
  }

  @override
  void initState() {
    loadDailyFree();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "PRIX QUOTIDIEN",
          style: TextStyle(
            fontSize: 40, // Approx. 2.5rem
            letterSpacing: 8, // Approx. 0.8rem
            fontWeight: FontWeight.w900, // Extra bold
          ),
          textAlign: TextAlign.center, // Centers it
        ),
        dailyFree == null
            ? ThemedProgressIndicator()
            : Container(
                margin: const EdgeInsets.all(64),
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
                      color: colorScheme.tertiary.withValues(alpha: 0.3),
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
                          itemCount: dailyFree!.lootbox.rewards.length,
                          separatorBuilder: (context, index) => SizedBox(
                            width: 16,
                          ),
                          itemBuilder: (context, index) {
                            final reward = dailyFree!.lootbox.rewards[index];
                            return Container(
                              width: 100,
                              height: 100,
                              decoration: getDecoration(reward.rarity),
                              margin: index == 0
                                  ? const EdgeInsets.only(left: 46)
                                  : null,
                              padding: const EdgeInsets.all(8),
                              alignment: Alignment.center,
                              child: Column(
                                children: [
                                  // daily free rewards are always money
                                  Container(
                                    width: 80,
                                    height: 80,
                                    decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: colorScheme.primary),
                                    child: Center(
                                      child: SizedBox(
                                        width: 50,
                                        height: 50,
                                        child: SvgPicture.string(
                                          getCoinSvg(reward.value),
                                          colorFilter: ColorFilter.mode(
                                              colorScheme.onPrimary,
                                              BlendMode.srcIn),
                                        ),
                                      ),
                                    ),
                                  ),
                                  Text(
                                    "${reward.odds} %",
                                    style: TextStyle(
                                      color: colorScheme.onPrimary,
                                      fontWeight:
                                          reward.rarity != RewardRarity.Common
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
                      Divider(indent: 64, endIndent: 64, thickness: 2),
                      GestureDetector(
                        onTap: dailyFree!.canClaim
                            ? () {
                                openDailyFree();
                              }
                            : null,
                        child: IntrinsicWidth(
                          child: Container(
                            margin: const EdgeInsets.only(top: 8),
                            height: 50, // Fixed height for medium button
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16), // Padding for content
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
                              borderRadius:
                                  BorderRadius.circular(50), // Rounded corners
                            ),
                            alignment: Alignment.center,
                            child: _isOpeningDailyFree
                                ? ThemedProgressIndicator()
                                : Text(
                                    dailyFree!.canClaim
                                        ? "Reclamer le prix quotidien !"
                                        : getDisplayedText(), // Button text
                                    style: TextStyle(
                                      fontSize: 20,
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onPrimary, // Text color
                                      fontWeight: FontWeight.bold,
                                    ),
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
  }
}
