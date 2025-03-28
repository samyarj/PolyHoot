import 'package:client_leger/models/game-log-entry-model.dart';
import 'package:client_leger/models/stats-related/stats.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class User {
  final String? avatarEquipped;
  final String? borderEquipped;
  final int? coins;
  final Map<String, dynamic>? config;
  final List<Map<String, dynamic>>? cxnLogs;
  final String email;
  final List<String>? friendRequests;
  final List<String>? friends;
  final List<GameLogEntry>? gameLogs; // Added
  final Map<String, dynamic>? inventory;
  final bool? isOnline;
  final List<String>? joinedChannels;
  final int? nGames; // Added
  final int? nWins;
  final int? nbBan;
  final int? nbReport;
  final DateTime? nextDailyFree; // Added
  final int? pity;
  final List<String>? playedGameLogs;
  final String? role;
  final Stats? stats; // Added
  final String uid;
  final Timestamp? unBanDate;
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
    required this.gameLogs, // Added
    required this.inventory,
    required this.isOnline,
    required this.joinedChannels,
    required this.nGames, // Added
    required this.nWins,
    required this.nbBan,
    required this.nbReport,
    required this.nextDailyFree, // Added
    required this.pity,
    required this.playedGameLogs,
    required this.role,
    required this.stats, // Added
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
      cxnLogs: (json['cxnLogs'] as List<dynamic>?)
          ?.map((e) => e as Map<String, dynamic>)
          .toList(),
      email: json['email'] as String,
      friendRequests: (json['friendRequests'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      friends:
          (json['friends'] as List<dynamic>?)?.map((e) => e as String).toList(),
      gameLogs: (json['gameLogs'] as List<dynamic>?) // Added
              ?.map((e) => GameLogEntry.fromJson(e))
              .toList() ??
          [],
      inventory: json['inventory'] as Map<String, dynamic>?,
      isOnline: json['isOnline'] as bool?,
      joinedChannels: (json['joinedChannels'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      nGames: json['nGames'] as int?, // Added
      nWins: json['nWins'] as int?,
      nbBan: json['nbBan'] as int?,
      nbReport: json['nbReport'] as int?,
      nextDailyFree: json['nextDailyFree'] != null // Added
          ? DateTime.fromMillisecondsSinceEpoch(
              json['nextDailyFree'].millisecondsSinceEpoch)
          : null,
      pity: json['pity'] as int?,
      playedGameLogs: (json['playedGameLogs'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      role: json['role'] as String?,
      stats:
          json['stats'] != null ? Stats.fromJson(json['stats']) : null, // Added
      uid: json['uid'] as String,
      unBanDate:
          json['unBanDate'] != null ? json['unBanDate'] as Timestamp : null,
      username: json['username'] as String,
    );
  }
}

class PartialUser {
  // partial user for the chats (to save space)
  final String uid;
  final String? username;
  final String? avatarEquipped;
  final String? borderEquipped;
  final bool isAdmin;

  PartialUser(
      {required this.uid,
      required this.isAdmin,
      this.avatarEquipped,
      this.borderEquipped,
      this.username});

  // Factory constructor to create a PartialUser from a full User map
  factory PartialUser.fromJson(Map<String, dynamic> data) {
    return PartialUser(
      uid: data['uid'],
      avatarEquipped: data['avatarEquipped'],
      borderEquipped: data['borderEquipped'],
      username: data['username'],
      isAdmin: data['role'] == 'player' ? false : true,
    );
  }
}
