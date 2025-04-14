import { Injectable, OnDestroy } from '@angular/core';
import { ChatData } from '@app/interfaces/chat-data';
import { AuthService } from '@app/services/auth/auth.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { ChatMessage } from '@common/chat-message';
import { Observable, Subject, Subscription } from 'rxjs';
import { ChatEvents } from './chat-events';

@Injectable({
    providedIn: 'root',
})
export class ChatService implements OnDestroy {
    private chatEventsSubject = new Subject<{ event: ChatEvents; data?: any }>();
    chatEvents$ = this.chatEventsSubject.asObservable();

    allChatMessages: ChatMessage[];
    allChatMessagesSource: Subject<ChatMessage[]>;
    allChatMessagesObservable: Observable<ChatMessage[]>;
    isInitialized: boolean;
    roomId: string;
    private messageAddedSubscription: Subscription;
    private roomLeftSubscription: Subscription;
    private userSubscription: Subscription;

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
        } else if (this.socketClientService.roomId) {
            // If we're rejoining the same game, still get the history to ensure we have all messages
            this.getHistory();
        } else {
            this.allChatMessagesSource.next(this.allChatMessages);
        }
    }

    sendMessageToRoom(messageInput: string): boolean {
        if (this.socketClientService.roomId) {
            const user = this.authService.getUser();
            if (user) {
                const message: ChatMessage = {
                    message: messageInput,
                    // author: user.username,
                    author: this.socketClientService.isOrganizer ? 'Organisateur' : this.socketClientService.playerName,
                    uid: user.uid,
                    avatar: user.avatarEquipped || 'https://res.cloudinary.com/dtu6fkkm9/image/upload/v1737478954/default-avatar_qcaycl.jpg',
                    border: user.borderEquipped,
                };
                this.socketClientService.send(ChatEvents.RoomMessage, message);
            }
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
        this.socketClientService.playerName = this.socketClientService.isOrganizer ? 'Organisateur' : this.socketClientService.playerName;
        return this.socketClientService.playerName;
    }

    configureChatSocketFeatures() {
        // Unsubscribe from previous subscriptions if they exist
        if (this.messageAddedSubscription) {
            this.messageAddedSubscription.unsubscribe();
        }
        if (this.roomLeftSubscription) {
            this.roomLeftSubscription.unsubscribe();
        }

        // Remove old event listeners
        this.socketClientService.socket.off(ChatEvents.MessageAdded);
        this.socketClientService.socket.off(ChatEvents.RoomLeft);

        // Subscribe to new messages
        const messageAddedHandler = (newMessage: ChatMessage) => {
            this.allChatMessages.push(newMessage);
            this.allChatMessagesSource.next(this.allChatMessages);
        };
        this.messageAddedSubscription = new Subscription();
        this.socketClientService.on(ChatEvents.MessageAdded, messageAddedHandler);

        // Subscribe to room left events
        const roomLeftHandler = (chatData: ChatData) => {
            if (!chatData || this.socketClientService.playerName === chatData.playerName) {
                this.socketClientService.roomId = '';
                this.socketClientService.playerName = '';
                this.socketClientService.isOrganizer = false;
                this.clearMessages();
                this.chatEventsSubject.next({ event: ChatEvents.RoomLeft });
                this.socketClientService.send(ChatEvents.RoomLeft, chatData);
            } else {
                this.allChatMessages.push(chatData.message);
                this.allChatMessagesSource.next(this.allChatMessages);
            }
        };
        this.roomLeftSubscription = new Subscription();
        this.socketClientService.on(ChatEvents.RoomLeft, roomLeftHandler);

        this.isInitialized = true;
    }

    private clearMessages(): void {
        this.allChatMessages = [];
        this.allChatMessagesSource.next(this.allChatMessages);
    }

    ngOnDestroy(): void {
        if (this.messageAddedSubscription) {
            this.messageAddedSubscription.unsubscribe();
        }
        if (this.roomLeftSubscription) {
            this.roomLeftSubscription.unsubscribe();
        }
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }
}
