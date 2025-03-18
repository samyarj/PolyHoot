import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/utilities/logger.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final coinflipProvider =
    StateNotifierProvider.autoDispose<CoinflipNotifier, CoinflipState>((ref) {
  return CoinflipNotifier();
});

class CoinflipState {
  final CoinFlipGameState gameState;
  final String selectedSide;
  final String winningSide;
  int betAmount;
  bool submitted;
  final double time;
  final Map<String, List<Map<String, dynamic>>> playerList;
  final List<String> history;

  CoinflipState(
      {required this.gameState,
      required this.selectedSide,
      required this.winningSide,
      required this.betAmount,
      required this.submitted,
      required this.time,
      required this.playerList,
      required this.history});

  CoinflipState copyWith({
    CoinFlipGameState? gameState,
    String? selectedSide,
    String? winningSide,
    int? betAmount,
    bool? submitted,
    double? time,
    Map<String, List<Map<String, dynamic>>>? playerList,
    List<String>? history,
  }) {
    return CoinflipState(
      gameState: gameState ?? this.gameState,
      selectedSide: selectedSide ?? this.selectedSide,
      winningSide: winningSide ?? this.winningSide,
      betAmount: betAmount ?? this.betAmount,
      submitted: submitted ?? this.submitted,
      time: time ?? this.time,
      playerList: playerList ?? this.playerList,
      history: history ?? this.history,
    );
  }
}

class CoinflipNotifier extends StateNotifier<CoinflipState> {
  final WebSocketManager _socketManager = WebSocketManager.instance;

  CoinflipNotifier()
      : super(CoinflipState(
          gameState: CoinFlipGameState.BettingPhase,
          selectedSide: '',
          winningSide: '',
          betAmount: 0,
          submitted: false,
          time: 0,
          playerList: {'heads': [], 'tails': []},
          history: [],
        )) {
    AppLogger.i("CoinflipNotifier initialization");
    initializeEventListeners();
    getState();
  }

  selectSide(String side) {
    AppLogger.i("selectSide $side");
    state = state.copyWith(selectedSide: side);
  }

  resetAttributes() {
    AppLogger.i("resetAttributes");
    state = state.copyWith(
      gameState: CoinFlipGameState.BettingPhase,
      selectedSide: '',
      winningSide: '',
      betAmount: 0,
      submitted: false,
      time: 0,
    );
  }

  getState() {
    AppLogger.i("getState");

    _socketManager.webSocketSender(
      CoinFlipEvents.JoinGame.value,
      null,
      (answer) => {
        AppLogger.i("$answer"),
        state = state.copyWith(
          playerList: {
            'heads':
                List<Map<String, dynamic>>.from(answer['playerList']['heads']),
            'tails':
                List<Map<String, dynamic>>.from(answer['playerList']['tails']),
          },
          history: List<String>.from(answer['history']),
          gameState: CoinFlipGameState.values.firstWhere(
            (e) => e.toString() == 'CoinFlipGameState.${answer['state']}',
          ),
        ),
      },
    );
  }

  initializeEventListeners() {
    AppLogger.i("initializeEventListeners");

    _socketManager.webSocketReceiver(
        CoinFlipEvents.StartGame.value, (_) => {resetAttributes()});

    _socketManager.webSocketReceiver(
        CoinFlipEvents.PreFlippingPhase.value,
        (_) => {
              state =
                  state.copyWith(gameState: CoinFlipGameState.PreFlippingPhase),
            });

    _socketManager.webSocketReceiver(
        CoinFlipEvents.FlippingPhase.value,
        (_) => {
              state =
                  state.copyWith(gameState: CoinFlipGameState.FlippingPhase),
            });

    _socketManager.webSocketReceiver(
        CoinFlipEvents.Results.value,
        (answer) => {
              AppLogger.i("$answer"),
              state = state.copyWith(
                playerList: {
                  'heads': List<Map<String, dynamic>>.from(
                      answer['playerList']['heads']),
                  'tails': List<Map<String, dynamic>>.from(
                      answer['playerList']['tails']),
                },
                history: List<String>.from(answer['history']),
                gameState: CoinFlipGameState.ResultsPhase,
                winningSide: answer['result'],
              )
            });

    _socketManager.webSocketReceiver(
        CoinFlipEvents.SendPlayerList.value,
        (playerList) => {
              AppLogger.i("$playerList"),
              state = state.copyWith(
                playerList: {
                  'heads': List<Map<String, dynamic>>.from(playerList['heads']),
                  'tails': List<Map<String, dynamic>>.from(playerList['tails']),
                },
              )
            });

    _socketManager.webSocketReceiver(
        CoinFlipEvents.BetTimeCountdown.value,
        (newTime) =>
            {state = state.copyWith(time: (newTime as num).toDouble()/10)});
  }

  submitBet(BuildContext context) {
    AppLogger.i("submitBet");

    showConfirmationDialog(
        context,
        "Voulez vous miser la somme de : ${state.betAmount} coins?",
        () => onSubmitBetConfirm(context));
  }

  onSubmitBetConfirm(BuildContext context) {
    AppLogger.i("onSubmitBetConfirm");

    if (state.betAmount > 0 &&
        state.betAmount % 1 == 0 &&
        state.gameState == CoinFlipGameState.BettingPhase) {
      _socketManager.webSocketSender(
          CoinFlipEvents.SubmitChoice.value,
          {'choice': state.selectedSide, 'bet': state.betAmount},
          (submitStatus) => {
                if (submitStatus)
                  {
                    state.submitted = true,
                  }
                else
                  {
                    showErrorDialog(
                      context,
                      'Vous ne pouvez pas parier plus de coins que ceux détenus ou bien parier en dehors de la phase de mise!',
                    ),
                  },
              });
    } else if (state.betAmount == 0 || state.betAmount % 1 != 0) {
      showErrorDialog(context, 'Vous ne pouvez pas parier 0 coins.');
    } else if (state.gameState != CoinFlipGameState.BettingPhase) {
      errorOutsideBettingPhase(context);
    }
  }

  errorOutsideBettingPhase(BuildContext context) {
    showErrorDialog(
        context, 'Vous ne pouvez pas parier en dehors de la phase de mise.');
  }

  updateBetAmount(int value) {
    AppLogger.i("updateBetAmount");

    if (value < 0) {
      return 0;
    }
    if (value % 1 != 0) {
      return value.ceil();
    }
    return value;
  }

  increaseBet(int amount) {
    AppLogger.i("increaseBet");

    state.betAmount += amount;
  }

  @override
  void dispose() {
    AppLogger.i("RemoveListeners");
    _socketManager.socket.off(CoinFlipEvents.StartGame.value);
    _socketManager.socket.off(CoinFlipEvents.PreFlippingPhase.value);
    _socketManager.socket.off(CoinFlipEvents.FlippingPhase.value);
    _socketManager.socket.off(CoinFlipEvents.Results.value);
    _socketManager.socket.off(CoinFlipEvents.SendPlayerList.value);
    _socketManager.socket.off(CoinFlipEvents.BetTimeCountdown.value);
    super.dispose();
  }
}
