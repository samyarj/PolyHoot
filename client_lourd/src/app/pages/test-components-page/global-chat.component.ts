import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldValue } from '@angular/fire/firestore';
import { FirebaseChatMessage } from '@app/interfaces/chat-message';
import { FirebaseChatService } from '@app/services/chat-services/firebase/firebase-chat.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-global-chat',
    templateUrl: './global-chat.component.html',
    styleUrls: ['./global-chat.component.scss'],
})
export class GlobalChatComponent implements OnInit, OnDestroy {
    chatMessages: FirebaseChatMessage[] = [];
    chatMessagesLoading: boolean = true;
    name = 'Chat Général';
    private messagesSubscription: Subscription;
    private lastMessageDate: FieldValue; // Track last message date for pagination
    isFetchingOlderMessages: boolean = false; // Prevent multiple fetches at once

    constructor(private firebaseChatService: FirebaseChatService) {}

    ngOnInit(): void {
        // Subscribe to live chat messages
        this.messagesSubscription = this.firebaseChatService.getMessages().subscribe({
            next: (messages) => {
                this.chatMessages = messages;
                if (messages.length > 0) {
                    this.lastMessageDate = messages[0].date; // Track oldest message date
                }
                this.chatMessagesLoading = false;
            },
            error: (err) => {
                console.error('Error while fetching messages:', err);
                this.chatMessagesLoading = false;
            },
        });
    }

    /**
     * Load older messages when scrolling to the top.
     */
    loadOlderMessages(): void {
        if (this.isFetchingOlderMessages || !this.lastMessageDate) return;

        this.isFetchingOlderMessages = true;
        this.firebaseChatService.loadOlderMessages(this.lastMessageDate).subscribe({
            next: (olderMessages) => {
                if (olderMessages.length > 0) {
                    // Merge older messages while maintaining order
                    this.chatMessages = [...olderMessages, ...this.chatMessages];
                    this.lastMessageDate = olderMessages[0].date; // Update last loaded message date
                }
                this.isFetchingOlderMessages = false;
            },
            error: (err) => {
                console.error('Error loading older messages:', err);
                this.isFetchingOlderMessages = false;
            },
        });
    }

    /**
     * Handle sending a message via FirebaseChatService
     */
    async handleSendMessage(message: string): Promise<void> {
        try {
            await this.firebaseChatService.sendMessage(message);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }

    ngOnDestroy(): void {
        // Unsubscribe from messages observable to avoid memory leaks
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
        }
    }
}
