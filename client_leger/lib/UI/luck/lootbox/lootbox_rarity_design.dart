import 'package:client_leger/models/enums.dart';
import 'package:flutter/material.dart';

BoxDecoration getDecoration(RewardRarity rarity) {
  switch (rarity) {
    case RewardRarity.VeryRare:
      return BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFCC00), Color(0xFFFF66FF), Color(0xFF6600FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
      );
    case RewardRarity.Rare:
      return BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0099FF), Color(0xFF0066CC), Color(0xFF003399)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
      );
    case RewardRarity.Common:
      return BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFBBBBBB), Color(0xFF999999), Color(0xFF777777)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
      );
  }
}
