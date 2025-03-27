import 'dart:async';

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
    _initializeStream();
  }

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  List<PublishedPoll> _publishedPolls = [];
  bool _isLoading = true;
  StreamSubscription<QuerySnapshot>? _subscription;

  List<PublishedPoll> get allPublishedPolls => _publishedPolls;
  List<PublishedPoll> get expiredPolls =>
      _publishedPolls.where((poll) => poll.expired).toList();
  bool get isLoading => _isLoading;
  bool get hasExpiredPolls => expiredPolls.isNotEmpty;

  void _initializeStream() {
    _subscription?.cancel();

    _isLoading = true;
    notifyListeners();

    _subscription = _firestore
        .collection('publishedPolls')
        .orderBy('publicationDate', descending: true)
        .snapshots()
        .listen((snapshot) {
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

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
