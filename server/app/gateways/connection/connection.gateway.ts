import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/player/player';
import { ChatEvents, ConnectEvents, DisconnectEvents, GameEvents, GameState } from '@app/constants/enum-classes';
import { UserService } from '@app/services/auth/user.service';
import { ChatService } from '@app/services/chat/chat.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { HistoryManagerService } from '@app/services/history-manager/history-manager.service';
import { ChatMessage } from '@common/chat-message';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ConnectionGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private chatService: ChatService,
        private gameManager: GameManagerService,
        private historyManager: HistoryManagerService,
        private userService: UserService,
    ) {}

    @SubscribeMessage(ConnectEvents.IdentifyClient)
    handleIdentify(@MessageBody() uid: string, @ConnectedSocket() client: Socket) {
        this.userService.addUserToMap(client.id, uid);
    }

    @SubscribeMessage(ConnectEvents.UserToGame)
    handleUserConnectedToGamePage(@ConnectedSocket() client: Socket) {
        this.connectUser(client);
    }

    @SubscribeMessage(DisconnectEvents.OrganizerDisconnected)
    handleOrganizerDisconnect(@ConnectedSocket() client: Socket) {
        const roomId = this.gameManager.socketRoomsMap.get(client);
        this.disconnectOrganizer(roomId, client);
        this.gameManager.socketRoomsMap.delete(client);
    }

    @SubscribeMessage(DisconnectEvents.Player)
    handlePlayerDisconnect(@ConnectedSocket() client: Socket) {
        const roomId = this.gameManager.socketRoomsMap.get(client);
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            const player = game.findTargetedPlayer(client);
            this.disconnectPlayer(game, player, roomId);
        }
        this.gameManager.socketRoomsMap.delete(client);
    }

    @SubscribeMessage(DisconnectEvents.UserFromResults)
    handleUserDisconnectedFromResultsPage(@ConnectedSocket() client: Socket, @MessageBody() playerName: string) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        this.disconnectUserFromResultsPage(roomId, client);
        if (playerName && game) game.removePlayer(playerName);
    }
    /* Nous avons géré le cas où un organisateur ou un joueur ''refresh'' sa page
    contrairement à une deconnexion en utilisant les boutons à cet effet ou le retour arrière du navigateur
    Appelé quand l'utilisateur fait close all sur le client léger
    */
    handleDisconnect(client: Socket) {
        if (this.userService.isUserInMap(client.id)) {
            const clientUid = this.userService.getUserUidFromMap(client.id);
            if (clientUid) {
                this.userService.logout(clientUid);
                this.userService.removeUserFromMap(client.id);
            }
        }
        const roomId = this.gameManager.socketRoomsMap.get(client);
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            const isOrganizer = game.organizer.socket.id === client.id;
            if (isOrganizer) {
                this.disconnectOrganizer(roomId, client);
            } else {
                const player = game.findTargetedPlayer(client);
                this.disconnectPlayer(game, player, roomId);
            }
        }
        this.gameManager.socketRoomsMap.delete(client);
    }

    private disconnectOrganizer(roomId: string, client: Socket) {
        const game = this.gameManager.getGameByRoomId(roomId);
        const clientIds = this.server.sockets.adapter.rooms.get(roomId);
        if (game && game.gameState !== GameState.RESULTS) {
            this.historyManager.removeGameRecord(roomId);
            this.disconnectOrganizerFromOtherPages(roomId, clientIds);
            client.emit(ChatEvents.RoomLeft);
        } else if (game && game.gameState === GameState.RESULTS) {
            this.disconnectUserFromResultsPage(roomId, client);
        }
    }

    private disconnectOrganizerFromOtherPages(roomId: string, clientIds: Set<string>) {
        this.server.to(roomId).emit(DisconnectEvents.OrganizerHasLeft);
        this.server.emit(GameEvents.End, roomId);
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            clientIds?.forEach((clientId) => {
                const clientSocket = this.server.sockets.sockets.get(clientId);
                // get the player object from the game
                const player = game.findTargetedPlayer(clientSocket);
                if (player && game.gameState !== GameState.RESULTS && game.gameState !== GameState.WAITING) {
                    this.userService.updateGameLog(player.uid, {
                        endTime: this.userService.formatTimestamp(new Date()),
                    });
                }
                this.gameManager.socketRoomsMap.delete(clientSocket);
                clientSocket.leave(roomId);
                clientSocket.emit(ChatEvents.RoomLeft);
            });
            this.gameManager.endGame(roomId);
            this.chatService.deleteHistory(roomId);
        }
    }
    private disconnectUserFromResultsPage(roomId: string, client: Socket) {
        if (client) {
            const game = this.gameManager.getGameByRoomId(roomId);
            if (client.id === game.organizer.socket.id) {
                this.sendDisconnectMessage('Organisateur', roomId);
            } else {
                const player = this.gameManager.getGameByRoomId(roomId).findTargetedPlayer(client);
                if (player) {
                    this.sendDisconnectMessage(player.name, roomId);

                    this.userService.updateGameLog(player.uid, {
                        endTime: this.userService.formatTimestamp(new Date()),
                        status: 'complete',
                    });
                }
            }
            client.leave(roomId);
            this.gameManager.socketRoomsMap.delete(client);
            const clientIds = this.server.sockets.adapter.rooms.get(roomId);
            if ((clientIds && clientIds.size === 0) || !clientIds) {
                this.server.emit(GameEvents.End, roomId);
                this.gameManager.endGame(roomId);
                this.chatService.deleteHistory(roomId);
            }
        }
    }

    private disconnectPlayer(game: Game, player: Player, roomId: string) {
        if (game) {
            switch (game.gameState) {
                case GameState.WAITING: {
                    this.sendDisconnectMessage(player.name, roomId);
                    this.disconnectPlayerFromWaitingPage(roomId, player, game);
                    break;
                }
                case GameState.GAMING: {
                    game.playersRemoved.push(player);
                    this.sendDisconnectMessage(player.name, roomId);
                    this.disconnectPlayerFromGamePage(game, player);
                    break;
                }
                case GameState.RESULTS: {
                    this.disconnectUserFromResultsPage(roomId, player.socket);
                    break;
                }
            }
            if (player.name && game) game.removePlayer(player.name);
        }
    }
    private disconnectPlayerFromWaitingPage(roomId: string, disconnectedPlayer: Player, game: Game) {
        const playersInfo = game.players
            .filter((player) => player.name !== disconnectedPlayer.name)
            .map((player) => ({
                name: player.name,
                avatar: player.equippedAvatar,
                banner: player.equippedBorder,
            }));
        this.server.to(roomId).emit(GameEvents.PlayerLeft, playersInfo);
        this.server.emit(GameEvents.PlayerLeftLobby, roomId);
    }

    private disconnectPlayerFromGamePage(game: Game, player: Player) {
        game.organizer.socket.emit(GameEvents.PlayerStatusUpdate, { name: player.name, isInGame: false });
        game.removePlayer(player.name);
        const date = this.userService.formatTimestamp(new Date());
        this.userService.updateGameLog(player.uid, { endTime: date });
        if (game.players.length === 0) {
            this.server.to(game.roomId).emit(ConnectEvents.AllPlayersLeft);
            this.disconnectOrganizer(game.roomId, game.organizer.socket);
        } else {
            game.checkAndPrepareForNextQuestion();
        }
    }

    private connectUser(client: Socket) {
        const roomId = Array.from(client.rooms.values())[1];
        const game = this.gameManager.getGameByRoomId(roomId);
        if (game) {
            this.setUserInGame(game, client);
            if (game.isGameReadyToStart()) {
                const currentQuestion = game.startGame();
                this.server.to(roomId).emit(GameEvents.QuestionsLength, currentQuestion.length);
                this.server.to(roomId).emit(GameEvents.NextQuestion, currentQuestion);
            }
        }
    }

    private setUserInGame(game: Game, client: Socket) {
        const isOrganizer = game.organizer?.socket.id === client.id;
        if (isOrganizer) {
            game.organizer.isInGame = true;
        } else {
            const player = game.findTargetedPlayer(client);
            player.isInGame = true;
        }
        game.gameState = GameState.GAMING;
    }

    private sendDisconnectMessage(playerName: string, roomId: string) {
        const systemMessage: ChatMessage = {
            message: `${playerName} a quitté`,
            author: 'System',
            date: new Date(),
        };
        const chatData = { message: systemMessage, roomId, playerName };
        this.chatService.addMessage(chatData.message, chatData.roomId);
        this.server.to(roomId).emit(ChatEvents.RoomLeft, chatData);
    }
}
