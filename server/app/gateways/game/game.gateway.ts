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

    @SubscribeMessage(GameEvents.SelectFromPlayer)
    handleSelected(@ConnectedSocket() client: Socket, @MessageBody() data: { choice: number }): void {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        const choiceSignal = game.handleChoiceChange(client, data.choice);
        if (!game.isRandomMode) game.organizer.socket.emit(GameEvents.PlayerChoiceToOrganizer, choiceSignal);
    }

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
    @SubscribeMessage(GameEvents.ModifyUpdate)
    handleModifiedAnswer(@ConnectedSocket() client: Socket, @MessageBody() data: { playerName: string; modified: boolean }) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        game.organizer.socket.emit(GameEvents.ModifyUpdate, data);
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
        if (game) {
            if (game.isRandomMode) {
                game.checkAndPrepareForNextQuestion(client);
            } else {
                game.preparePlayersForNextQuestion();
            }
        }
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
    handleCreateGame(@ConnectedSocket() client: Socket, @MessageBody() data: { quiz: Quiz; isRandomMode: boolean }) {
        const { quiz, isRandomMode } = data;
        const roomId = this.gameManager.createGame(quiz, client, isRandomMode);
        client.join(roomId);
        const game = this.gameManager.getGameByRoomId(roomId);
        game.gameState = GameState.WAITING;
        this.gameManager.socketRoomsMap.set(client, roomId);
        const lobbyInfos = { title: quiz.title, nbPlayers: game.players.length, roomId: roomId };
        this.server.emit(JoinEvents.LobbyCreated, lobbyInfos);
        return roomId;
    }

    @SubscribeMessage(GameEvents.FinalizePlayerAnswer)
    handlePlayerFinalizeAnswer(@ConnectedSocket() client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.finalizePlayerAnswer(client);
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
            client.emit(JoinEvents.ValidId);
        }
    }

    @SubscribeMessage(JoinEvents.Join)
    handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() data: { gameId: string; playerName: string }) {
        const { gameId, playerName } = data;
        const canJoinGame = this.gameManager.joinGame(gameId, playerName, client);
        const game = this.gameManager.getGameByRoomId(gameId);
        if (canJoinGame) {
            const playerNames = game.players.map((player) => player.name);
            client.emit(JoinEvents.CanJoin);
            const roomId = Array.from(client.rooms.values())[1];
            this.server.emit(JoinEvents.JoinSuccess,{ playerNames, roomId});
            this.gameManager.socketRoomsMap.set(client, data.gameId);
        } else if (game.playerExists(playerName)) {
            client.emit(JoinErrors.ExistingName);
        } else if (game.isPlayerBanned(playerName)) {
            client.emit(JoinErrors.BannedName);
        } else if (game.isNameOrganizer(playerName)) {
            client.emit(JoinErrors.OrganizerName);
        } else if (game.isLocked) {
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
        this.server.emit(GameEvents.AlertLockToggled, {isLocked, roomId});
    }
    @SubscribeMessage(GameEvents.PlayerBan)
    handleBanPlayer(@ConnectedSocket() client: Socket, @MessageBody() playerName: string) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.bannedNames.push(playerName.toLowerCase());
            game.removePlayer(playerName);
        }
        const playerNames = this.gameManager.getGameByRoomId(roomId).players.map((player) => player.name);
        this.server.emit(GameEvents.PlayerLeft, { playerNames, roomId});
    }
    @SubscribeMessage(GameEvents.PlayerInteraction)
    handlePlayerInteraction(@ConnectedSocket() client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        const player = game.findTargetedPlayer(client);
        player.interacted = true;
        if (!game.isRandomMode) game.organizer.socket.emit(GameEvents.PlayerInteraction, player.name);
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
            this.historyManager.saveGameRecordToDB(roomId, results.players);
        }
    }
}
