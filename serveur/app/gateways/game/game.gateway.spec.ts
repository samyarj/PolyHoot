/* eslint-disable @typescript-eslint/no-explicit-any */
// spy sur methode privee
import { Timer } from '@app/classes/game-timer/game-timer';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/player/player';
import { GameEvents, JoinErrors, JoinEvents } from '@app/constants/enum-classes';
import { MOCK_QUESTIONS } from '@app/constants/mock-questions';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { HistoryManagerService } from '@app/services/history-manager/history-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
    const defaultID = 'mockID';
    let gateway: GameGateway;
    let mockSocket = {} as unknown as Socket;
    const mockRoomsMap = {
        set: jest.fn(),
        get: jest.fn().mockReturnValue(defaultID),
        delete: jest.fn(),
    } as unknown as Map<Socket, string>;

    const mockSocket2 = {
        id: 'def',
        rooms: new Set(['room', 'room2']),
        emit: jest.fn(),
        join: jest.fn(),
    } as unknown as Socket;
    const clientIds: Set<string> = new Set(['abc', 'def', 'ghi']);
    const mockServer = {
        to: jest.fn().mockReturnValue({
            emit: jest.fn(),
        }),
        sockets: {
            sockets: {
                get: jest.fn().mockReturnValue({
                    leave: jest.fn(),
                    emit: jest.fn(),
                }),
            },
            adapter: {
                rooms: {
                    get: jest.fn().mockReturnValue(clientIds),
                },
            },
        },
    } as unknown as Server;
    const mockGame: Partial<Game> = {
        quiz: {
            title: 'Mock Quiz',
            questions: MOCK_QUESTIONS,
        } as unknown as Quiz,
        handleChoiceChange: jest.fn(),
        findTargetedPlayer: jest.fn(),
        pauseGame: jest.fn(),
        organizer: {
            socket: mockSocket2,
        } as unknown as Player,
        playersRemoved: [],
        timer: {} as unknown as Timer,
    };

    const gameManagerServiceMock = {
        validRoom: jest.fn().mockReturnValue(true),
    } as unknown as GameManagerService;

    const historyManagerServiceMock = {} as unknown as HistoryManagerService;

    beforeEach(async () => {
        gameManagerServiceMock.socketRoomsMap = mockRoomsMap;
        mockSocket = {
            id: 'abc',
            rooms: new Set(['room1', defaultID]),
            emit: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
        } as unknown as Socket;

        gameManagerServiceMock.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                { provide: Socket, useValue: mockSocket },
                { provide: Game, useValue: mockGame },
                { provide: Server, useValue: mockServer },
                { provide: GameManagerService, useValue: gameManagerServiceMock },
                { provide: HistoryManagerService, useValue: historyManagerServiceMock },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
    });

    beforeEach(() => {
        mockGame.organizer.socket = {
            emit: jest.fn(),
            id: 'def',
        } as unknown as Socket;

        gateway.server = mockServer;
    });
    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
    it('handlePauseGame() should call pauseGame function of the necessary game', () => {
        gateway.handlePauseGame(mockSocket as unknown as Socket);
        expect(mockGame.pauseGame).toHaveBeenCalled();
    });
    it('handleSelected1() should emit selectChoice with the correct signal upon recieving the selected signal', () => {
        const data = { choice: 1 };
        gateway.handleSelected(mockSocket as unknown as Socket, data);
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(defaultID);
        expect(mockGame.handleChoiceChange).toHaveBeenCalledWith(mockSocket, 1);
        expect(mockGame.organizer.socket.emit).toHaveBeenCalled();
    });
    it('handleGetTitleForPlayer() should return the game title if game exists', () => {
        const title = gateway.handleGetTitleForPlayer(mockSocket as unknown as Socket);
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(defaultID);
        expect(mockGame.quiz.title).toEqual(title);
        gameManagerServiceMock.getGameByRoomId = jest.fn(() => {
            return null;
        });
        const noTitle = gateway.handleGetTitleForPlayer(mockSocket as unknown as Socket);
        expect(noTitle).toEqual('Vue Joueur');
    });
    it('handleQuestionEndByTimer() should check and prepare for next question if in random mode', () => {
        mockGame.isRandomMode = true;
        mockGame.checkAndPrepareForNextQuestion = jest.fn();
        gateway.handleQuestionEndByTimer(mockSocket);
        expect(mockGame.checkAndPrepareForNextQuestion).toHaveBeenCalledWith(mockSocket);
    });
    it('handleQuestionEndByTimer() should prepare players for next question if not in random mode', () => {
        mockGame.isRandomMode = false;
        mockGame.preparePlayersForNextQuestion = jest.fn();
        gateway.handleQuestionEndByTimer(mockSocket);
        expect(mockGame.preparePlayersForNextQuestion).toHaveBeenCalled();
    });
    it('handleNextQuestion() should call startQuestionCountdown of the game', () => {
        mockGame.startQuestionCountdown = jest.fn();
        gateway.handleNextQuestion(mockSocket as unknown as Socket);
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(defaultID);
        expect(mockGame.startQuestionCountdown).toBeCalled();
    });
    it('createGame() should successfully create the game', () => {
        const mockID = 'newRoomID';
        const mockQuiz = new Quiz();
        const data = { quiz: mockQuiz, isRandomMode: false };
        gameManagerServiceMock.createGame = jest.fn().mockReturnValue(mockID);
        const result = gateway.handleCreateGame(mockSocket, data);
        expect(result).toBe(mockID);
        expect(mockRoomsMap.set).toHaveBeenCalledWith(mockSocket, mockID);
        expect(mockSocket.join).toHaveBeenCalledWith(mockID);
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(mockID);
    });
    it('handleValidGameId() should emit true if isValid is true', () => {
        gateway.handleValidGameId(mockSocket, 'data');
        expect(mockSocket.emit).toHaveBeenCalledWith(JoinEvents.ValidId);
    });
    it('handleValidGameId() should emit invalidId if Id is invalid', () => {
        gameManagerServiceMock.validRoom = jest.fn().mockReturnValue(false);
        gateway.handleValidGameId(mockSocket, 'data');
        expect(mockSocket.emit).toHaveBeenCalledWith(JoinErrors.InvalidId);
    });
    it('handleValidGameId() should emit RoomLocked if room is locked', () => {
        gameManagerServiceMock.validRoom = jest.fn().mockReturnValue(true);
        mockGame.isLocked = true;
        gateway.handleValidGameId(mockSocket, 'Mock Quiz');
        expect(mockSocket.emit).toHaveBeenCalledWith(JoinErrors.RoomLocked);
    });
    it('handleModifiedAnswer() should emit modifyUpdate', () => {
        gateway.handleModifiedAnswer(mockSocket, { playerName: 'Bob', modified: true });
        expect(mockGame.organizer.socket.emit).toHaveBeenCalledWith(GameEvents.ModifyUpdate, { playerName: 'Bob', modified: true });
    });
    it('handleJoinGame() should correctly handle player entering if he is allowed', () => {
        const mockID = 'roomID';
        mockGame.players = [new Player('Minutu', false, mockSocket)];
        gameManagerServiceMock.joinGame = jest.fn().mockImplementation(() => true);
        gateway.handleJoinGame(mockSocket, { gameId: mockID, playerName: 'cjamz' });
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(mockID);
        expect(mockSocket.emit).toHaveBeenCalledWith(JoinEvents.CanJoin);
        expect(mockRoomsMap.set).toHaveBeenCalledWith(mockSocket, mockID);
        expect(mockServer.to(mockID).emit).toHaveBeenCalledWith(JoinEvents.JoinSuccess, expect.arrayContaining([expect.any(String)]));
    });
    it('handleJoinGame() should emit correct error signals', () => {
        const mockID = 'roomID';
        gameManagerServiceMock.joinGame = jest.fn().mockReturnValue(false);

        mockGame.playerExists = jest.fn().mockReturnValue(true);
        gateway.handleJoinGame(mockSocket, { gameId: mockID, playerName: 'minutu' });
        expect(mockSocket.emit).toHaveBeenCalledWith(JoinErrors.ExistingName);
        mockGame.playerExists = jest.fn().mockReturnValue(false);

        mockGame.isPlayerBanned = jest.fn().mockReturnValue(true);
        gateway.handleJoinGame(mockSocket, { gameId: mockID, playerName: 'minutu' });
        expect(mockSocket.emit).toHaveBeenCalledWith(JoinErrors.BannedName);
        mockGame.isPlayerBanned = jest.fn().mockReturnValue(false);

        mockGame.isNameOrganizer = jest.fn().mockReturnValue(true);
        gateway.handleJoinGame(mockSocket, { gameId: mockID, playerName: 'minutu' });
        expect(mockSocket.emit).toHaveBeenCalledWith(JoinErrors.OrganizerName);
        mockGame.isNameOrganizer = jest.fn().mockReturnValue(false);

        mockGame.isLocked = true;
        gateway.handleJoinGame(mockSocket, { gameId: mockID, playerName: 'minutu' });
        expect(mockSocket.emit).toHaveBeenCalledWith(JoinErrors.ExistingName);
        mockGame.isLocked = false;

        gateway.handleJoinGame(mockSocket, { gameId: mockID, playerName: 'minutu' });
        expect(mockSocket.emit).toHaveBeenCalledWith(JoinErrors.Generic);
    });
    it('handleStartGameCountdown() should start game countdown and emit game title', () => {
        const roomID = 'mockID';
        const timerValue = 0;
        mockGame.startGameCountdown = jest.fn();
        gateway.handleStartGameCountdown(mockSocket, timerValue);
        expect(mockGame.startGameCountdown).toHaveBeenCalledWith(timerValue);
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(roomID);
        expect(mockServer.to(roomID).emit).toHaveBeenCalledWith(GameEvents.Title, mockGame.quiz.title);
    });
    it('handleStartGame() should call addGameRecord() of historyManager', () => {
        const roomID = 'mockID';
        const mockGameName = 'Mock Quiz';
        historyManagerServiceMock.addGameRecord = jest.fn();
        gateway.handleStartGame(mockSocket);
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(roomID);
        expect(historyManagerServiceMock.addGameRecord).toHaveBeenCalledWith(mockGameName, roomID);
    });
    it('handleGameLock() should correctly emit the lock event', () => {
        const roomID = 'mockID';
        mockGame.toggleGameLock = jest.fn().mockImplementation(() => true);
        gateway.handleGameLock(mockSocket);
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(roomID);
        expect(mockServer.to(defaultID).emit).toHaveBeenCalledWith(GameEvents.AlertLockToggled, true);
    });
    it('handleBanPlayer() should add player to bannedNames and remove player from game', () => {
        const playerName = 'Nour';
        const lowerCasePlayerName = 'nour';
        mockGame.bannedNames = [];
        gameManagerServiceMock.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        mockGame.removePlayer = jest.fn();
        gateway.handleBanPlayer(mockSocket, playerName);
        expect(mockGame.bannedNames).toContain(lowerCasePlayerName);
        expect(mockGame.removePlayer).toHaveBeenCalledWith(playerName);
    });
    it('handlePlayerFinalizeAnswer() should call finalizePlayerAnswer with the correct params', () => {
        const mockPlayer = new Player('sam_sulek', false, mockSocket);
        mockGame.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        mockGame.finalizePlayerAnswer = jest.fn();
        gateway.handlePlayerFinalizeAnswer(mockSocket);
        expect(mockGame.finalizePlayerAnswer).toHaveBeenCalledWith(mockSocket);
    });
    it('handleQRLAnswer() should correctly emit the answer submit event', () => {
        const data = { player: 'Gab', playerAnswer: 'Seville' };
        gateway.handleQRLAnswer(mockSocket, data);
        expect(mockGame.organizer.socket.emit).toHaveBeenCalledWith(GameEvents.QRLAnswerSubmitted, data);
    });
    it('handleCorrectionFinished() should correctly update the points', () => {
        const pointsTotal = [{ playerName: 'Gab', points: 10 }];
        const answers = [0, 0, 1];
        mockGame.updatePointsQRL = jest.fn();
        gateway.handleCorrectionFinished(mockSocket, { pointsTotal, answers });
        expect(mockGame.updatePointsQRL).toHaveBeenCalled();
    });

    it('handleResults() should emit the correct event', () => {
        const mockPlayer = new Player('sam_sulek', true, mockSocket2);
        const playerList = [mockPlayer];
        const choicesHistory = [];
        const results = { questions: mockGame.quiz.questions, players: playerList, choicesHistory };
        mockGame.getResults = jest.fn().mockReturnValue(results);
        historyManagerServiceMock.saveGameRecordToDB = jest.fn();
        gateway.handleShowResults(mockSocket as unknown as Socket);
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(defaultID);
        expect(historyManagerServiceMock.saveGameRecordToDB).toHaveBeenCalledWith(defaultID, results.players);
        expect(mockServer.to(defaultID).emit).toBeCalledWith(GameEvents.SendResults, results);
    });
    it('handleAlertGameMode() should call appropriate function on found game', () => {
        mockGame.startAlertMode = jest.fn();
        gateway.handleAlertGameMode(mockSocket as unknown as Socket);
        expect(mockGame.startAlertMode).toHaveBeenCalled();
    });
    it('handlePlayerInteraction() should emit PlayerInteraction Event', () => {
        const mockPlayer = new Player('sam_sulek', false, mockSocket);
        mockGame.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        gateway.handlePlayerInteraction(mockSocket);
        expect(mockGame.organizer.socket.emit).toHaveBeenCalledWith(GameEvents.PlayerInteraction, mockPlayer.name);
    });
});
