import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final waitingPageProvider =
    StateNotifierProvider<WaitingPageNotifier, WaitingPageState>((ref) {
  return WaitingPageNotifier(WebSocketManager.instance);
});

class WaitingPageState {
  final List<String> players;
  final bool gameLocked;
  final String gameTitle;
  final int? time;
  final bool banned;
  final bool organizerDisconnected;
  final bool timerEnded;

  WaitingPageState({
    required this.players,
    required this.gameLocked,
    required this.gameTitle,
    required this.time,
    required this.banned,
    required this.organizerDisconnected,
    required this.timerEnded,
  });

  WaitingPageState copyWith({
    List<String>? players,
    bool? gameLocked,
    String? gameTitle,
    int? time,
    bool? banned,
    bool? organizerDisconnected,
    bool? timerEnded,
  }) {
    return WaitingPageState(
      players: players ?? this.players,
      gameLocked: gameLocked ?? this.gameLocked,
      gameTitle: gameTitle ?? this.gameTitle,
      time: time ?? this.time,
      banned: banned ?? this.banned,
      organizerDisconnected:
          organizerDisconnected ?? this.organizerDisconnected,
      timerEnded: timerEnded ?? this.timerEnded,
    );
  }
}

class WaitingPageNotifier extends StateNotifier<WaitingPageState> {
  final WebSocketManager _socketManager;

  WaitingPageNotifier(this._socketManager)
      : super(WaitingPageState(
          players: [],
          gameLocked: false,
          gameTitle: "",
          time: null,
          banned: false,
          organizerDisconnected: false,
          timerEnded: false,
        )) {
    _initializeListeners();
  }

  void _initializeListeners() {
    _socketManager.webSocketReceiver(GameEvents.PlayerLeft.value, (data) {
      if (data is Map<String, dynamic> && data.containsKey('playerNames')) {
        final List<String> updatedPlayers =
            List<String>.from(data['playerNames'] as List);
        state = state.copyWith(players: updatedPlayers);
        AppLogger.i("Players updated: ${state.players}");
      } else {
        AppLogger.w("Invalid or missing data for PlayerLeft event.");
      }
    });

    _socketManager.webSocketReceiver(JoinEvents.JoinSuccess.value, (data) {
      if (data is Map<String, dynamic> && data.containsKey('playerNames')) {
        final List<String> updatedPlayers =
            List<String>.from(data['playerNames'] as List);
        state = state.copyWith(players: updatedPlayers);
        AppLogger.i("Players updated: ${state.players}");
      } else {
        AppLogger.w("Invalid or missing data for JoinSuccess event.");
      }
    });

    _socketManager.webSocketReceiver(GameEvents.PlayerBanned.value, (_) {
      state = state.copyWith(banned: true);
      resetAttributes();
      AppLogger.i("Player was banned");
    });

    _socketManager.webSocketReceiver(DisconnectEvents.OrganizerHasLeft.value,
        (_) {
      state = state.copyWith(organizerDisconnected: true);
      resetAttributes();
      AppLogger.i("Organizer has left");
    });

    _socketManager.webSocketReceiver(GameEvents.AlertLockToggled.value, (data) {
      state = state.copyWith(gameLocked: data['isLocked']);
      AppLogger.i("Game lock status: ${state.gameLocked}");
    });

    _socketManager.webSocketReceiver(TimerEvents.GameCountdownValue.value,
        (data) {
      state = state.copyWith(time: data);
      AppLogger.i("Countdown time: ${state.time}");
    });

    _socketManager.webSocketReceiver(TimerEvents.GameCountdownEnd.value, (_) {
      state = state.copyWith(timerEnded: true);
      if (state.players.isNotEmpty) {
        startGame();
      }
      resetAttributes();
      AppLogger.i("Game countdown ended");
    });

    _socketManager.webSocketReceiver(GameEvents.Title.value, (data) {
      state = state.copyWith(gameTitle: data);
      AppLogger.i("Game title received: ${state.gameTitle}");
    });
  }

  void toggleGameLock() {
    _socketManager.webSocketSender(GameEvents.ToggleLock.value);
  }

  void leaveWaitingPageAsOrganizer() {
    _socketManager
        .webSocketSender(DisconnectEvents.OrganizerDisconnected.value);
    resetAttributes();
  }

  void leaveWaitingPageAsPlayer() {
    _socketManager.webSocketSender(DisconnectEvents.Player.value);
    resetAttributes();
  }

  void banPlayer(String playerName) {
    _socketManager.webSocketSender(GameEvents.PlayerBan.value, playerName);
  }

  void startGame() {
    _socketManager.webSocketSender(GameEvents.StartGame.value);
  }

  void startGameCountdown(int time) {
    _socketManager.webSocketSender(GameEvents.StartGameCountdown.value, time);
  }

  void resetAttributes() {
    state = WaitingPageState(
      players: [],
      gameLocked: false,
      gameTitle: '',
      time: null,
      banned: false,
      organizerDisconnected: false,
      timerEnded: false,
    );
  }
}
