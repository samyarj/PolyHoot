import { Timer } from '@app/classes/game-timer/game-timer';
import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/player/player';
import { ChatEvents, GameEvents, GameState } from '@app/constants/enum-classes';
import { MOCK_QUESTIONS } from '@app/constants/mock-questions';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { ChatService } from '@app/services/chat/chat.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { HistoryManagerService } from '@app/services/history-manager/history-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { ConnectionGateway } from './connection.gateway';

describe('ConnectionGateway', () => {
    const defaultID = 'mockID';
    let gateway: ConnectionGateway;
    let mockGame = {} as unknown as Game;

    const chatServiceMock = {
        deleteHistory: jest.fn(),
        addMessage: jest.fn(),
    } as unknown as ChatService;

    const gameManagerServiceMock = {
        getGameByRoomId: jest.fn().mockReturnValue({}),
        endGame: jest.fn(),
    } as unknown as GameManagerService;

    const historyManagerServiceMock = {
        deleteHistory: jest.fn(),
        removeGameRecord: jest.fn(),
    } as unknown as HistoryManagerService;

    const mockRoomsMap = {
        set: jest.fn(),
        get: jest.fn().mockReturnValue(defaultID),
        delete: jest.fn(),
    } as unknown as Map<Socket, string>;

    const mockSocket = {
        id: 'abc',
        rooms: new Set(['room1', defaultID]),
        emit: jest.fn(),
        join: jest.fn(),
        leave: jest.fn(),
    } as unknown as Socket;

    const mockSocket2 = {
        id: 'def',
        rooms: new Set(['room', 'room2']),
        emit: jest.fn(),
        join: jest.fn(),
        leave: jest.fn(),
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

    beforeEach(async () => {
        gameManagerServiceMock.socketRoomsMap = mockRoomsMap;

        mockGame = {
            quiz: {
                title: 'Mock Quiz',
                questions: MOCK_QUESTIONS,
            } as unknown as Quiz,
            handleChoiceChange: jest.fn(),
            findTargetedPlayer: jest.fn(),
            pauseGame: jest.fn(),
            removePlayer: jest.fn(),
            organizer: {
                socket: mockSocket2,
            } as unknown as Player,
            playersRemoved: [],
            players: [],
            timer: {} as unknown as Timer,
        } as unknown as Game;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConnectionGateway,
                { provide: Socket, useValue: mockSocket },
                { provide: Server, useValue: mockServer },

                { provide: ChatService, useValue: chatServiceMock },
                { provide: GameManagerService, useValue: gameManagerServiceMock },
                { provide: HistoryManagerService, useValue: historyManagerServiceMock },
            ],
        }).compile();

        gateway = module.get<ConnectionGateway>(ConnectionGateway);
    });

    beforeEach(() => {
        mockGame.organizer.socket = {
            emit: jest.fn(),
            id: 'def',
        } as unknown as Socket;

        gateway.server = mockServer;
    });

    it('handleUserConnectedToGamePage() should handle the connection of the organizer', () => {
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);
        mockGame.isGameReadyToStart = jest.fn().mockReturnValue(false);
        mockGame.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        mockGame.startGame = jest.fn().mockReturnValue(MOCK_QUESTIONS[0]);
        gameManagerServiceMock.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        gateway.handleUserConnectedToGamePage(mockSocket2);
        expect(mockGame.gameState).toBe(GameState.GAMING);
        expect(mockGame.organizer.isInGame).toBe(true);
        delete mockGame.organizer;
        gateway.handleUserConnectedToGamePage(mockSocket2);
        expect(mockPlayer.isInGame).toBe(true);
        mockGame.organizer = {
            socket: {
                emit: jest.fn(),
                id: 'def',
            } as unknown as Socket,
        } as unknown as Player;
    });
    it('handleUserConnectedToGamePage() should handle the connection of the player', () => {
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);
        mockGame.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        mockGame.isGameReadyToStart = jest.fn().mockReturnValue(true);
        mockGame.startGame = jest.fn().mockReturnValue(MOCK_QUESTIONS[0]);
        gameManagerServiceMock.getGameByRoomId = jest.fn().mockReturnValue(mockGame);

        gateway.handleUserConnectedToGamePage(mockSocket);
        expect(gameManagerServiceMock.getGameByRoomId).toHaveBeenCalledWith(defaultID);
        expect(mockServer.to(defaultID).emit).toHaveBeenCalledWith(GameEvents.NextQuestion, MOCK_QUESTIONS[0]);
    });
    it('handleOrganizerDisconnect() should handle the disconnection of an organizer', () => {
        gateway['disconnectOrganizer'] = jest.fn();
        gateway.handleOrganizerDisconnect(mockSocket);
        expect(gateway['disconnectOrganizer']).toHaveBeenCalledWith(defaultID, mockSocket);
        expect(mockRoomsMap.delete).toHaveBeenCalledWith(mockSocket);
    });
    it('handlePlayerDisconnect() should handle the disconnection of a player', () => {
        gateway['disconnectPlayer'] = jest.fn();
        gateway.handlePlayerDisconnect(mockSocket);
        expect(gateway['disconnectPlayer']).toHaveBeenCalled();
    });
    it('handleUserDisconnectedFromResultsPage() should call the disconnectUserFrom ResultsPage', () => {
        const playerName = 'Minutu';
        mockGame.removePlayer = jest.fn();
        gateway['disconnectUserFromResultsPage'] = jest.fn();
        gameManagerServiceMock.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        gateway.handleUserDisconnectedFromResultsPage(mockSocket, playerName);
        expect(mockGame.removePlayer).toHaveBeenCalledWith(playerName);
        expect(gateway['disconnectUserFromResultsPage']).toHaveBeenCalled();
    });
    it('handleDisconnect() should call disconnectOrganizer if the player is an organizer', () => {
        mockGame.organizer.socket = mockSocket2;
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);

        gateway['disconnectOrganizer'] = jest.fn().mockImplementation();
        mockGame.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        gameManagerServiceMock.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        gateway.handleDisconnect(mockSocket2);
        expect(gateway['disconnectOrganizer']).toHaveBeenCalled();
    });
    it('handleDisconnect() should call disconnectPlayer if the player is not an organizer', () => {
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);
        mockGame.organizer.socket = mockSocket2;
        mockGame.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        mockGame.removePlayer = jest.fn();
        gateway['disconnectPlayer'] = jest.fn().mockImplementation();
        gateway.handleDisconnect(mockSocket);
        expect(gateway['disconnectPlayer']).toHaveBeenCalled();
    });
    it('disconnectOrganizer() should remove all players in the game, end it and call deleteHistory from chatService', () => {
        gameManagerServiceMock.endGame = jest.fn();
        gateway['disconnectOrganizer'](defaultID, mockSocket);
        expect(mockServer.sockets.sockets.get(expect.anything()).leave).toHaveBeenCalledTimes(clientIds.size);
        expect(gameManagerServiceMock.endGame).toHaveBeenCalledWith(defaultID);
        expect(chatServiceMock.deleteHistory).toHaveBeenCalledWith(defaultID);
    });
    it('disconnectUserFromResultsPage() should emit proper events and call apropriate functions if client is player', () => {
        gateway['sendDisconnectMessage'] = jest.fn();
        const roomId = 'room1';
        const mockPlayer = new Player('sam_sulek', false, mockSocket);
        mockGame.findTargetedPlayer = jest.fn().mockReturnValue(mockPlayer);
        gameManagerServiceMock.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        mockSocket.leave = jest.fn();
        mockServer.sockets.adapter.rooms.get = jest.fn().mockReturnValue('room1');
        gameManagerServiceMock.endGame = jest.fn();
        chatServiceMock.deleteHistory = jest.fn();
        gateway['disconnectUserFromResultsPage'](roomId, mockSocket);
        expect(gateway['sendDisconnectMessage']).toHaveBeenCalledWith(mockPlayer.name, roomId);
        expect(mockSocket.leave).toHaveBeenCalledWith(roomId);
        expect(gameManagerServiceMock.socketRoomsMap.delete).toHaveBeenCalledWith(mockSocket);
    });
    it('disconnectUserFromResultsPage() should emit proper events and call apropriate functions if client is organizer', () => {
        gateway['sendDisconnectMessage'] = jest.fn();
        const roomId = 'room1';
        mockSocket2.leave = jest.fn();
        mockServer.sockets.adapter.rooms.get = jest.fn().mockReturnValue('room1');
        gameManagerServiceMock.endGame = jest.fn();
        chatServiceMock.deleteHistory = jest.fn();
        gateway['disconnectUserFromResultsPage'](roomId, mockSocket2);
        expect(gateway['sendDisconnectMessage']).toHaveBeenCalledWith('Organisateur', roomId);
        expect(mockSocket2.leave).toHaveBeenCalledWith(roomId);
        expect(gameManagerServiceMock.socketRoomsMap.delete).toHaveBeenCalledWith(mockSocket2);
    });
    it('disconnectOrganizer() should disconnect from results page if game state is results', () => {
        gameManagerServiceMock.getGameByRoomId = jest.fn().mockReturnValue(mockGame);
        mockGame.gameState = GameState.RESULTS;
        gateway['disconnectUserFromResultsPage'] = jest.fn();
        gateway['disconnectOrganizer']('roomId', mockSocket);
        expect(gateway['disconnectUserFromResultsPage']).toHaveBeenCalled();
    });
    it('disconnectUserFromResultsPage() should end the game if there are no more players', () => {
        const roomId = 'room1';
        mockSocket.leave = jest.fn();
        mockRoomsMap.delete = jest.fn();
        mockServer.sockets.adapter.rooms.get = jest.fn().mockReturnValue(undefined);
        gameManagerServiceMock.endGame = jest.fn();
        chatServiceMock.deleteHistory = jest.fn();
        gateway['disconnectUserFromResultsPage'](roomId, mockSocket);
        expect(gameManagerServiceMock.endGame).toHaveBeenCalledWith(roomId);
        expect(chatServiceMock.deleteHistory).toHaveBeenCalledWith(roomId);
    });
    it('disconnectPlayer() should call appropriate disconnect functions depending on gameState', () => {
        const game = new Game(defaultID, new Quiz(), mockSocket, false);
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);
        game.removePlayer = jest.fn();
        gateway['disconnectPlayerFromWaitingPage'] = jest.fn();
        gateway['disconnectPlayerFromGamePage'] = jest.fn();
        gateway['disconnectUserFromResultsPage'] = jest.fn();
        game.gameState = GameState.WAITING;
        gateway['disconnectPlayer'](game, mockPlayer, defaultID);
        expect(gateway['disconnectPlayerFromWaitingPage']).toHaveBeenCalledWith(defaultID, mockPlayer, game);
        game.gameState = GameState.GAMING;
        gateway['disconnectPlayer'](game, mockPlayer, defaultID);
        expect(gateway['disconnectPlayerFromGamePage']).toHaveBeenCalledWith(game, mockPlayer);
        game.gameState = GameState.RESULTS;
        gateway['disconnectPlayer'](game, mockPlayer, defaultID);
        expect(gateway['disconnectUserFromResultsPage']).toHaveBeenCalledWith(defaultID, mockPlayer.socket);
    });
    it('disconnectPlayerFromWaitingPage() should emit the correct event if not random mode', () => {
        const game = new Game(defaultID, new Quiz(), mockSocket, false);
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);

        gateway['disconnectPlayerFromWaitingPage'](defaultID, mockPlayer, game);
        expect(mockServer.to(defaultID).emit).toHaveBeenCalled();
    });
    it('disconnectPlayerFromWaitingPage() should call disconnectOrganizer and emit the correct event if random mode', () => {
        const game = new Game(defaultID, new Quiz(), mockSocket2, true);
        const mockPlayer = new Player('Organisateur', false, mockSocket2);
        gateway['disconnectOrganizer'] = jest.fn();
        gateway['disconnectPlayerFromWaitingPage'](defaultID, mockPlayer, game);
        expect(gateway['disconnectOrganizer']).toHaveBeenCalled();
        expect(mockServer.to(defaultID).emit).toHaveBeenCalled();
    });
    it('disconnectPlayerFromGamePage() should emit the correct events and disconnect the organizer if there are no more players', () => {
        const game = new Game(defaultID, new Quiz(), mockSocket2, false);
        game.roomId = '123';
        game.players = [];
        game.isRandomMode = false;
        game.organizer.socket.emit = jest.fn();
        game.removePlayer = jest.fn();
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);
        gateway['disconnectOrganizer'] = jest.fn();
        gateway['disconnectPlayerFromGamePage'](game, mockPlayer);
        expect(game.removePlayer).toHaveBeenCalledWith(mockPlayer.name);
        expect(game.organizer.socket.emit).toHaveBeenCalled();
        expect(gateway['disconnectOrganizer']).toHaveBeenCalledWith(game.roomId, game.organizer.socket);
    });
    it('disconnectPlayerFromGamePage() should check and prepare for next question if there is players in game', () => {
        const game = new Game(defaultID, new Quiz(), mockSocket2, false);
        game.roomId = '123';
        game.players = [new Player('sam_sulek', false, mockSocket2)];
        game.isRandomMode = false;
        game.checkAndPrepareForNextQuestion = jest.fn();
        game.removePlayer = jest.fn();
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);
        gateway['disconnectPlayerFromGamePage'](game, mockPlayer);

        expect(game.organizer.socket.emit).toHaveBeenCalled();
        expect(game.removePlayer).toHaveBeenCalledWith(mockPlayer.name);
        expect(game.checkAndPrepareForNextQuestion).toHaveBeenCalled();
    });
    it('disconnectPlayerFromGamePage() should check and prepare for next question if game is in random mode', () => {
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);
        mockGame.roomId = '123';
        mockGame.players = [mockPlayer];
        mockGame.isRandomMode = true;
        mockGame.checkAndPrepareForNextQuestion = jest.fn();
        gateway['disconnectPlayerFromGamePage'](mockGame, mockPlayer);
        expect(mockGame.checkAndPrepareForNextQuestion).toHaveBeenCalled();
    });
    it('disconnectPlayerFromGamePage() should check and prepare for next question if game is in random mode', () => {
        const mockPlayer = new Player('sam_sulek', false, mockSocket2);
        mockGame.roomId = '123';
        mockGame.players = [];
        mockGame.isRandomMode = true;
        mockGame.checkAndPrepareForNextQuestion = jest.fn();
        gateway['disconnectPlayerFromGamePage'](mockGame, mockPlayer);
        expect(gameManagerServiceMock.endGame).toHaveBeenCalled();
    });
    it('disconnectOrganizerFromOtherPages should remove all the players from the game', () => {
        mockServer.sockets.adapter.rooms.get = jest.fn().mockReturnValue(mockSocket);
        gameManagerServiceMock.endGame = jest.fn();
        chatServiceMock.deleteHistory = jest.fn();
        gateway['disconnectOrganizerFromOtherPages']('roomId', new Set(['1', '2', '3']));
        expect(mockRoomsMap.delete).toHaveBeenCalledWith(mockSocket);
        expect(mockSocket.leave).toHaveBeenCalled();
    });
    it('disconnectOrganizerFromOtherPages should gremove all the players from the game', () => {
        mockServer.sockets.adapter.rooms.get = jest.fn().mockReturnValue(mockSocket);
        gameManagerServiceMock.endGame = jest.fn();
        chatServiceMock.deleteHistory = jest.fn();
        gateway['disconnectOrganizerFromOtherPages']('roomId', undefined);
        expect(gameManagerServiceMock.endGame).toHaveBeenCalledWith('roomId');
    });

    it('sendDisconnectMessage should emit to room', () => {
        const playerName = 'Ronaldinho';
        const roomId = 'mockID';
        const systemMessage = {
            message: `${playerName} a quitté`,
            author: 'System',
            date: expect.any(Date),
        };
        const chatData = { message: systemMessage, roomId, playerName };
        chatServiceMock.addMessage = jest.fn();
        gateway['sendDisconnectMessage'](playerName, roomId);
        expect(mockServer.to(roomId).emit).toHaveBeenCalledWith(ChatEvents.RoomLeft, chatData);
    });
});
