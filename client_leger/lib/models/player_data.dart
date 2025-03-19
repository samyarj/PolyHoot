class PlayerData {
  String name;
  int points;
  int noBonusesObtained;
  bool isInGame;

  PlayerData({
    required this.name,
    required this.points,
    required this.noBonusesObtained,
    required this.isInGame,
  });

  factory PlayerData.fromJson(Map<String, dynamic> json) {
    return PlayerData(
      name: json['name'],
      points: json['points'],
      noBonusesObtained: json['noBonusesObtained'],
      isInGame: json['isInGame'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'points': points,
      'noBonusesObtained': noBonusesObtained,
      'isInGame': isInGame,
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
