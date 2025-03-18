import { Injectable } from '@angular/core';
import { ChatData } from '@app/interfaces/chat-data';
import { AuthService } from '@app/services/auth/auth.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { ChatMessage } from '@common/chat-message';
import { Observable, Subject } from 'rxjs';
import { ChatEvents } from './chat-events';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private chatEventsSubject = new Subject<{ event: ChatEvents; data?: any }>();
    chatEvents$ = this.chatEventsSubject.asObservable();

    allChatMessages: ChatMessage[];
    allChatMessagesSource: Subject<ChatMessage[]>;
    allChatMessagesObservable: Observable<ChatMessage[]>;
    isInitialized: boolean;
    roomId: string;

    constructor(
        private socketClientService: SocketClientService,
        private authService: AuthService,
    ) {
        this.allChatMessages = [];
        this.allChatMessagesSource = new Subject<ChatMessage[]>();
        this.allChatMessagesObservable = this.allChatMessagesSource.asObservable();
        this.isInitialized = false;
        this.roomId = this.socketClientService.roomId;
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
            this.authService.user$.subscribe((user) => {
                if (user) {
                    const message: ChatMessage = {
                        message: messageInput,
                        author: user.username,
                    };
                    this.socketClientService.send(ChatEvents.RoomMessage, message);
                }
            });
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
                this.clearMessages(); // Clear messages when the user leaves the room
                this.chatEventsSubject.next({ event: ChatEvents.RoomLeft }); // Emit custom event
                this.socketClientService.send(ChatEvents.RoomLeft, chatData); // Broadcast the event to all clients
            } else {
                this.allChatMessages.push(chatData.message);
                this.allChatMessagesSource.next(this.allChatMessages);
            }
        });

        this.isInitialized = true;
    }

    private clearMessages(): void {
        this.allChatMessages = [];
        this.allChatMessagesSource.next(this.allChatMessages);
    }
}
