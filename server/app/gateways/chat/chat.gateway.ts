import { ChatEvents } from '@app/constants/enum-classes';
import { ChatService } from '@app/services/chat/chat.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { QuickReplyService } from '@app/services/quick-reply/quick-reply.service';
import { ChatMessage } from '@common/chat-message';
import { Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;

    constructor(
        private chatService: ChatService,
        private quickReplyService: QuickReplyService,
        private gameManagerService: GameManagerService,
    ) {}

    @SubscribeMessage(ChatEvents.RoomMessage)
    async roomMessage(clientSocket: Socket, message: ChatMessage) {
        message.date = new Date();
        const clientRoomId: string = Array.from(clientSocket.rooms.values())[1];
        this.chatService.addMessage(message, clientRoomId);
        this.server.to(clientRoomId).emit(ChatEvents.MessageAdded, message);
    }

    @SubscribeMessage(ChatEvents.GetHistory)
    getHistory(clientSocket: Socket) {
        const clientRoomId: string = Array.from(clientSocket.rooms.values())[1];
        return this.chatService.getHistory(clientRoomId);
    }

    @SubscribeMessage(ChatEvents.RequestQuickReplies)
    async handleQuickRepliesRequest(clientSocket: Socket, data: { user: string }) {
        const clientRoomId: string = Array.from(clientSocket.rooms.values())[1];
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
            console.log(fullContext);
            const quickReplies = await this.quickReplyService.generateQuickReplies(clientRoomId, data.user, history, fullContext);
            console.log(quickReplies);
            // Send quick replies only to the requesting user
            clientSocket.emit(ChatEvents.QuickRepliesGenerated, quickReplies);
        } catch (error) {
            console.error('Error generating quick replies:', error);
            // default quick replies
            clientSocket.emit(ChatEvents.QuickRepliesGenerated, ['Hello!', 'Nice to meet you!', 'How are you?']);
        }
    }
}
