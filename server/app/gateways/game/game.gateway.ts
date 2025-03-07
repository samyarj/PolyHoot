import { GameEvents, GameState, JoinErrors, JoinEvents, TimerEvents } from '@app/constants/enum-classes';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { HistoryManagerService } from '@app/services/history-manager/history-manager.service';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private gameManager: GameManagerService,
        private historyManager: HistoryManagerService,
    ) {}

    @SubscribeMessage(TimerEvents.Pause)
    handlePauseGame(@ConnectedSocket() client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.pauseGame();
        }
    }

    @SubscribeMessage(TimerEvents.AlertGameMode)
    handleAlertGameMode(@ConnectedSocket() client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.startAlertMode();
        }
    }
    @SubscribeMessage(GameEvents.StartQuestionCountdown)
    handleNextQuestion(@ConnectedSocket() client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.startQuestionCountdown();
        }
    }
    @SubscribeMessage(JoinEvents.TitleRequest)
    handleGetTitleForPlayer(@ConnectedSocket() client: Socket): string {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            return game.quiz.title;
        } else return 'Vue Joueur';
    }
    @SubscribeMessage(GameEvents.QuestionEndByTimer)
    handleQuestionEndByTimer(@ConnectedSocket() client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) game.preparePlayersForNextQuestion();
    }

    @SubscribeMessage(GameEvents.GetCurrentGames)
    handleGetCurrentGames(@ConnectedSocket() client: Socket) {
        const currentGamesInfos = [];
        this.gameManager.currentGames.forEach((game) => {
            currentGamesInfos.push({
                title: game.quiz.title,
                nbPlayers: game.players.length,
                roomId: game.roomId,
                isLocked: game.isLocked,
            });
        });
        this.server.emit(GameEvents.GetCurrentGames, currentGamesInfos);
    }

    @SubscribeMessage(JoinEvents.Create)
    handleCreateGame(@ConnectedSocket() client: Socket, @MessageBody() data: Quiz) {
        const quiz = data;
        const roomId = this.gameManager.createGame(quiz, client);
        client.join(roomId);
        const game = this.gameManager.getGameByRoomId(roomId);
        game.gameState = GameState.WAITING;
        this.gameManager.socketRoomsMap.set(client, roomId);
        const lobbyInfos = { title: quiz.title, nbPlayers: game.players.length, roomId: roomId, isLocked: game.isLocked };
        console.log('Dans createGame avec ces infos ', lobbyInfos);
        this.server.emit(JoinEvents.LobbyCreated, lobbyInfos);
        return roomId;
    }

    @SubscribeMessage(GameEvents.FinalizePlayerAnswer)
    handleFinalizePlayerAnswer(@ConnectedSocket() client: Socket, @MessageBody() answerData: { choiceSelected: boolean[]; qreAnswer: number }) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.finalizePlayerAnswer(client, answerData);
        }
    }

    @SubscribeMessage(GameEvents.QRLAnswerSubmitted)
    handleQRLAnswer(@ConnectedSocket() client: Socket, @MessageBody() data: { player: string; playerAnswer: string }) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        game.organizer.socket.emit(GameEvents.QRLAnswerSubmitted, data);
    }

    @SubscribeMessage(JoinEvents.ValidateGameId)
    handleValidGameId(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
        const isValidId = this.gameManager.validRoom(data);
        const game = this.gameManager.getGameByRoomId(data);
        let isRoomLocked: boolean;
        if (game) isRoomLocked = game.isLocked;

        if (!isValidId) {
            client.emit(JoinErrors.InvalidId);
        } else if (isRoomLocked) {
            client.emit(JoinErrors.RoomLocked);
        } else {
            client.emit(JoinEvents.ValidId, data);
        }
    }

    @SubscribeMessage(JoinEvents.Join)
    handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string; playerName: string }) {
        const { gameId, playerName } = data;
        console.log(playerName, 'Essaye de join la partie ', gameId);
        const canJoinGame = this.gameManager.joinGame(gameId, playerName, client);
        console.log('normalement canJoinGame est false', canJoinGame);
        const game = this.gameManager.getGameByRoomId(gameId);
        if (canJoinGame) {
            const playerNames = game.players.map((player) => player.name);
            client.emit(JoinEvents.CanJoin, { playerNames, gameId });
            const roomId = Array.from(client.rooms.values())[1];
            this.server.emit(JoinEvents.JoinSuccess, { playerNames, roomId });
            this.server.emit(JoinEvents.JoinSuccess, { playerNames, roomId });
            this.gameManager.socketRoomsMap.set(client, data.gameId);
        } /* else if (game.playerExists(playerName)) {
            client.emit(JoinErrors.ExistingName);
        }*/ else if (game.isPlayerBanned(playerName)) {
            console.log('normalement ça rentre ici pcq isplayerBanned est true');
            client.emit(JoinErrors.BannedName);
        } /* else if (game.isNameOrganizer(playerName)) {
            client.emit(JoinErrors.OrganizerName);
        } */ else if (game.isLocked) {
            client.emit(JoinErrors.RoomLocked);
        } else {
            client.emit(JoinErrors.Generic);
        }
    }

    @SubscribeMessage(GameEvents.StartGameCountdown)
    handleStartGameCountdown(@ConnectedSocket() client: Socket, @MessageBody() timerValue: number) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.startGameCountdown(timerValue);
            this.server.to(roomId).emit(GameEvents.Title, game.quiz.title);
        }
    }

    @SubscribeMessage(GameEvents.StartGame)
    handleStartGame(@ConnectedSocket() client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) this.historyManager.addGameRecord(game.quiz.title, roomId);
    }

    @SubscribeMessage(GameEvents.ToggleLock)
    handleGameLock(@ConnectedSocket() client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        const isLocked = game.toggleGameLock();
        this.server.emit(GameEvents.AlertLockToggled, {  isLocked, roomId  });
    }
    @SubscribeMessage(GameEvents.PlayerBan)
    handleBanPlayer(@ConnectedSocket() client: Socket, @MessageBody() playerName: string) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.bannedNames.push(playerName.toLowerCase());
            const player = game.players.find((player) => player.name === playerName);
            player.socket.emit(GameEvents.PlayerBanned);
            game.removePlayer(playerName);
        }
        const playerNames = this.gameManager.getGameByRoomId(roomId).players.map((player) => player.name);
        this.server.emit(GameEvents.PlayerLeft, { playerNames, roomId });
    }

    @SubscribeMessage(GameEvents.CorrectionFinished)
    handleCorrectionFinished(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { pointsTotal: { playerName: string; points: number }[]; answers: number[] },
    ) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        game.updatePointsQRL(data);
    }

    @SubscribeMessage(GameEvents.ShowResults)
    handleShowResults(@ConnectedSocket() client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            const results = game.getResults();
            if (results) this.server.to(roomId).emit(GameEvents.SendResults, results);
            game.gameState = GameState.RESULTS;
            this.historyManager.saveGameRecordToDB(roomId, results);
        }
    }
}
