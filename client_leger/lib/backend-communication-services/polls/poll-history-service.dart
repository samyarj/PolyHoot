import 'dart:async';

import 'package:client_leger/models/polls/published-poll-model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;

class PollHistoryService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String baseUrl =
      "https://yourserver.com/api/published-polls"; // Replace with your server URL

  // Stream for real-time updates
  Stream<List<PublishedPoll>> watchPublishedPolls() {
    return _firestore.collection('publishedPolls').snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        Map<String, dynamic> data = doc.data();
        data['id'] = doc.id;
        return PublishedPoll.fromJson(data);
      }).toList();
    });
  }

  // Get a specific poll by ID
  Future<PublishedPoll> getPublishedPollById(String id) async {
    try {
      DocumentSnapshot doc =
          await _firestore.collection('publishedPolls').doc(id).get();

      if (doc.exists) {
        Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
        data['id'] = doc.id;
        return PublishedPoll.fromJson(data);
      } else {
        throw Exception("Poll not found");
      }
    } catch (e) {
      throw Exception("Failed to get poll: $e");
    }
  }

  // Delete all expired polls - HTTP request to backend
  Future<void> deleteAllExpiredPolls() async {
    try {
      final response = await http.delete(Uri.parse('$baseUrl/delete'));

      if (response.statusCode != 200) {
        throw Exception("Failed to delete expired polls");
      }
    } catch (e) {
      throw Exception("Failed to delete expired polls: $e");
    }
  }
}
