import { Injectable } from '@angular/core';
import { ChatData } from '@app/interfaces/chat-data';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { ChatMessage } from '@common/chat-message';
import { Observable, Subject } from 'rxjs';
import { ChatEvents } from './chat-events';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    allChatMessages: ChatMessage[];
    allChatMessagesSource: Subject<ChatMessage[]>;
    allChatMessagesObservable: Observable<ChatMessage[]>;
    isInitialized: boolean;
    roomId: string;

    constructor(private socketClientService: SocketClientService) {
        this.allChatMessages = [];
        this.allChatMessagesSource = new Subject<ChatMessage[]>();
        this.allChatMessagesObservable = this.allChatMessagesSource.asObservable();
        this.isInitialized = false;
        this.roomId = this.socketClientService.roomId;
        this.socketClientService.canChat = true;
    }
    get canChat() {
        return this.socketClientService.canChat;
    }

    isRoomIdCurrent(): boolean {
        return this.roomId === this.socketClientService.roomId;
    }

    retrieveRoomIdChat() {
        if (!this.isRoomIdCurrent()) {
            this.getHistory();
            this.roomId = this.socketClientService.roomId;
        } else {
            this.allChatMessagesSource.next(this.allChatMessages);
        }
    }

    sendMessageToRoom(messageInput: string): boolean {
        if (this.socketClientService.roomId) {
            const message: ChatMessage = {
                message: messageInput,
                author: this.getUserName(),
            };
            this.socketClientService.send(ChatEvents.RoomMessage, message);
            return true;
        }
        return false;
    }

    getHistory() {
        this.socketClientService.send(ChatEvents.GetHistory, (history: ChatMessage[]) => {
            this.allChatMessages = history;
            this.allChatMessagesSource.next(this.allChatMessages);
        });
    }

    getUserName() {
        return this.socketClientService.isOrganizer ? (this.socketClientService.playerName = 'Organisateur') : this.socketClientService.playerName;
    }

    configureChatSocketFeatures() {
        this.socketClientService.on(ChatEvents.MessageAdded, (newMessage: ChatMessage) => {
            this.allChatMessages.push(newMessage);
            this.allChatMessagesSource.next(this.allChatMessages);
        });
        this.socketClientService.on(ChatEvents.RoomLeft, (chatData: ChatData) => {
            if (!chatData || this.socketClientService.playerName === chatData.playerName) {
                this.socketClientService.roomId = '';
                this.socketClientService.playerName = '';
                this.socketClientService.isOrganizer = false;
                this.socketClientService.canChat = true;
            } else {
                this.allChatMessages.push(chatData.message);
                this.allChatMessagesSource.next(this.allChatMessages);
            }
        });

        this.isInitialized = true;
    }
}
