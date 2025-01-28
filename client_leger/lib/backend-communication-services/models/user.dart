class User {
  final String? avatarEquipped;
  final String? borderEquipped;
  final int? coins;
  final Map<String, dynamic>? config;
  final List<String>? cxnLogs;
  final String email;
  final List<String>? friendRequests;
  final List<String>? friends;
  final Map<String, dynamic>? inventory;
  final bool? isOnline;
  final List<String>? joinedChannels;
  final int? nWins;
  final int? nbBan;
  final int? nbReport;
  final int? pity;
  final List<String>? playedGameLogs;
  final String? role;
  final String uid;
  final DateTime? unBanDate;
  final String username;

  User({
    required this.avatarEquipped,
    required this.borderEquipped,
    required this.coins,
    required this.config,
    required this.cxnLogs,
    required this.email,
    required this.friendRequests,
    required this.friends,
    required this.inventory,
    required this.isOnline,
    required this.joinedChannels,
    required this.nWins,
    required this.nbBan,
    required this.nbReport,
    required this.pity,
    required this.playedGameLogs,
    required this.role,
    required this.uid,
    required this.unBanDate,
    required this.username,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      avatarEquipped: json['avatarEquipped'] as String?,
      borderEquipped: json['borderEquipped'] as String?,
      coins: json['coins'] as int?,
      config: json['config'] as Map<String, dynamic>?,
      cxnLogs:
          (json['cxnLogs'] as List<dynamic>?)?.map((e) => e as String).toList(),
      email: json['email'] as String,
      friendRequests: (json['friendRequests'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      friends:
          (json['friends'] as List<dynamic>?)?.map((e) => e as String).toList(),
      inventory: json['inventory'] as Map<String, dynamic>?,
      isOnline: json['isOnline'] as bool?,
      joinedChannels: (json['joinedChannels'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      nWins: json['nWins'] as int?,
      nbBan: json['nbBan'] as int?,
      nbReport: json['nbReport'] as int?,
      pity: json['pity'] as int?,
      playedGameLogs: (json['playedGameLogs'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      role: json['role'] as String?,
      uid: json['uid'] as String,
      unBanDate:
          json['unBanDate'] != null ? DateTime.parse(json['unBanDate']) : null,
      username: json['username'] as String,
    );
  }
}
