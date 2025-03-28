import 'dart:async';

import 'package:client_leger/backend-communication-services/error-handlers/global_error_handler.dart';
import 'package:client_leger/backend-communication-services/firend-system/friend-service.dart';
import 'package:client_leger/models/user.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final adminUsersProvider =
    StateNotifierProvider<AdminUsersNotifier, AdminUsersState>((ref) {
  return AdminUsersNotifier();
});

class AdminUsersState {
  final List<UserWithId> users;
  final bool isLoading;
  final String errorMessage;
  final String searchTerm;

  AdminUsersState({
    required this.users,
    required this.isLoading,
    required this.errorMessage,
    required this.searchTerm,
  });

  AdminUsersState copyWith({
    List<UserWithId>? users,
    bool? isLoading,
    String? errorMessage,
    String? searchTerm,
  }) {
    return AdminUsersState(
      users: users ?? this.users,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      searchTerm: searchTerm ?? this.searchTerm,
    );
  }
}

class AdminUsersNotifier extends StateNotifier<AdminUsersState> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  StreamSubscription<QuerySnapshot>? _usersSubscription;

  AdminUsersNotifier()
      : super(AdminUsersState(
          users: [],
          isLoading: true,
          errorMessage: '',
          searchTerm: '',
        )) {
    AppLogger.i("AdminUsersNotifier initialized");
    _setupListeners();
  }

  void _setupListeners() {
    _listenToUsers();
  }

  void _listenToUsers() {
    _usersSubscription?.cancel();
    final query = state.searchTerm.isEmpty
        ? _firestore.collection('users')
        : _firestore
            .collection('users')
            .where('username', isGreaterThanOrEqualTo: state.searchTerm)
            .where('username',
                isLessThanOrEqualTo: state.searchTerm + '\uf8ff');
    _usersSubscription = query.snapshots().listen(
      (snapshot) {
        try {
          final users = snapshot.docs
              .map((doc) {
                try {
                  final data = doc.data();

                  if (data.isEmpty) {
                    // we should not enter here, but just in case
                    AppLogger.e("User data is empty for doc: ${doc.id}");
                    return null;
                  }

                  final user = User.fromJson(data);

                  return UserWithId(
                    user: user,
                    id: doc.id,
                  );
                } catch (e) {
                  return null;
                }
              })
              .where((item) => item != null && item.user.role != 'admin')
              .cast<UserWithId>()
              .toList();

          state = state.copyWith(
            users: users,
            isLoading: false,
          );
        } catch (e) {
          state = state.copyWith(
            errorMessage: "Error processing user data: ${getCustomError(e)}",
            isLoading: false,
          );
        }
      },
      onError: (error) {
        state = state.copyWith(
          errorMessage: getCustomError(error),
          isLoading: false,
        );
      },
    );
  }

  void setSearchTerm(String searchTerm) {
    state = state.copyWith(
      searchTerm: searchTerm,
      isLoading: true,
    );
    AppLogger.i("Search term updated: $searchTerm");
    _listenToUsers();
  }

  Future<void> banUser(String userId, int minutesDuration) async {
    try {
      // Get user document
      final userQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: userId)
          .get();

      if (userQuery.docs.isEmpty) {
        throw Exception("User not found");
      }

      final userDoc = userQuery.docs.first;

      // Calculate unban date
      final now = DateTime.now();
      final unbanDate = now.add(Duration(minutes: minutesDuration));

      // Update user document with ban information
      await userDoc.reference.update({
        'nbBan': FieldValue.increment(1),
        'unBanDate': Timestamp.fromDate(unbanDate),
      });

      AppLogger.i("User $userId banned until $unbanDate");
    } catch (e) {
      AppLogger.e("Error banning user: $e");
      throw Exception(getCustomError(e));
    }
  }

  // Unban a user
  Future<void> unbanUser(String userId) async {
    try {
      // Get user document
      final userQuery = await _firestore
          .collection('users')
          .where('uid', isEqualTo: userId)
          .get();

      if (userQuery.docs.isEmpty) {
        throw Exception("User not found");
      }

      final userDoc = userQuery.docs.first;

      // Update user document to remove ban
      await userDoc.reference.update({
        'unBanDate': null,
      });

      AppLogger.i("User $userId unbanned");
    } catch (e) {
      AppLogger.e("Error unbanning user: $e");
      throw Exception(getCustomError(e));
    }
  }

  @override
  void dispose() {
    _usersSubscription?.cancel();
    AppLogger.i("AdminUsersNotifier disposed");
    super.dispose();
  }
}
