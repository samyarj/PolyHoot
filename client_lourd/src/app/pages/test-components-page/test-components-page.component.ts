import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { FirebaseChatService } from '@app/services/chat-services/firebase/firebase-chat.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-test-components-page',
    templateUrl: './test-components-page.component.html',
    styleUrls: ['./test-components-page.component.scss'],
})
export class TestComponentsPageComponent implements OnInit, OnDestroy {
    chatMessages: ChatMessage[] = [];
    chatMessagesLoading: boolean = true;
    name = 'General Chat';
    private messagesSubscription: Subscription;

    constructor(private firebaseChatService: FirebaseChatService) {}

    ngOnInit(): void {
        // Get the user's name from AuthService

        // Subscribe to the chat messages from FirebaseChatService
        this.messagesSubscription = this.firebaseChatService.getMessages().subscribe({
            next: (messages) => {
                this.chatMessages = messages;
                this.chatMessagesLoading = false;
            },
            error: (err) => {
                console.error('Error while fetching messages:', err);
                this.chatMessagesLoading = false;
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
