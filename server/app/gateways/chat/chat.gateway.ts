import { ChatEvents } from '@app/constants/enum-classes';
import { UserService } from '@app/services/auth/user.service';
import { ChatService } from '@app/services/chat/chat.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { PushNotifService } from '@app/services/push-notif/push-notif.service';
import { QuickReplyService } from '@app/services/quick-reply/quick-reply.service';
import { ChatMessage } from '@common/chat-message';
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;
    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private chatService: ChatService,
        private quickReplyService: QuickReplyService,
        private gameManagerService: GameManagerService,
        private userService: UserService,
        private pushNotifService: PushNotifService,
    ) {}

    @SubscribeMessage(ChatEvents.RoomMessage)
    async roomMessage(clientSocket: Socket, message: ChatMessage) {
        message.date = new Date();
        const clientRoomId: string = Array.from(clientSocket.rooms.values())[1];
        this.chatService.addMessage(message, clientRoomId);
        this.server.to(clientRoomId).emit(ChatEvents.MessageAdded, message);

        // send push notif to all players
        try {
            const game = this.gameManagerService.getGameByRoomId(clientRoomId);
            game.players.forEach((player) => {
                const isInGame: boolean = Array.from(player.socket.rooms.values())[1] === clientRoomId;
                if (isInGame) {
                    const userUid = this.userService.getUserUidFromMap(player.socket.id);
                    if (userUid && userUid != message.uid) {
                        this.pushNotifService.onIngameMessage(message.message, userUid);
                    }
                }
            });

            // send push notif to organizer
            const isInGame: boolean = Array.from(game.organizer.socket.rooms.values())[1] === clientRoomId;
            if (isInGame) {
                const organizerUid = this.userService.getUserUidFromMap(game.organizer.socket.id);
                if (organizerUid && organizerUid != message.uid) {
                    this.pushNotifService.onIngameMessage(message.message, organizerUid);
                }
            }
        } catch (e) {
            this.logger.debug('Couldnt find game or players to send push notif');
        }
    }

    @SubscribeMessage(ChatEvents.GetHistory)
    getHistory(clientSocket: Socket) {
        const clientRoomId: string = Array.from(clientSocket.rooms.values())[1];
        return this.chatService.getHistory(clientRoomId);
    }

    @SubscribeMessage(ChatEvents.RequestQuickReplies)
    async handleQuickRepliesRequest(clientSocket: Socket, data: { user: string }) {
        const clientRoomId: string = Array.from(clientSocket.rooms.values())[1];
        const minInterval = 3000;

        // Check if the user has made a recent request
        if (!this.chatService.checkAndUpdateTimestamp(clientRoomId, data.user, minInterval)) {
            console.log('Quick-Reply: Please wait before making another request.');
            return;
        }

        try {
            // Get chat history
            const messageHistory = this.chatService.getHistory(clientRoomId);
            const history = messageHistory.map((h) => `${h.author}: ${h.message}`).join('\n');
            // Get Game Context
            const game = this.gameManagerService.getGameByRoomId(clientRoomId);
            const gameContext = game
                ? `Leaderboard of Players:\n${game.players.map((player) => `${player.name} (${player.points} points)`).join('\n')}\n`
                : '';

            const player = game.players.find((p) => p.name === data.user) ?? null;
            const isOrganizer = player === null;
            const playerContext = isOrganizer
                ? 'You are the game Organizer, you do not play.'
                : `${player.name}'s last answer was ${player.lastAnswerCorrect ? 'correct' : 'incorrect'}`;

            const fullContext = `${gameContext}${playerContext}`;
            const quickReplies = await this.quickReplyService.generateQuickReplies(clientRoomId, data.user, history, fullContext);
            // Send quick replies only to the requesting user
            clientSocket.emit(ChatEvents.QuickRepliesGenerated, quickReplies);
        } catch (error) {
            console.error('Error generating quick replies:', error);
            // default quick replies
            clientSocket.emit(ChatEvents.QuickRepliesGenerated, ['Wow!', 'Bien joué!', 'Intéressant!']);
        }
    }
}
