import 'package:client_leger/UI/confirmation/confirmation_dialog.dart';
import 'package:client_leger/UI/error/error_dialog.dart';
import 'package:client_leger/backend-communication-services/socket/websocketmanager.dart';
import 'package:client_leger/utilities/socket_events.dart';
import 'package:flutter/material.dart';

class CoinflipService {
  static final CoinflipService _instance = CoinflipService._internal();

  factory CoinflipService() {
    return _instance;
  }

  CoinflipService._internal() {
    _webSocketManager = WebSocketManager.instance;
  }

  late WebSocketManager _webSocketManager;

  CoinFlipGameState gameState = CoinFlipGameState.BettingPhase;
  String selectedSide = '';
  String winningSide = '';
  int betAmount = 0;
  bool submitted = false;
  int time = 0;
  Map<String, List<Map<String, dynamic>>> playerList = {
    'heads': [],
    'tails': []
  };
  List<String> history = [];

  selectSide(String side) {
    selectedSide = side;
  }

  resetAttributes() {
    gameState = CoinFlipGameState.BettingPhase;
    selectedSide = '';
    winningSide = '';
    betAmount = 0;
    time = 0;
    submitted = false;
  }

  getState() {
    _webSocketManager.webSocketSender(
      CoinFlipEvents.JoinGame.value,
      null,
      (answer) => {
        playerList = {
          'heads':
              List<Map<String, dynamic>>.from(answer['playerList']['heads']),
          'tails':
              List<Map<String, dynamic>>.from(answer['playerList']['tails']),
        },
        history = List<String>.from(answer['history']),
        gameState = CoinFlipGameState.values.firstWhere(
          (e) => e.toString() == 'CoinFlipGameState.${answer['state']}',
        ),
      },
    );
  }

  initializeEventListeners() {
    _webSocketManager.webSocketReceiver(
        CoinFlipEvents.StartGame.value, (_) => {resetAttributes()});

    _webSocketManager.webSocketReceiver(
        CoinFlipEvents.PreFlippingPhase.value,
        (_) => {
              gameState = CoinFlipGameState.PreFlippingPhase,
            });

    _webSocketManager.webSocketReceiver(
        CoinFlipEvents.FlippingPhase.value,
        (_) => {
              gameState = CoinFlipGameState.FlippingPhase,
            });

    _webSocketManager.webSocketReceiver(
        CoinFlipEvents.Results.value,
        (answer) => {
              playerList = {
                'heads': List<Map<String, dynamic>>.from(
                    answer['playerList']['heads']),
                'tails': List<Map<String, dynamic>>.from(
                    answer['playerList']['tails']),
              },
              history = List<String>.from(answer['history']),
              gameState = CoinFlipGameState.ResultsPhase,
              winningSide = answer['result'],
            });

    _webSocketManager.webSocketReceiver(
        CoinFlipEvents.SendPlayerList.value,
        (playerList) => {
              playerList = {
                'heads': List<Map<String, dynamic>>.from(
                    playerList['playerList']['heads']),
                'tails': List<Map<String, dynamic>>.from(
                    playerList['playerList']['tails']),
              },
            });

    _webSocketManager.webSocketReceiver(
        CoinFlipEvents.BetTimeCountdown.value,
        (newTime) => {
              time = newTime / 10,
            });
  }

  submitBet(BuildContext context) {
    showConfirmationDialog(
        context,
        "Voulez vous miser la somme de : $betAmount coins?",
        () => onSubmitBetConfirm(context));
  }

  onSubmitBetConfirm(BuildContext context) {
    if (betAmount > 0 &&
        betAmount % 1 == 0 &&
        gameState == CoinFlipGameState.BettingPhase) {
      _webSocketManager.webSocketSender(
          CoinFlipEvents.SubmitChoice.value,
          {'choice': selectedSide, 'bet': betAmount},
          (submitStatus) => {
                if (submitStatus)
                  {
                    submitted = true,
                  }
                else
                  {
                    showErrorDialog(
                      context,
                      'Vous ne pouvez pas parier plus de coins que ceux détenus ou bien parier en dehors de la phase de mise!',
                    ),
                  },
              });
    } else if (betAmount == 0 || betAmount % 1 != 0) {
      showErrorDialog(context, 'Vous ne pouvez pas parier 0 coins.');
    } else if (gameState != CoinFlipGameState.BettingPhase) {
      errorOutsideBettingPhase(context);
    }
  }

  errorOutsideBettingPhase(BuildContext context) {
    showErrorDialog(
        context, 'Vous ne pouvez pas parier en dehors de la phase de mise.');
  }

  updateBetAmount(int value) {
    if (value < 0) {
      return 0;
    }
    if (value % 1 != 0) {
      return value.ceil();
    }
    return value;
  }

  increaseBet(int amount) {
    betAmount += amount;
  }
}
