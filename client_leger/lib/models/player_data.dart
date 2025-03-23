import 'package:client_leger/models/chance/reward.dart';

class PlayerData {
  String name;
  int points;
  int noBonusesObtained;
  bool isInGame;
  String? equippedAvatar; // pic link (for result page)
  String? equippedBanner; // pic link (for result page)
  Reward? reward; // for result page (for result page)

  PlayerData({
    required this.name,
    required this.points,
    required this.noBonusesObtained,
    required this.isInGame,
    required this.equippedAvatar,
    required this.equippedBanner,
    required this.reward,
  });

  factory PlayerData.fromJson(Map<String, dynamic> json) {
    return PlayerData(
      name: json['name'],
      points: json['points'],
      noBonusesObtained: json['noBonusesObtained'],
      isInGame: json['isInGame'],
      equippedAvatar: json['equippedAvatar'],
      equippedBanner: json['equippedBanner'],
      reward: json['reward'] != null ? Reward.fromJson(json['reward']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'points': points,
      'noBonusesObtained': noBonusesObtained,
      'isInGame': isInGame,
      'equippedAvatar': equippedAvatar,
      'equippedBanner': equippedBanner,
      'reward': reward?.toJson(),
    };
  }
}

class PlayerDetails {
  String name;
  String avatar;
  String? banner;

  PlayerDetails({
    required this.name,
    required this.avatar,
    this.banner,
  });

  factory PlayerDetails.fromJson(Map<String, dynamic> json) {
    return PlayerDetails(
      name: json['name'],
      avatar: json['avatar'],
      banner: json['banner'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'avatar': avatar,
      if (banner != null) 'banner': banner,
    };
  }
}
