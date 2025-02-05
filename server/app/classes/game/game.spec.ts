/* eslint-disable max-lines */ // Nous nous permettons de depasser les lignes maximales,
// du au grand couplage de la classe, qui necessite beaucoup de mocks.
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/player/player';
import { GameEvents, QuestionType, TimerEvents } from '@app/constants/enum-classes';
import { MOCK_QUESTIONS } from '@app/constants/mock-questions';
import { MOCK_QUIZZES } from '@app/constants/mock-quizzes';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { ALERT_MODE_TIME_LIMITS } from './game.constants';

const TIME_FOR_QRL = 60;

const mockSocket = {
    id: 'socketId1',
    join: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
} as unknown as Socket;

const otherSocket = {
    id: 'socketId1',
    join: jest.fn(),
    emit: jest.fn(),
} as unknown as Socket;

let mockPlayer = {} as unknown as Player;

describe('Game', () => {
    let game: Game;

    mockPlayer = {
        name: 'mockName',
        socket: {
            emit: jest.fn(),
            leave: jest.fn(),
        },
    } as unknown as Player;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                Game,
                { provide: Quiz, useValue: MOCK_QUIZZES[1] },
                { provide: Socket, useValue: mockSocket },
                { provide: String, useValue: 'gameID' },
                { provide: Boolean, useValue: false },
            ],
        }).compile();
        game = module.get<Game>(Game);
        game.quiz.questions[1].type = 'QCM';
        game.quiz.questions[0].type = 'QCM';
        game['answersPerChoice'] = undefined;
    });

    it('should be defined', () => {
        expect(game).toBeDefined();
    });

    it('pauseGame should call timer pause with appropriate events', () => {
        game.timer.pause = jest.fn();
        game.pauseGame();
        expect(game.timer.pause).toHaveBeenCalledWith(TimerEvents.Value, TimerEvents.End);
    });
    it('validPlayer() should allow for a normal name', () => {
        const mockName = 'name';
        expect(game.validPlayer(mockName)).toBe(true);
    });

    it('validPlayer() should not allow for the name organisateur', () => {
        const mockOrganizerName = 'Organisateur';
        expect(game.validPlayer(mockOrganizerName)).toBe(false);
    });

    it('validPlayer should not allow for an existing name', () => {
        const mockName = 'name';
        game.playerExists = jest.fn().mockReturnValue(true);
        expect(game.validPlayer(mockName)).toBe(false);
    });

    it('validPlayer should not allow for an existing name', () => {
        const mockName = 'name';
        game.isPlayerBanned = jest.fn().mockReturnValue(true);
        expect(game.validPlayer(mockName)).toBe(false);
    });

    it('playerExists should return true for an existing player', () => {
        game['getPlayerByName'] = jest.fn().mockReturnValue(mockPlayer);
        expect(game.playerExists('name')).toBe(true);
    });

    it('playerExists should return false for an inexisting player', () => {
        game['getPlayerByName'] = jest.fn().mockReturnValue(undefined);
        expect(game.playerExists('name')).toBe(false);
    });

    it('isNameOrganizer should detect if the name is organisateur', () => {
        const mockName1 = 'OrGaNiSaTeUr';
        const mockName2 = 'organisateur';
        const mockName3 = 'orgganisateur';
        expect(game.isNameOrganizer(mockName1)).toBe(true);
        expect(game.isNameOrganizer(mockName2)).toBe(true);
        expect(game.isNameOrganizer(mockName3)).toBe(false);
    });

    it('should correctly initialize game properties', () => {
        expect(game.players).toEqual([]);
        expect(game.bannedNames).toEqual([]);
        expect(game.quiz).toBe(MOCK_QUIZZES[1]);
        expect(game['currentQuestionIndex']).toBe(0);
        expect(game.isLocked).toBe(false);
        expect(game.roomId).toBe('gameID');
        expect(game.organizer).toBeDefined();
        expect(game.timer).toBeDefined();
    });
    it('should initialize game properties for random mode', () => {
        const mockQuiz = MOCK_QUIZZES[0] as Quiz;
        game = new Game('roomId', mockQuiz, mockSocket, true);
        expect(game.players).toHaveLength(1);
        const organizerPlayer = game.players.find((p) => p.name === 'Organisateur');
        expect(organizerPlayer).toBeDefined();
        expect(organizerPlayer?.isInGame).toBe(true);
        expect(organizerPlayer?.socket).toBe(mockSocket);
        expect(game.isRandomMode).toBe(true);
    });

    it('addPlayer() should add the player to the players array', () => {
        game.addPlayer(mockPlayer, mockSocket);
        expect(mockSocket.join).toHaveBeenCalledWith(game.roomId);
        expect(game.players).toContain(mockPlayer);
    });
    it('removePlayer() should remove a player if it exists', () => {
        game.players = [mockPlayer];
        game.removePlayer(mockPlayer.name);
        expect(mockPlayer.socket.emit).toHaveBeenCalledWith(GameEvents.PlayerBanned);
        expect(mockPlayer.socket.leave).toHaveBeenCalledWith(game.roomId);
    });
    it('isPlayerBanned() should return true if the player is in the list of bannedNames', () => {
        game.bannedNames = ['bannedplayer'];
        expect(game.isPlayerBanned('bannedPlayer')).toBe(true);
    });
    it('getPlayerByName() should return the Player object if present in the players array', () => {
        game.players = [mockPlayer];
        expect(game['getPlayerByName'](mockPlayer.name)).toBe(mockPlayer);
    });
    it('isGameReadyToStart() should return false if the organizer is not in the game', () => {
        game.organizer.isInGame = false;
        expect(game.isGameReadyToStart()).toBe(false);
    });
    it('isGameReadyToStart() should return false if one of the players is not in the game', () => {
        game.organizer.isInGame = false;
        mockPlayer.isInGame = false;
        game.players = [mockPlayer];
        expect(game.isGameReadyToStart()).toBe(false);
    });
    it('isGameReadyToStart() should return true if everyone is ready', () => {
        game.organizer.isInGame = true;
        mockPlayer.isInGame = true;
        game.players = [mockPlayer];
        expect(game.isGameReadyToStart()).toBe(true);
    });
    it('startGame() should start the timer and return the current question', () => {
        game.timer.startTimer = jest.fn();
        game['givePlayerList'] = jest.fn();
        game['currentQuestionIndex'] = 0;
        expect(game.startGame()).toEqual({
            question: game.quiz.questions[game['currentQuestionIndex']],
            index: game['currentQuestionIndex'],
            length: game.quiz.questions.length,
        });
    });
    it('startGame() should call correct methods if the game is random', () => {
        game.timer.startTimer = jest.fn();
        game['givePlayerList'] = jest.fn();
        game['currentQuestionIndex'] = 0;
        jest.useFakeTimers();
        // Il faut mimick la fonction dans le game.ts
        // eslint-disable-next-line max-params
        game.timer.startTimer = jest.fn((duration, onValue, onEnd, callback) => {
            setTimeout(callback, duration);
        });
        game.preparePlayersForNextQuestion = jest.fn();
        game.startQuestionCountdown = jest.fn();
        game.isRandomMode = true;
        game.startGame();
        jest.runAllTimers();
        expect(game.startQuestionCountdown).toHaveBeenCalled();
    });
    it('nextQuestion() should call correct methods', () => {
        jest.useFakeTimers();
        // Il faut mimick la fonction dans le game.ts
        // eslint-disable-next-line max-params
        game.timer.startTimer = jest.fn((duration, onValue, onEnd, callback) => {
            setTimeout(callback, duration);
        });
        game['currentQuestionIndex'] = 0;
        game.quiz.questions.length = 30;
        game['playersReadyForNext'] = true;
        game.preparePlayersForNextQuestion = jest.fn();
        game.startQuestionCountdown = jest.fn();
        game.isRandomMode = true;
        game.nextQuestion();
        jest.runAllTimers();
        expect(game.startQuestionCountdown).toHaveBeenCalled();
    });
    it('startGame() should start with a timer of 60s if the first question is a QRL', () => {
        game.timer.startTimer = jest.fn();
        game['givePlayerList'] = jest.fn();
        game['currentQuestionIndex'] = 0;
        game.quiz.questions[0].type = 'QRL';
        game.startGame();
        expect(game.timer.startTimer).toHaveBeenCalledWith(TIME_FOR_QRL, TimerEvents.Value, TimerEvents.End);
    });
    it('toggleGameLock() should flip the value of isLocked', () => {
        game.isLocked = false;
        expect(game.toggleGameLock()).toBe(true);
    });
    it('nextQuestion() should start the timer and return the current question', () => {
        game['playersReadyForNext'] = true;
        game.timer.startTimer = jest.fn();
        game['currentQuestionIndex'] = 0;
        expect(game.nextQuestion()).toEqual({ question: game.quiz.questions[game['currentQuestionIndex']], index: game['currentQuestionIndex'] });
        expect(game.timer.startTimer).toHaveBeenCalledWith(game.quiz.duration, TimerEvents.Value, TimerEvents.End);
    });
    it('nextQuestion() should start the timer with 60 seconds if its a QRL', () => {
        game['playersReadyForNext'] = true;
        game.timer.startTimer = jest.fn();
        game['currentQuestionIndex'] = 0;
        game.quiz.questions[1].type = 'QRL';
        game.nextQuestion();
        expect(game.timer.startTimer).toHaveBeenCalledWith(TIME_FOR_QRL, TimerEvents.Value, TimerEvents.End);
    });

    it('getResults() should return the correct data', () => {
        game.players = [mockPlayer];
        game.playersRemoved = [mockPlayer];
        game['currentQuestionIndex'] = game.quiz.questions.length;
        const expectedPlayerList = [
            { name: mockPlayer.name, points: mockPlayer.points, isInGame: true, noBonusesObtained: mockPlayer.noBonusesObtained },
            { name: mockPlayer.name, points: mockPlayer.points, isInGame: false, noBonusesObtained: mockPlayer.noBonusesObtained },
        ];
        const expectedResultsData = {
            questions: game.quiz.questions,
            players: expectedPlayerList,
            choicesHistory: game['choicesHistory'],
        };
        const results = game.getResults();
        expect(results).toEqual(expectedResultsData);
    });

    it('checkAndPrepareForNextQuestion() should call startQuestionCountdown() if the mode is random', () => {
        game.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        game['areResultsReadyToShow'] = jest.fn().mockReturnValue(true);
        game.preparePlayersForNextQuestion = jest.fn();
        game.isRandomMode = true;
        game.startQuestionCountdown = jest.fn();
        game.checkAndPrepareForNextQuestion(mockSocket);
        expect(game.startQuestionCountdown).toHaveBeenCalled();
    });

    it('findTargetedPlayer() should return the correct Player object', () => {
        game.players = [mockPlayer];
        mockPlayer.socket = otherSocket;
        expect(game.findTargetedPlayer(otherSocket)).toBe(mockPlayer);
    });
    it('handleChoiceChange() should toggle the current choice of the player if its currently false', () => {
        const mockIndex = 0;
        mockPlayer.currentChoices = [false, false, false, false];
        mockPlayer.socket = otherSocket;
        game.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        const expected = { selected: true, choice: mockIndex };
        expect(game.handleChoiceChange(otherSocket, mockIndex)).toStrictEqual(expected);
    });
    it('handleChoiceChange() should toggle the current choice of the player if its currently true', () => {
        const mockIndex = 0;
        mockPlayer.currentChoices = [true, false, false, false];
        mockPlayer.socket = otherSocket;
        game.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        const expected = { selected: false, choice: mockIndex };
        expect(game.handleChoiceChange(otherSocket, mockIndex)).toStrictEqual(expected);
    });
    it('areResultsReadyToShow() should return true if everyone submitted', () => {
        mockPlayer.submitted = true;
        game.players = [mockPlayer];
        expect(game['areResultsReadyToShow']()).toBe(true);
    });
    it('areResultsReadyToShow() should return false if someone did not submit', () => {
        mockPlayer.submitted = false;
        game.players = [mockPlayer];
        expect(game['areResultsReadyToShow']()).toBe(false);
    });
    it('givePlayerList() should emit the correct event and push the correct data', () => {
        game.players = [mockPlayer];
        const playersObject = [
            {
                name: mockPlayer.name,
                points: mockPlayer.points,
                isInGame: mockPlayer.isInGame,
                interacted: mockPlayer.interacted,
                submitted: mockPlayer.submitted,
            },
        ];
        game.organizer.socket.emit = jest.fn();
        game['givePlayerList']();
        expect(game.organizer.socket.emit).toHaveBeenCalledWith(GameEvents.SendPlayerList, playersObject);
    });
    it('startGameCountDown() should call startTimer with the correct params', () => {
        const mockTimerValue = 100;
        game.timer.startTimer = jest.fn();
        game.startGameCountdown(mockTimerValue);
        expect(game.timer.startTimer).toHaveBeenCalledWith(mockTimerValue, TimerEvents.GameCountdownValue, TimerEvents.GameCountdownEnd);
    });

    it('startQuestionCountdown', () => {
        // nous avons mis 3'_' dans le but d'enumerer les parametres non-utiles au test.
        // nous avons disable le nombre maximum de parametres puisque la arrow function est utilisee pour simuler les parametres de la vraie fonction
        // eslint-disable-next-line @typescript-eslint/naming-convention  , max-params
        game.timer.startTimer = jest.fn((_, __, ___, callback) => {
            callback();
        });
        const mockQuestion = MOCK_QUESTIONS[1];
        game.nextQuestion = jest.fn().mockReturnValue(mockQuestion);
        game.isRandomMode = false;
        game.startQuestionCountdown();
        expect(game.timer.startTimer).toHaveBeenCalledWith(
            3,
            TimerEvents.QuestionCountdownValue,
            TimerEvents.QuestionCountdownEnd,
            expect.any(Function),
        );
        expect(game.nextQuestion).toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith(GameEvents.NextQuestion, mockQuestion);
        expect(mockSocket.to(game.roomId).emit).toHaveBeenCalledWith(GameEvents.NextQuestion, mockQuestion);
    });

    it('startQuestionCountdown in Random Mode should start the timer and emit NextQuestion to all players when in random mode', () => {
        // nous avons mis 3'_' dans le but d'enumerer les parametres non-utiles au test.
        // nous avons disable le nombre maximum de parametres puisque la arrow function est utilisee pour simuler les parametres de la vraie fonction
        // eslint-disable-next-line @typescript-eslint/naming-convention  , max-params
        game.timer.startTimer = jest.fn((_, __, ___, callback) => {
            callback();
        });
        const mockQuestion = MOCK_QUESTIONS[1];
        game.nextQuestion = jest.fn().mockReturnValue(mockQuestion);
        game.isRandomMode = true;
        game.players = [mockPlayer];

        game.startQuestionCountdown();
        expect(game.timer.startTimer).toHaveBeenCalledWith(
            3,
            TimerEvents.QuestionCountdownValue,
            TimerEvents.QuestionCountdownEnd,
            expect.any(Function),
        );
        expect(game.nextQuestion).toHaveBeenCalled();
        game.players.forEach((player) => {
            expect(player.socket.emit).toHaveBeenCalledWith(GameEvents.NextQuestion, mockQuestion);
        });
    });

    it('finalizePlayerAnswer() should set player.isFirst to false if someone has already answered correctly', () => {
        mockPlayer.verifyIfAnswersCorrect = jest.fn().mockReturnValue(false);
        game.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        game.finalizePlayerAnswer(mockSocket);
        expect(mockPlayer.isFirst).toBe(false);
    });
    it('finalizePlayerAnswer() should set player.isFirst to false if he answers incorrectly', () => {
        mockPlayer.verifyIfAnswersCorrect = jest.fn().mockReturnValue(false);
        game.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        game.finalizePlayerAnswer(mockSocket);
        expect(mockPlayer.isFirst).toBe(false);
    });
    it('finalizePlayerAnswer() should give the bonus to the player if he answers first ', () => {
        mockPlayer.verifyIfAnswersCorrect = jest.fn().mockReturnValue(true);
        mockPlayer.noBonusesObtained = 0;
        game.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        game['lastFinalizeCall'] = null;
        game.finalizePlayerAnswer(mockSocket);
        expect(mockPlayer.isFirst).toBe(true);
        expect(mockPlayer.noBonusesObtained).toBe(1);
        expect(game['lastFinalizePlayer']).toBe(mockPlayer);
    });
    it('finalizePlayerAnswer() should not give the bonus to any of two players if they answered at the same time ', () => {
        mockPlayer.isFirst = true;
        mockPlayer.noBonusesObtained = 1;
        game.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        game['lastFinalizePlayer'] = mockPlayer;
        const mockTime = 100;
        jest.spyOn(Date, 'now').mockReturnValue(mockTime);
        game['lastFinalizeCall'] = mockTime + 1;
        game.finalizePlayerAnswer(mockSocket);
        expect(game['lastFinalizePlayer'].isFirst).toBe(false);
        expect(game['lastFinalizePlayer'].noBonusesObtained).toBe(0);
    });
    it('finalizePlayerAnswer() should not set player as first if he answered correctly after another player ', () => {
        game.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        const mockTime = 10000;
        jest.spyOn(Date, 'now').mockReturnValue(mockTime);
        game['lastFinalizeCall'] = 1;
        game.finalizePlayerAnswer(mockSocket);
        expect(mockPlayer.isFirst).toBe(false);
    });
    it('preparePlayersForNextQuestion() should call the correct methods in order to update the points', () => {
        mockPlayer.currentChoices = [false, false, true];
        mockPlayer.updatePlayerPoints = jest.fn();
        mockPlayer.socket.emit = jest.fn();
        game.organizer.socket.emit = jest.fn();
        mockPlayer.prepareForNextQuestion = jest.fn();
        game['currentQuestionIndex'] = 0;
        game.players = [mockPlayer];
        const expectedAnswersPerChoice = [0, 0, 1];
        game['preparePlayersForNextQuestion']();
        expect(game['answersPerChoice']).toEqual(expectedAnswersPerChoice);
        expect(mockPlayer.updatePlayerPoints).toHaveBeenCalledWith(game.quiz.questions[0]);
        expect(mockPlayer.socket.emit).toHaveBeenCalledWith(GameEvents.PlayerPointsUpdate, expect.anything());
        expect(game.organizer.socket.emit).toHaveBeenCalledWith(GameEvents.OrganizerPointsUpdate, expect.anything());
        expect(mockPlayer.prepareForNextQuestion).toHaveBeenCalled();
    });
    it('preparePlayersForNextQuestion() should intialize well answersPlayerChoices if QRL', () => {
        game.quiz.questions[game['currentQuestionIndex']].choices = undefined;
        expect(game['answersPerChoice']).toBeUndefined();
    });
    it('preparePlayersForNextQuestion() should emit everyoneSubmitted if the question is a QRL', () => {
        mockPlayer.currentChoices = [false, false, false, true];
        mockPlayer.updatePlayerPoints = jest.fn();
        mockPlayer.socket.emit = jest.fn();
        game.organizer.socket.emit = jest.fn();
        mockPlayer.prepareForNextQuestion = jest.fn();
        game['currentQuestionIndex'] = 0;
        game.players = [mockPlayer];
        game.quiz.questions[game['currentQuestionIndex']].type = 'QRL';
        game['preparePlayersForNextQuestion']();
        expect(game.organizer.socket.emit).toHaveBeenCalledWith(GameEvents.EveryoneSubmitted);
    });
    it('preparePlayersForNextQuestion() should emit GameEvents.ProceedToNextQuestion for each player if in random mode', () => {
        const mockPlayerOne = new Player('Alice', true, mockSocket);
        const mockPlayerTwo = new Player('Bob', true, otherSocket);
        mockPlayerOne.socket.emit = jest.fn();
        mockPlayerTwo.socket.emit = jest.fn();

        const quiz = MOCK_QUIZZES[1] as Quiz;
        const gameExemple = new Game('roomId', quiz, mockSocket, true);
        gameExemple.players = [mockPlayerOne, mockPlayerTwo];

        gameExemple['preparePlayersForNextQuestion']();

        expect(mockPlayerOne.socket.emit).toHaveBeenCalledWith(GameEvents.ProceedToNextQuestion);
        expect(mockPlayerTwo.socket.emit).toHaveBeenCalledWith(GameEvents.ProceedToNextQuestion);
    });
    it('should update the points of the QRL question', () => {
        game.organizer.socket.emit = jest.fn();
        const pointsTotal = [
            { playerName: 'Nour', points: 20 },
            { playerName: 'Nour m', points: 10 },
        ];
        game.players[0] = new Player('Nour', false, mockSocket);
        game.players[1] = new Player('Nour m', false, otherSocket);
        const answers = [0, 0, 2];
        game.updatePointsQRL({ pointsTotal, answers });
        expect(game.organizer.socket.emit).toHaveBeenCalled();
        expect(game.players[0].socket.emit).toHaveBeenCalledWith(GameEvents.PlayerPointsUpdate, { points: 20, isFirst: false });
        expect(game.players[1].socket.emit).toHaveBeenCalledWith(GameEvents.PlayerPointsUpdate, { points: 10, isFirst: false });
    });
    it('startAlertMode() should call startAlertMode of timer if conditions correct', () => {
        game.timer.startAlertMode = jest.fn();
        game.quiz.questions[game['currentQuestionIndex']].type = QuestionType.QCM;
        game.timer.timerValue = ALERT_MODE_TIME_LIMITS.QCM + 1;
        game.startAlertMode();
        expect(game.timer.startAlertMode).toHaveBeenCalled();
        game.quiz.questions[game['currentQuestionIndex']].type = QuestionType.QRL;
        game.timer.timerValue = ALERT_MODE_TIME_LIMITS.QRL + 1;
        game.startAlertMode();
        expect(game.timer.startAlertMode).toHaveBeenCalled();
    });
    it('checkAndPrepareForNextQuestion() sould emit EveryOneSubmitted', () => {
        game.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        game.checkAndPrepareForNextQuestion(mockSocket);
        expect(mockPlayer.submitted).toBe(true);
    });
    it('emitCorrectionEvents() should call emit correct event', () => {
        game.quiz.questions[game['currentQuestionIndex']].type = QuestionType.QRL;
        game.players = [mockPlayer];
        game.isRandomMode = true;
        game['emitCorrectionEvents']();
        expect(mockPlayer.socket.emit).toHaveBeenCalledWith(GameEvents.EveryoneSubmitted);
    });
});
