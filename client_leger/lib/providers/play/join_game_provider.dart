import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/models/lobby.dart';
import 'package:client_leger/models/quiz.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final joinGameProvider =
    StateNotifierProvider.autoDispose<JoinGameNotifier, JoinGameState>((ref) {
  return JoinGameNotifier();
});

class JoinGameState {
  final List<Lobby> lobbys;
  final String popUpMessage;
  final bool gameIdValidated;
  final bool wrongPin;
  final bool gameLocked;
  final bool isJoined;
  final bool isJoining;
  final String joiningRoomId;

  JoinGameState({
    required this.lobbys,
    required this.popUpMessage,
    required this.gameIdValidated,
    required this.wrongPin,
    required this.gameLocked,
    this.isJoined = false,
    this.isJoining = false,
    this.joiningRoomId = '',
  });

  JoinGameState copyWith({
    List<Lobby>? lobbys,
    String? popUpMessage,
    bool? gameIdValidated,
    bool? wrongPin,
    bool? gameLocked,
    bool? isJoined,
    bool? isJoining,
    String? joiningRoomId,
  }) {
    return JoinGameState(
      lobbys: lobbys ?? this.lobbys,
      popUpMessage: popUpMessage ?? this.popUpMessage,
      gameIdValidated: gameIdValidated ?? this.gameIdValidated,
      wrongPin: wrongPin ?? this.wrongPin,
      gameLocked: gameLocked ?? this.gameLocked,
      isJoined: isJoined ?? this.isJoined,
      isJoining: isJoining ?? this.isJoining,
      joiningRoomId: joiningRoomId ?? this.joiningRoomId,
    );
  }
}

class JoinGameNotifier extends StateNotifier<JoinGameState> {
  final WebSocketManager _socketManager = WebSocketManager.instance;

  JoinGameNotifier()
      : super(JoinGameState(
          lobbys: [],
          popUpMessage: '',
          gameIdValidated: false,
          wrongPin: false,
          gameLocked: false,
          isJoined: false,
          isJoining: false,
          joiningRoomId: '',
        )) {
    AppLogger.i("JoinGameService initialized");
    _setupListeners();
    getAllLobbys();
  }

  void _setupListeners() {
    _socketManager.webSocketReceiver(JoinEvents.LobbyCreated.value,
        (lobbyData) {
      AppLogger.i("New lobby created: $lobbyData");
      final lobby = Lobby.fromJson(lobbyData);
      state = state.copyWith(lobbys: [...state.lobbys, lobby]);
      AppLogger.i(
          "New lobby created: ${lobby.title} (ID: ${lobby.roomId}) (Quiz: ${lobby.quiz.title})");
    });

    _socketManager.webSocketReceiver(GameEvents.End.value, (roomId) {
      state = state.copyWith(
          lobbys:
              state.lobbys.where((lobby) => lobby.roomId != roomId).toList());
      AppLogger.i("Lobby ended, removed room: $roomId");
    });

    _socketManager.webSocketReceiver(GameEvents.GetCurrentGames.value,
        (currentGames) {
      state = state.copyWith(
          lobbys:
              (currentGames as List).map((e) => Lobby.fromJson(e)).toList());
      AppLogger.i("Received active lobbies: ${state.lobbys.length} available");
    });

    _socketManager.webSocketReceiver(GameEvents.AlertLockToggled.value, (data) {
      state = state.copyWith(
        lobbys: state.lobbys.map((lobby) {
          return lobby.roomId == data['roomId']
              ? lobby.copyWith(isLocked: data['isLocked'])
              : lobby;
        }).toList(),
      );
      AppLogger.i(
          "Lobby lock toggled: Room ${data['roomId']} → Locked: ${data['isLocked']}");
    });

    _socketManager.webSocketReceiver(JoinEvents.JoinSuccess.value, (data) {
      state = state.copyWith(
        lobbys: state.lobbys.map((lobby) {
          return lobby.roomId == data['roomId']
              ? lobby.copyWith(nbPlayers: lobby.nbPlayers + 1)
              : lobby;
        }).toList(),
      );
      AppLogger.i(
          "Player joined room: ${data['roomId']} (Total: ${state.lobbys.firstWhere((l) => l.roomId == data['roomId']).nbPlayers} players)");
    });

    _socketManager.webSocketReceiver(GameEvents.PlayerLeft.value, (data) {
      state = state.copyWith(
        lobbys: state.lobbys.map((lobby) {
          return lobby.roomId == data['roomId']
              ? lobby.copyWith(nbPlayers: lobby.nbPlayers - 1)
              : lobby;
        }).toList(),
      );
      AppLogger.i(
          "Player left room: ${data['roomId']} (Remaining: ${state.lobbys.firstWhere((l) => l.roomId == data['roomId']).nbPlayers} players)");
    });

    _socketManager.webSocketReceiver(JoinErrors.InvalidId.value, (_) {
      _showPopUp("Le code d'accès est invalide. Essayez à nouveau.");
      state = state.copyWith(isJoining: false, joiningRoomId: '');
      AppLogger.e("Invalid game ID entered");
    });

    _socketManager.webSocketReceiver(JoinErrors.RoomLocked.value, (_) {
      _showPopUp(
          "La partie est verrouillée. Veuillez demander l'accès à l'organisateur ou essayez un autre code.");
      state = state.copyWith(isJoining: false, joiningRoomId: '');
      AppLogger.e("Room is locked, cannot join");
    });

    _socketManager.webSocketReceiver(JoinErrors.BannedName.value, (_) {
      _showPopUp("Vous avez été banni de cette partie.");
      state = state.copyWith(isJoining: false, joiningRoomId: '');
      AppLogger.e("Player name is banned");
    });

    _socketManager.webSocketReceiver(JoinEvents.ValidId.value, (gameId) {
      final playerName = WebSocketManager.instance.playerName;
      state = state.copyWith(
          gameIdValidated: true, wrongPin: false, popUpMessage: '');
      final data = {"gameId": gameId, "playerName": playerName};
      AppLogger.i("Attempting to join game: $gameId as $playerName");
      _socketManager.webSocketSender(JoinEvents.Join.value, data);
    });

    _socketManager.webSocketReceiver(JoinEvents.CanJoin.value, (data) {
      AppLogger.i("Player can join game: $data we set room id");
      final roomId = data['gameId'];
      _socketManager.setRoomId(roomId);
      _socketManager.isOrganizer = false;
      state = state.copyWith(isJoined: true);
      AppLogger.i("Player joined successfully → Room ID: ${data['gameId']}");
    });
  }

