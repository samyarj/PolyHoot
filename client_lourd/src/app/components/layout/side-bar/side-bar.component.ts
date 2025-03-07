import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldPath } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FirebaseChatMessage } from '@app/interfaces/chat-message';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { ChatChannel } from '@app/services/chat-services/chat-channels';
import { FirebaseChatService } from '@app/services/chat-services/firebase/firebase-chat.service';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-side-bar',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit, OnDestroy {
    globalChatMessages: FirebaseChatMessage[] = [];
    globalChatMessagesLoading: boolean = true;
    selectedChannelMessages: FirebaseChatMessage[] = [];
    selectedChannelMessagesLoading: boolean = true;
    user$: Observable<User | null>;
    userUID: string | null = null;
    private globalMessagesSubscription: Subscription;
    private selectedChannelMessagesSubscription: Subscription;
    private channelsSubscription: Subscription;
    private lastMessageDate: FieldPath; // Track last message date for pagination
    isFetchingOlderMessages: boolean = false; // Prevent multiple fetches at once
    channels: ChatChannel[] = [];
    newChannelName: string = '';
    selectedChannel: string | null = null;

    // private messagesSubscription: Subscription;
    // private lastMessageDate: FieldPath; // Track last message date for pagination

    constructor(
        private authService: AuthService,
        private router: Router,
        private firebaseChatService: FirebaseChatService,
    ) {
        this.user$ = this.authService.user$;
    }

    ngOnInit(): void {
        // Subscribe to live chat messages for the global chat
        this.subscribeToGlobalMessages();

        // Subscribe to chat channels
        this.channelsSubscription = this.firebaseChatService.fetchAllChannels().subscribe({
            next: (channels) => {
                this.channels = channels;
            },
            error: (err) => {
                console.error('Error while fetching channels:', err);
            },
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from messages observable to avoid memory leaks
        if (this.globalMessagesSubscription) {
            this.globalMessagesSubscription.unsubscribe();
        }
        if (this.selectedChannelMessagesSubscription) {
            this.selectedChannelMessagesSubscription.unsubscribe();
        }
        // Unsubscribe from channels observable to avoid memory leaks
        if (this.channelsSubscription) {
            this.channelsSubscription.unsubscribe();
        }
    }

    logout(): void {
        this.authService.logout(); // Call the logout method from AuthService
        this.router.navigateByUrl('/login');
    }

    /**
     * Load older messages when scrolling to the top.
     */
    loadOlderMessages(): void {
        if (this.isFetchingOlderMessages || !this.lastMessageDate || !this.selectedChannel) return;

        this.isFetchingOlderMessages = true;
        this.firebaseChatService.loadOlderMessages(this.selectedChannel, this.lastMessageDate).subscribe({
            next: (olderMessages) => {
                if (olderMessages.length > 0) {
                    // Merge older messages while maintaining order
                    this.selectedChannelMessages = [...olderMessages, ...this.selectedChannelMessages];
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
            await this.firebaseChatService.sendMessage('General', message);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }
    async createChannel(): Promise<void> {
        if (this.newChannelName.trim()) {
            try {
                await this.firebaseChatService.createChannel(this.newChannelName.trim());
                this.newChannelName = '';
            } catch (error) {
                console.error('Error creating channel:', error);
            }
        }
    }
    selectChannel(channel: string): void {
        this.selectedChannel = channel;
        // Switch to the second tab
        const tab2 = document.querySelector('[href="#tab3"]') as HTMLElement;
        if (tab2) {
            tab2.click();
        }
        this.subscribeToSelectedChannelMessages(channel);
    }
    async handleSendMessageToChannel(message: string): Promise<void> {
        if (this.selectedChannel) {
            try {
                await this.firebaseChatService.sendMessage(this.selectedChannel, message);
            } catch (error) {
                console.error('Failed to send message to channel:', error);
            }
        }
    }

    private subscribeToGlobalMessages(): void {
        // Unsubscribe from previous global messages observable to avoid memory leaks
        if (this.globalMessagesSubscription) {
            this.globalMessagesSubscription.unsubscribe();
        }

        this.globalChatMessagesLoading = true;
        this.globalMessagesSubscription = this.firebaseChatService.getMessages('General').subscribe({
            next: (messages) => {
                this.globalChatMessages = messages;
                this.globalChatMessagesLoading = false;
            },
            error: (err) => {
                console.error('Error while fetching global messages:', err);
                this.globalChatMessagesLoading = false;
            },
        });
    }

    private subscribeToSelectedChannelMessages(channel: string): void {
        // Unsubscribe from previous selected channel messages observable to avoid memory leaks
        if (this.selectedChannelMessagesSubscription) {
            this.selectedChannelMessagesSubscription.unsubscribe();
        }

        this.selectedChannelMessagesLoading = true;
        this.selectedChannelMessagesSubscription = this.firebaseChatService.getMessages(channel).subscribe({
            next: (messages) => {
                this.selectedChannelMessages = messages;
                if (messages.length > 0) {
                    this.lastMessageDate = messages[0].date; // Track oldest message date
                }
                this.selectedChannelMessagesLoading = false;
            },
            error: (err) => {
                console.error('Error while fetching selected channel messages:', err);
                this.selectedChannelMessagesLoading = false;
            },
        });
    }
}
