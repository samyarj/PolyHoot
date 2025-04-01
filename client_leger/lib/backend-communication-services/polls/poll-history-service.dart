import 'dart:async';
import 'dart:convert';
import 'package:client_leger/utilities/logger.dart';
import 'package:http/http.dart' as http;
import 'package:client_leger/environment_config.dart';
import 'package:client_leger/models/polls/published-poll-model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class PollHistoryService extends ChangeNotifier {
  // Singleton pattern implementation
  static final PollHistoryService _instance = PollHistoryService._internal();

  factory PollHistoryService() {
    return _instance;
  }

  PollHistoryService._internal() {
    AppLogger.w(
        "PollHistoryService initialized about to call initializeStream");
    initializeStream();
  }

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  List<PublishedPoll> _publishedPolls = [];
  bool _isLoading = true;
  StreamSubscription<QuerySnapshot>?
      _subscription; // stream des published polls

  List<PublishedPoll> get allPublishedPolls => _publishedPolls;
  List<PublishedPoll> get expiredPolls =>
      _publishedPolls.where((poll) => poll.expired).toList();
  bool get isLoading => _isLoading;
  bool get hasExpiredPolls => expiredPolls.isNotEmpty;
  bool get hasPlayerPolls => playerPolls.isNotEmpty;

  List<String> playerPollsAnsweredCache = [];

  initializePlayerPollsAnswered(List<String>? playerPollsAnswered) {
    if (playerPollsAnswered == null) {
      return;
    }
    playerPollsAnsweredCache = playerPollsAnswered;
  }

  List<PublishedPoll> get playerPolls {
    AppLogger.w("WE ARE GETTING PLAYERPOLLS");
    return _publishedPolls.where((poll) {
      return !poll.expired && !playerPollsAnsweredCache.contains(poll.id);
    }).toList()
      ..sort((a, b) {
        final dateA =
            DateTime.tryParse(a.endDate ?? '')?.millisecondsSinceEpoch ?? 0;
        final dateB =
            DateTime.tryParse(b.endDate ?? '')?.millisecondsSinceEpoch ?? 0;
        return dateA - dateB; // Tri ascendant (plus petite date en premier)
      });
  }

  void initializeStream() {
    AppLogger.e("in initializeStream");
    _subscription?.cancel();

    _isLoading = true;
    notifyListeners();

    _subscription = _firestore
        .collection('publishedPolls')
        .orderBy('publicationDate', descending: true)
        .snapshots()
        .listen((snapshot) {
      AppLogger.w(
          "Poll history stream received ${snapshot.docs.length} documents");
      _publishedPolls = snapshot.docs.map((doc) {
        Map<String, dynamic> data = doc.data();
        data['id'] = doc.id;
        return PublishedPoll.fromJson(data);
      }).toList();

      _isLoading = false;
      notifyListeners();
    }, onError: (error) {
      print("Error in poll history stream: $error");
      _isLoading = false;
      notifyListeners();
    });
  }

  Stream<List<PublishedPoll>> watchPublishedPolls() {
    final controller = StreamController<List<PublishedPoll>>();

    if (!_isLoading) {
      controller.add(_publishedPolls);
    }

    void listener() {
      if (!controller.isClosed) {
        controller.add(_publishedPolls);
      }
    }

    addListener(listener);

    controller.onCancel = () {
      removeListener(listener);
      controller.close();
    };

    return controller.stream;
  }

  Future<void> deleteAllExpiredPolls() async {
    try {
      final QuerySnapshot querySnapshot = await _firestore
          .collection('publishedPolls')
          .where('expired', isEqualTo: true)
          .get();

      if (querySnapshot.docs.isEmpty) {
        return;
      }

      final WriteBatch batch = _firestore.batch();

      for (final DocumentSnapshot doc in querySnapshot.docs) {
        batch.delete(doc.reference);
      }

      await batch.commit();
    } catch (e) {
      throw Exception("Failed to delete expired polls: $e");
    }
  }

  // pour player -- quand il submit le poll
  sendAnsweredPlayerPoll(
      List<int> playerAnswer, String? pollId, String? userUid) async {
        
    if (pollId == null || userUid == null) {
      return;
    }

    AppLogger.w(
        "about to send patch poll answer playeranswer is $playerAnswer");

    final response = await http.patch(
      Uri.parse("${EnvironmentConfig.serverUrl}/published-polls/$pollId"),
      headers: {
        "Content-Type": "application/json",
      },
      body: utf8.encode(jsonEncode(playerAnswer)),
    );

    if (response.statusCode == 200) {
      AppLogger.w(
          "Poll answer sent successfully, received response: ${response.body}");
      await updateUserPollsAnswered(pollId, userUid);
    } else {
      AppLogger.e("Failed to send poll answer: ${response.statusCode}");
      throw Exception("Erreur lors de l'envoi du résultat du sondage");
    }
  }

  updateUserPollsAnswered(String? pollId, String userUid) async {
    if (pollId == null) {
      AppLogger.e("Poll ID is null");
      return;
    }

    final response = await http.patch(
      Uri.parse(
          "${EnvironmentConfig.serverUrl}/published-polls/$userUid/addPollsAnswered"),
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonEncode({"id": pollId}),
    );

    if (response.statusCode == 200) {
      AppLogger.w(
          "User polls answered updated successfully, will update cache");
      playerPollsAnsweredCache.add(pollId);
    } else {
      AppLogger.e(
          "Failed to update user polls answered: ${response.statusCode}");
      throw Exception("Erreur lors de la mise à jour des sondages répondus");
    }
  }

  void cancelSub() {
    AppLogger.w("PollHistory : canceling stream subscription");
    _subscription?.cancel();
  }
}
