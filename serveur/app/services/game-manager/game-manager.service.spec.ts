import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/player/player';
import { MOCK_QUIZZES } from '@app/constants/mock-quizzes';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { GameManagerService } from './game-manager.service';

const defaultID = 'defaultID';

const mockSocket = {
    id: 'abc',
    rooms: new Set(['room1', defaultID]),
    emit: jest.fn(),
    join: jest.fn(),
    to: jest.fn().mockReturnThis(),
} as unknown as Socket;
const organizerSocket = {
    id: 'def',
    rooms: new Set(['room1', defaultID]),
    emit: jest.fn(),
    join: jest.fn(),
    to: jest.fn().mockReturnThis(),
} as unknown as Socket;

describe('GameManager', () => {
    let gameManager: GameManagerService;
    let mockGame: Game;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameManagerService],
        }).compile();

        gameManager = module.get<GameManagerService>(GameManagerService);
    });
    beforeEach(() => {
        gameManager = new GameManagerService();
        mockGame = {
            organizer: { socket: organizerSocket } as Player,
            quiz: {
                title: 'Mock Title',
            },
            isLocked: false,
            startGame: jest.fn(),
            removePlayer: jest.fn(),
            finalizePlayerAnswer: jest.fn(),
            addPlayer: jest.fn(),
            nextQuestion: jest.fn(),
            getPlayerByName: jest.fn(),
            timer: {
                stopTimer: jest.fn(),
            },
        } as unknown as Game;
    });
    it('createGame() should create a new game and return the roomId', () => {
        gameManager.createGame(MOCK_QUIZZES[0] as Quiz, mockSocket, false);
        expect(gameManager.currentGames[0]).toBeDefined();
    });
    it('getGameByRoomID() should return the correct game by roomId', () => {
        const roomId = gameManager.createGame(MOCK_QUIZZES[0] as Quiz, mockSocket, false);
        const retrievedGame = gameManager.getGameByRoomId(roomId);
        expect(retrievedGame).toBeDefined();
        expect(retrievedGame?.roomId).toEqual(roomId);
    });
    it('getGameByRoomID() should return null if no game matches the roomId', () => {
        const retrievedGame = gameManager.getGameByRoomId('nonExistingRoomId');
        expect(retrievedGame).toBeNull();
    });
    it('generateNewRoomId() should generate a unique roomId', () => {
        const roomId1 = gameManager.generateNewRoomId();
        const roomId2 = gameManager.generateNewRoomId();
        expect(roomId1).not.toEqual(roomId2);
    });
    it('joinGame() should add the player to the game if he is allowed to do so', () => {
        gameManager.canEnterGame = jest.fn().mockReturnValue(true);
        gameManager.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        mockGame.validPlayer = jest.fn().mockReturnValue(true);
        gameManager.joinGame(defaultID, 'playerName', mockSocket);
        expect(mockGame.addPlayer).toHaveBeenCalled();
    });
    it('joinGame() should not add the player to the game if he cannot enter the game', () => {
        gameManager.canEnterGame = jest.fn().mockReturnValue(false);
        gameManager.joinGame(defaultID, 'playerName', mockSocket);
        expect(mockGame.addPlayer).not.toHaveBeenCalled();
    });

    it('joinGame() should not add player if the name is invalid', () => {
        gameManager.canEnterGame = jest.fn().mockReturnValue(true);
        gameManager.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        mockGame.validPlayer = jest.fn().mockReturnValue(false);
        const hasEntered: boolean = gameManager.joinGame(defaultID, 'organisateur', mockSocket);
        expect(hasEntered).toBe(false);
    });

    it('canEnterGame() should retrun true if roomId is valid and game is not locked', () => {
        gameManager.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        gameManager.validRoom = jest.fn().mockReturnValue(true);
        mockGame.isLocked = false;
        const canEnter: boolean = gameManager.canEnterGame(defaultID);
        expect(canEnter).toBe(true);
    });

    it('validRoom() should return true if room is valid', () => {
        gameManager.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        gameManager.validRoom(defaultID);
        expect(gameManager.validRoom(defaultID)).toBe(true);
    });
    it('validRoom() should return false if room is invalid', () => {
        gameManager.getGameByRoomId = jest.fn().mockReturnValue(null);
        gameManager.validRoom(defaultID);
        expect(gameManager.validRoom(defaultID)).toBe(false);
    });
    it('removeGame() should remove an existing game from currentGames', () => {
        gameManager.currentGames[0] = mockGame;
        gameManager.removeGame(gameManager.currentGames[0]);
        expect(gameManager.currentGames.length).toBe(0);
    });
    it('endGame() should stop the timer and remove the game from the gameManager', () => {
        gameManager.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        gameManager.removeGame = jest.fn();
        gameManager.endGame(defaultID);
        expect(mockGame.timer.stopTimer).toHaveBeenCalled();
        expect(gameManager.removeGame).toHaveBeenCalledWith(mockGame);
    });
});
