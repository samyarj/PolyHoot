class User {
  final String avatarEquipped;
  final String borderEquipped;
  final int coins;
  final Map<String, dynamic> config;
  final String languageEquipped;
  final String themeEquipped;
  final List<dynamic> cxnLogs;
  final String email;
  final List<dynamic> friendRequests;
  final List<dynamic> friends;
  final Map<String, List<dynamic>> inventory;
  final bool isOnline;
  final List<dynamic> joinedChannels;
  final int nWins;
  final int nbBan;
  final int nbReport;
  final int pity;
  final List<dynamic> playedGameLogs;
  final String role;
  final String uid;
  final dynamic unBanDate;
  final String username;

  User({
    required this.avatarEquipped,
    required this.borderEquipped,
    required this.coins,
    required this.config,
    required this.languageEquipped,
    required this.themeEquipped,
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
      avatarEquipped: json['avatarEquipped'] as String,
      borderEquipped: json['borderEquipped'] as String,
      coins: json['coins'] as int,
      config: json['config'] as Map<String, dynamic>,
      languageEquipped: json['languageEquipped'] as String,
      themeEquipped: json['themeEquipped'] as String,
      cxnLogs: json['cxnLogs'] as List<dynamic>,
      email: json['email'] as String,
      friendRequests: json['friendRequests'] as List<dynamic>,
      friends: json['friends'] as List<dynamic>,
      inventory: json['inventory'] as Map<String, List<dynamic>>,
      isOnline: json['isOnline'] as bool,
      joinedChannels: json['joinedChannels'] as List<dynamic>,
      nWins: json['nWins'] as int,
      nbBan: json['nbBan'] as int,
      nbReport: json['nbReport'] as int,
      pity: json['pity'] as int,
      playedGameLogs: json['playedGameLogs'] as List<dynamic>,
      role: json['role'] as String,
      uid: json['uid'] as String,
      unBanDate: json['unBanDate'],
      username: json['username'] as String,
    );
  }
}