  void validGameId(String gameId) {
    state = state.copyWith(isJoining: true, joiningRoomId: gameId);
    AppLogger.i("Validating game ID: $gameId");
    _socketManager.webSocketSender(JoinEvents.ValidateGameId.value, gameId);
  }

  void getAllLobbys() {
    AppLogger.i("Fetching all available lobbies...");
    _socketManager.webSocketSender(GameEvents.GetCurrentGames.value);
  }

  Quiz getQuizByTitle(String quizTitle) {
    AppLogger.w("Fetching quiz by title: $quizTitle");

    final lobby = state.lobbys.firstWhere(
      (lobby) => lobby.quiz.title == quizTitle,
    );

    return lobby.quiz;
  }

  void resetAttributes() {
    state = state.copyWith(
      popUpMessage: '',
      gameIdValidated: false,
      wrongPin: false,
      gameLocked: false,
      isJoined: false,
      isJoining: false,
    );
  }

  @override
  void dispose() {
    if (!mounted) return;
    AppLogger.i("Disposing JoinGameService");
    _socketManager.socket?.off(JoinEvents.LobbyCreated.value);
    _socketManager.socket?.off(GameEvents.End.value);
    _socketManager.socket?.off(GameEvents.GetCurrentGames.value);
    _socketManager.socket?.off(GameEvents.AlertLockToggled.value);
    _socketManager.socket?.off(JoinEvents.JoinSuccess.value);
    _socketManager.socket?.off(GameEvents.PlayerLeft.value);
    _socketManager.socket?.off(JoinErrors.InvalidId.value);
    _socketManager.socket?.off(JoinErrors.RoomLocked.value);
    _socketManager.socket?.off(JoinErrors.BannedName.value);
    _socketManager.socket?.off(JoinEvents.ValidId.value);
    _socketManager.socket?.off(JoinEvents.CanJoin.value);

    resetAttributes();
    super.dispose();
  }

  void _showPopUp(String message) {
    state = state.copyWith(popUpMessage: message, wrongPin: true);
    AppLogger.w("Popup displayed: $message");

    Future.delayed(const Duration(seconds: 3), () {
      state = state.copyWith(wrongPin: false, popUpMessage: '');
      AppLogger.i("Popup dismissed");
    });
  }
}
