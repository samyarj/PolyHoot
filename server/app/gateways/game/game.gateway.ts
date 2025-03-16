import { GameEvents, GameState, JoinErrors, JoinEvents, TimerEvents } from '@app/constants/enum-classes';
import { WsAuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedSocket } from '@app/interface/authenticated-request';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { UserService } from '@app/services/auth/user.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { HistoryManagerService } from '@app/services/history-manager/history-manager.service';
import { UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
@UseGuards(WsAuthGuard)
export class GameGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private gameManager: GameManagerService,
        private historyManager: HistoryManagerService,
        private userService: UserService,
    ) {}

    @SubscribeMessage(TimerEvents.Pause)
    handlePauseGame(@ConnectedSocket() client: AuthenticatedSocket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.pauseGame();
        }
    }

    @SubscribeMessage(TimerEvents.AlertGameMode)
    handleAlertGameMode(@ConnectedSocket() client: AuthenticatedSocket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.startAlertMode();
        }
    }
    @SubscribeMessage(GameEvents.StartQuestionCountdown)
    handleNextQuestion(@ConnectedSocket() client: AuthenticatedSocket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.startQuestionCountdown();
        }
    }
    @SubscribeMessage(JoinEvents.TitleRequest)
    handleGetTitleForPlayer(@ConnectedSocket() client: AuthenticatedSocket): string {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            return game.quiz.title;
        } else return 'Vue Joueur';
    }
    @SubscribeMessage(GameEvents.QuestionEndByTimer)
    handleQuestionEndByTimer(@ConnectedSocket() client: AuthenticatedSocket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) game.preparePlayersForNextQuestion();
    }

    @SubscribeMessage(GameEvents.GetCurrentPlayers)
    handleCurrentPlayers(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { roomId: string }) {
        const roomId = data.roomId;
        const game = this.gameManager.getGameByRoomId(roomId);
        const playerNames = game.players.map((player) => player.name);
        return playerNames;
    }

    @SubscribeMessage(GameEvents.GetCurrentGames)
    handleGetCurrentGames(@ConnectedSocket() client: AuthenticatedSocket) {
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
    handleCreateGame(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: Quiz) {
        const quiz = data;
        const roomId = this.gameManager.createGame(quiz, client);
        client.join(roomId);
        const game = this.gameManager.getGameByRoomId(roomId);
        game.gameState = GameState.WAITING;
        this.gameManager.socketRoomsMap.set(client, roomId);
        const lobbyInfos = { title: quiz.title, nbPlayers: game.players.length, roomId: roomId, isLocked: game.isLocked };
        this.server.emit(JoinEvents.LobbyCreated, lobbyInfos);
        return roomId;
    }

    @SubscribeMessage(GameEvents.FinalizePlayerAnswer)
    async handleFinalizePlayerAnswer(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() answerData: { choiceSelected: boolean[]; qreAnswer: number },
    ) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            const player = game.findTargetedPlayer(client);
            const wasCorrect = game.finalizePlayerAnswer(client, answerData);

            // Update user stats if they are authenticated
            if (client.user?.uid) {
                const newStats = {
                    nQuestions: 1,
                    nGoodAnswers: wasCorrect ? 1 : 0,
                };
                await this.userService.updateStats(client.user.uid, newStats);
            }
        }
    }

    @SubscribeMessage(GameEvents.QRLAnswerSubmitted)
    handleQRLAnswer(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() playerAnswer: string) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        console.log('2:Data reçue du serveur ', playerAnswer);
        const playerName = game.players.find((player) => player.socket === client).name;
        game.organizer.socket.emit(GameEvents.QRLAnswerSubmitted, { playerName, playerAnswer });
    }

    @SubscribeMessage(JoinEvents.ValidateGameId)
    handleValidGameId(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: string) {
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
    handleJoinGame(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { gameId: string; playerName: string }) {
        const { gameId, playerName } = data;
        const canJoinGame = this.gameManager.joinGame(gameId, playerName, client);
        const game = this.gameManager.getGameByRoomId(gameId);
        if (canJoinGame) {
            const playerNames = game.players.map((player) => player.name);
            client.emit(JoinEvents.CanJoin, { playerNames, gameId });
            const roomId = Array.from(client.rooms.values())[1];
            this.server.emit(JoinEvents.JoinSuccess, { playerNames, roomId });
            this.gameManager.socketRoomsMap.set(client, data.gameId);
        } else if (game.isPlayerBanned(playerName)) {
            client.emit(JoinErrors.BannedName);
        } else if (game.isLocked) {
            client.emit(JoinErrors.RoomLocked);
        } else {
            client.emit(JoinErrors.Generic);
        }
    }

    @SubscribeMessage(GameEvents.StartGameCountdown)
    handleStartGameCountdown(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() timerValue: number) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            game.startGameCountdown(timerValue);
            this.server.to(roomId).emit(GameEvents.Title, game.quiz.title);
        }
    }

    @SubscribeMessage(GameEvents.StartGame)
    async handleStartGame(@ConnectedSocket() client: AuthenticatedSocket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            // Only increment games for non-organizer players
            if (client.user?.uid && game.organizer.socket.id !== client.id) {
                await this.userService.incrementGames(client.user.uid);
            }
            // Only create the game record if this is the organizer
            if (game.organizer.socket.id === client.id) {
                this.historyManager.addGameRecord(game.quiz.title, roomId);
            }
        }
    }

    @SubscribeMessage(GameEvents.ToggleLock)
    handleGameLock(@ConnectedSocket() client: AuthenticatedSocket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        const isLocked = game.toggleGameLock();
        this.server.emit(GameEvents.AlertLockToggled, { isLocked, roomId });
    }
    @SubscribeMessage(GameEvents.PlayerBan)
    handleBanPlayer(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() playerName: string) {
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
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { pointsTotal: { playerName: string; points: number }[] /*  answers: number[]  */ },
    ) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        game.updatePointsQRL(data);
    }

    @SubscribeMessage(GameEvents.ShowResults)
    async handleShowResults(@ConnectedSocket() client: AuthenticatedSocket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            const results = game.getResults();
            if (results) {
                // Find the player with the highest points who is still in the game
                const winner = results.filter((player) => player.isInGame).reduce((prev, current) => (prev.points > current.points ? prev : current));

                // Find the winner's socket to get their user ID
                const winnerSocket = game.players.find((p) => p.name === winner.name)?.socket as AuthenticatedSocket;
                if (winnerSocket?.user?.uid) {
                    console.log('Incrementing wins for user:', winnerSocket.user.uid);
                    await this.userService.incrementWins(winnerSocket.user.uid);
                }

                // Update time spent for all authenticated players
                for (const player of game.players) {
                    const playerSocket = player.socket as AuthenticatedSocket;
                    if (playerSocket?.user?.uid) {
                        await this.userService.updateStats(playerSocket.user.uid, {
                            timeSpent: game.timer.timerValue,
                        });
                    }
                }

                this.server.to(roomId).emit(GameEvents.SendResults, results);
                game.gameState = GameState.RESULTS;
                this.historyManager.saveGameRecordToDB(roomId, results);
            }
        }
    }
}
