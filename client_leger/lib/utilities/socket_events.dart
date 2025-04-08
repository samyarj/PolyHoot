enum CoinFlipGameState {
  Uninitialized(0),
  BettingPhase(1),
  PreFlippingPhase(2),
  FlippingPhase(3),
  ResultsPhase(4);

  final int value;
  const CoinFlipGameState(this.value);
}

enum CoinFlipEvents {
  StartGame('coinflip-start-game'),
  PreFlippingPhase('coinflip-pre-flipping'),
  FlippingPhase('coinflip-flipping'),
  Results('coinflip-results'),
  BetTimeCountdown('BetTimeCountdown'),
  SendPlayerList('SendPlayerList'),
  JoinGame('JoinGame'),
  SubmitChoice('SubmitChoice');

  final String value;
  const CoinFlipEvents(this.value);
}

enum TimerEvents {
  Value('timerValue'),
  End('timerEnd'),
  GameCountdownValue('countdownTimerValue'),
  GameCountdownEnd('countdownEnd'),
  QuestionCountdownValue('questionCountdownValue'),
  QuestionCountdownEnd('questionCountdownEnd'),
  Pause('pauseGame'),
  Paused('gamePaused'),
  AlertGameMode('alertMode'),
  AlertModeStarted('alertModeStarted');

  final String value;
  const TimerEvents(this.value);
}

enum GameEvents {
  SelectFromPlayer('selected'),
  PlayerChoiceToOrganizer('selectChoice'),
  StartQuestionCountdown('startQuestionCountdown'),
  QuestionEndByTimer('questionEndByTimer'),
  FinalizePlayerAnswer('finalizePlayerAnswer'),
  StartGameCountdown('startGameCountdown'),
  StartGame('startGame'),
  Title('gameTitle'),
  ToggleLock('toggleGameLock'),
  AlertLockToggled('onToggleGameLock'),
  LobbyToggledLock('lobbyToggledLock'),
  PlayerBan('banPlayer'),
  PlayerBanned('onBanPlayer'),
  PlayerLeft('onPlayerLeft'),
  PlayerLeftLobby('playerLeftLobby'),
  PlayerStatusUpdate('updatePlayerStatus'),
  PlayerPointsUpdate('playerPointsUpdate'),
  SendPlayerList('givePlayerList'),
  OrganizerPointsUpdate('updatePlayerPoints'),
  ShowResults('showResults'),
  SendResults('showEndResults'),
  End('gameEnded'),
  QuestionsLength('getQuestionsLength'),
  NextQuestion('goToNextQuestion'),
  ProceedToNextQuestion('canProceedToNextQuestion'),
  ModifyUpdate('modifyingUpdate'),
  QRLAnswerSubmitted('QRLAnswerSubmitted'),
  EveryoneSubmitted('everyoneSubmitted'),
  CorrectionFinished('correctionFinished'),
  WaitingForCorrection('waitingForCorrection'),
  PlayerInteraction('playerInteraction'),
  PlayerSubmitted('playerSubmitted'),
  GetCurrentGames('getCurrentGames'),
  GetCurrentPlayers('getCurrentPlayers');

  final String value;
  const GameEvents(this.value);
}

enum JoinEvents {
  TitleRequest('getTitle'),
  Create('createGame'),
  ValidateGameId('validGameId'),
  ValidId('gameIdValid'),
  Join('joinGame'),
  CanJoin('canJoinGame'),
  JoinSuccess('onJoinGameSuccess'),
  PlayerJoined('playerjoined'),
  LobbyCreated('lobbyCreated');

  final String value;
  const JoinEvents(this.value);
}

enum JoinErrors {
  InvalidId('invalidId'),
  RoomLocked('roomLocked'),
  ExistingName('existingName'),
  BannedName('bannedName'),
  OrganizerName('organizerName'),
  Generic('cantJoinGame');

  final String value;
  const JoinErrors(this.value);
}

enum ConnectEvents {
  UserToGame('userConnectedToGamePage'),
  AllPlayersLeft('AllPlayersLeft'),
  IdentifyClient('identifyClient');

  final String value;
  const ConnectEvents(this.value);
}

enum DisconnectEvents {
  OrganizerHasLeft('OrganizerHasDisconnected'),
  OrganizerDisconnected('organizerDisconnected'),
  Player('playerDisconnected'),
  UserFromResults('DisconnectUserFromResultsPage');

  final String value;
  const DisconnectEvents(this.value);
}

enum QRLGrade {
  Wrong(0),
  Partial(50),
  Correct(100);

  final int value;
  const QRLGrade(this.value);
}

enum ChatEvents {
  RoomMessage('roomMessage'),
  SystemMessage('systemMessage'),
  MessageAdded('messageAdded'),
  GetHistory('getHistory'),
  RoomLeft('roomLeft'),
  ChatStatusChange('chatStatusChange'),
  QuickRepliesGenerated('quick_replies_generated'),
  RequestQuickReplies('request_quick_replies');

  final String value;
  const ChatEvents(this.value);
}

const String inGameChat = 'inGameChat1324';
