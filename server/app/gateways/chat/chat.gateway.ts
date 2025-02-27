import { ChatEvents } from '@app/constants/enum-classes';
import { ChatService } from '@app/services/chat/chat.service';
import { ChatMessage } from '@common/chat-message';
import { Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;
    constructor(private chatService: ChatService) {}

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(clientSocket: Socket, message: ChatMessage) {
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
}
