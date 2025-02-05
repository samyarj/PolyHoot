export enum ChatEvents {
    RoomMessage = 'roomMessage',
    SystemMessage = 'systemMessage',
    MessageAdded = 'messageAdded',
    GetHistory = 'getHistory',
    RoomLeft = 'roomLeft',
    ChatStatusChange = 'chatStatusChange',
}
export enum QuestionType {
    QCM = 'QCM',
    QRL = 'QRL',
}
export enum GameState {
    HOME = 1,
    WAITING,
    GAMING,
    RESULTS,
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
    SelectFromPlayer = 'selected',
    PlayerChoiceToOrganizer = 'selectChoice',
    StartQuestionCountdown = 'startQuestionCountdown',
    QuestionEndByTimer = 'questionEndByTimer',
    FinalizePlayerAnswer = 'finalizePlayerAnswer',
    StartGameCountdown = 'startGameCountdown',
    StartGame = 'startGame',
    Title = 'gameTitle',
    ToggleLock = 'toggleGameLock',
    AlertLockToggled = 'onToggleGameLock',
    PlayerBan = 'banPlayer',
    PlayerBanned = 'onBanPlayer',
    PlayerLeft = 'onPlayerLeft',
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
    PlayerInteraction = 'playerInteraction',
    PlayerSubmitted = 'playerSubmitted',
}

export enum JoinEvents {
    TitleRequest = 'getTitle',
    Create = 'createGame',
    ValidateGameId = 'validGameId',
    ValidId = 'gameIdValid',
    Join = 'joinGame',
    CanJoin = 'canJoinGame',
    JoinSuccess = 'onJoinGameSuccess',
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
}

export enum DisconnectEvents {
    OrganizerHasLeft = 'OrganizerHasDisconnected',
    OrganizerDisconnected = 'organizerDisconnected',
    Player = 'playerDisconnected',
    UserFromResults = 'DisconnectUserFromResultsPage',
}
