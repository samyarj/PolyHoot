export enum ButtonType {
    ADD = 'Ajouter',
    MODIFY = 'Modifier',
    CREATE = 'Créer',
}

export enum AdminQuizPageMode {
    CREATE = 'Création de jeu-questionnaire',
    MODIFY = 'Modification de jeu-questionnaire',
}

export enum ErrorMessage {
    QstTitleAlreadyInQuiz = 'Une question avec ce titre existe déjà dans le quiz',
    QstTitleAlreadyInBank = 'Une question avec ce titre existe déjà dans la banque',

    QstDoesNotExist = "La question n'existe pas dans le quiz",
}

export enum ChoiceFeedback {
    First = 'first',
    Correct = 'correct',
    Partial = 'partial',
    Incorrect = 'incorrect',
    Awaiting = 'awaiting',
    AwaitingCorrection = 'awaitingCorrection',
    Idle = 'idle',
}

export enum AppRoute {
    ADMIN = '/quiz-question-management',
    LOGIN = '/login',
    HOME = '/home',
    WAITING = '/waiting-room',
    GAME = '/game',
    ORGANIZER = '/organizer',
    RESULTS = '/results',
    CREATE = '/create',
    JOINGAME = '/join-game',
    QUESTIONBANK = '/questionBank',
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
    GetCurrentGames = 'getCurrentGames',
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
    AllPlayersLeft = 'AllPlayersLeft',
}

export enum DisconnectEvents {
    OrganizerHasLeft = 'OrganizerHasDisconnected',
    OrganizerDisconnected = 'organizerDisconnected',
    Player = 'playerDisconnected',
    UserFromResults = 'DisconnectUserFromResultsPage',
}

export enum QRLGrade {
    Wrong = 0,
    Partial = 50,
    Correct = 100,
}

export enum ConfirmationMessage {
    AbandonLobby = "Êtes-vous sûr de vouloir quitter la page d'attente et faire quitter tout le monde?",
    AbandonGame = 'Êtes-vous sûr de vouloir quitter la partie?',
    DeleteQuestion = 'Êtes-vous sûr de vouloir supprimer cette question?',
    DeleteGame = 'Êtes-vous sûr de vouloir supprimer ce jeu-questionnaire?',
    CleanHistory = "Êtes-vous sûr de vouloir supprimer l'historique?",
    CancelCreation = 'Êtes-vous sûr de vouloir annuler la création du jeu-questionnaire ?',
    CancelModification = 'Êtes-vous sûr de vouloir annuler la modification du jeu-questionnaire ?',
    BanPlayer = 'Êtes-vous sûr de vouloir bannir ce joueur ?',
}

export enum GameStatus {
    WaitingForAnswers = 'waitingForAnswers',
    OrganizerCorrecting = 'organizerCorrecting',
    CorrectionFinished = 'correctionFinished',
    WaitingForNextQuestion = 'waitingForNextQuestion',
    GameFinished = 'gameFinished',
}
