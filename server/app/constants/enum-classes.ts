export enum ChatEvents {
    RoomMessage = 'roomMessage',
    SystemMessage = 'systemMessage',
    MessageAdded = 'messageAdded',
    GetHistory = 'getHistory',
    RoomLeft = 'roomLeft',
    ChatStatusChange = 'chatStatusChange',
    QuickRepliesGenerated = 'quick_replies_generated',
    RequestQuickReplies = 'request_quick_replies',
}
export enum QuestionType {
    QCM = 'QCM',
    QRL = 'QRL',
    QRE = 'QRE',
}
export enum GameState {
    HOME = 1,
    WAITING,
    GAMING,
    RESULTS,
}

export enum CoinSide {
    Heads = 'heads',
    Tails = 'tails',
}

export enum CoinFlipGameState {
    Uninitialized = 0,
    BettingPhase = 1,
    PreFlippingPhase = 2,
    FlippingPhase = 3,
    ResultsPhase = 4,
}

export enum CoinFlipEvents {
    StartGame = 'coinflip-start-game',
    PreFlippingPhase = 'coinflip-pre-flipping',
    FlippingPhase = 'coinflip-flipping',
    Results = 'coinflip-results',
    BetTimeCountdown = 'BetTimeCountdown',
    SendPlayerList = 'SendPlayerList',
    JoinGame = 'JoinGame',
    SubmitChoice = 'SubmitChoice',
}

export enum TimerEvents {
    Value = 'timerValue',
    End = 'timerEnd',
    GameCountdownValue = 'countdownTimerValue',
    GameCountdownEnd = 'countdownEnd',
    QuestionCountdownValue = 'questionCountdownValue',
    QuestionCountdownEnd = 'questionCountdownEnd',
    Pause = 'pauseGame',
    Paused = 'gamePaused',
    AlertGameMode = 'alertMode',
    AlertModeStarted = 'alertModeStarted',
}

export enum GameEvents {
    StartQuestionCountdown = 'startQuestionCountdown',
    QuestionEndByTimer = 'questionEndByTimer',
    FinalizePlayerAnswer = 'finalizePlayerAnswer',
    StartGameCountdown = 'startGameCountdown',
    StartGame = 'startGame',
    Title = 'gameTitle',
    ToggleLock = 'toggleGameLock',
    AlertLockToggled = 'onToggleGameLock',
    LobbyToggledLock = 'lobbyToggledLock',
    PlayerBan = 'banPlayer',
    PlayerBanned = 'onBanPlayer',
    PlayerLeft = 'onPlayerLeft',
    PlayerLeftLobby = 'playerLeftLobby',
    PlayerStatusUpdate = 'updatePlayerStatus',
    PlayerPointsUpdate = 'playerPointsUpdate',
    SendPlayerList = 'givePlayerList',
    OrganizerPointsUpdate = 'updatePlayerPoints',
    ShowResults = 'showResults',
    SendResults = 'showEndResults',
    End = 'gameEnded',
    QuestionsLength = 'getQuestionsLength',
    NextQuestion = 'goToNextQuestion',
    ProceedToNextQuestion = 'canProceedToNextQuestion',
    ModifyUpdate = 'modifyingUpdate',
    QRLAnswerSubmitted = 'QRLAnswerSubmitted',
    EveryoneSubmitted = 'everyoneSubmitted',
    CorrectionFinished = 'correctionFinished',
    WaitingForCorrection = 'waitingForCorrection',
    PlayerSubmitted = 'playerSubmitted',
    GetCurrentGames = 'getCurrentGames',
    GetCurrentPlayers = 'getCurrentPlayers',
}

export enum JoinEvents {
    TitleRequest = 'getTitle',
    Create = 'createGame',
    ValidateGameId = 'validGameId',
    ValidId = 'gameIdValid',
    Join = 'joinGame',
    CanJoin = 'canJoinGame',
    JoinSuccess = 'onJoinGameSuccess',
    LobbyCreated = 'lobbyCreated',
    PlayerJoined = 'playerjoined',
}

export enum JoinErrors {
    InvalidId = 'invalidId',
    RoomLocked = 'roomLocked',
    ExistingName = 'existingName',
    BannedName = 'bannedName',
    OrganizerName = 'organizerName',
    Generic = 'cantJoinGame',
}

export enum ConnectEvents {
    UserToGame = 'userConnectedToGamePage',
    IdentifyClient = 'identifyClient',
    AllPlayersLeft = 'AllPlayersLeft',
}

export enum DisconnectEvents {
    OrganizerHasLeft = 'OrganizerHasDisconnected',
    OrganizerDisconnected = 'organizerDisconnected',
    Player = 'playerDisconnected',
    UserFromResults = 'DisconnectUserFromResultsPage',
}
