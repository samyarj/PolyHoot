import { Component, OnDestroy, OnInit } from '@angular/core';
import { doc, FieldPath, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FirebaseChatMessage } from '@app/interfaces/chat-message';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { ChatChannel, chatChannelFromJson } from '@app/services/chat-services/chat-channels';
import { FirebaseChatService } from '@app/services/chat-services/firebase/firebase-chat.service';
import { HeaderNavigationService } from '@app/services/ui-services/header-navigation.service';
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
    private selectedChannelMessagesSubscription: Unsubscribe;
    private channelsSubscription: Subscription;
    private userSubscription: Subscription;
    private lastMessageDate: FieldPath; // Track last message date for pagination
    isFetchingOlderMessages: boolean = false; // Prevent multiple fetches at once
    channels: ChatChannel[] = [];
    joinedChannels: string[] = [];
    newChannelName: string = '';
    selectedChannel: string | null = null;
    searchTerm: string = '';
    errorMessage: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private firebaseChatService: FirebaseChatService,
        private headerService: HeaderNavigationService,
    ) {
        this.user$ = this.authService.user$;
    }

    get isOnGamePage() {
        return this.headerService.isGameRelatedRoute;
    }

    ngOnInit(): void {
        // Subscribe to live chat messages for the global chat
        this.subscribeToGlobalMessages();

        // Subscribe to chat channels
        this.channelsSubscription = this.firebaseChatService.fetchAllChannels().subscribe({
            next: (channels) => {
                const currentUserId = this.authService.getUser()?.uid || '';
                this.channels = channels.map((channel) => chatChannelFromJson(channel, currentUserId));
            },
            error: (err) => {
                console.error('Error while fetching channels:', err);
            },
        });

        // Subscribe to user data to get joined channels
        this.userSubscription = this.authService.user$.subscribe((user) => {
            if (user) {
                this.joinedChannels = user.joinedChannels || [];
            }
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from messages observable to avoid memory leaks
        if (this.globalMessagesSubscription) {
            this.globalMessagesSubscription.unsubscribe();
        }
        if (this.selectedChannelMessagesSubscription) {
            this.selectedChannelMessagesSubscription();
        }
        // Unsubscribe from channels observable to avoid memory leaks
        if (this.channelsSubscription) {
            this.channelsSubscription.unsubscribe();
        }
        // Unsubscribe from user observable to avoid memory leaks
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
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
                const user = this.authService.getUser();
                if (!user) {
                    throw new Error('User is not authenticated');
                }

                const existingChannel = this.channels.find((channel) => channel.name.toLowerCase() === this.newChannelName.trim().toLowerCase());
                if (existingChannel) {
                    this.errorMessage = 'Le nom du canal existe déjà. Veuillez choisir un autre nom.';
                    setTimeout(() => {
                        this.errorMessage = '';
                    }, 4000);
                    return;
                }

                await this.firebaseChatService.createChannel(this.newChannelName.trim());
                await this.firebaseChatService.joinChannel(this.newChannelName.trim());
                this.selectedChannel = this.newChannelName.trim();
                this.selectedChannelMessages = []; // Clear the messages array
                this.selectedChannelMessagesLoading = true; // Set loading state
                this.newChannelName = '';
                this.errorMessage = '';

                const tab3 = document.querySelector('[href="#tab3"]') as HTMLElement;
                if (tab3) {
                    tab3.click();
                }
                this.subscribeToSelectedChannelMessages(this.selectedChannel);
            } catch (error) {
                console.error('Error creating channel:', error);
            }
        }
    }
    async selectChannel(channel: string): Promise<void> {
        try {
            await this.firebaseChatService.joinChannel(channel);
            this.selectedChannel = channel;
            this.selectedChannelMessages = []; // Clear the messages array
            this.selectedChannelMessagesLoading = true; // Set loading state
            // Switch to the third tab
            const tab3 = document.querySelector('[href="#tab3"]') as HTMLElement;
            if (tab3) {
                tab3.click();
            }
            this.subscribeToSelectedChannelMessages(channel);
        } catch (error) {
            console.error('Failed to join channel:', error);
        }
    }

    async deleteChannel(channel: string): Promise<void> {
        try {
            await this.firebaseChatService.deleteChannel(channel);
            this.channels = this.channels.filter((c) => c.name !== channel);
            this.joinedChannels = this.joinedChannels.filter((c) => c !== channel);

            // If the deleted channel is the currently selected channel, clear the selected channel
            if (this.selectedChannel === channel) {
                this.selectedChannel = null;
                this.selectedChannelMessages = [];
                this.selectedChannelMessagesLoading = false;
            }
        } catch (error) {
            console.error('Failed to delete channel:', error);
        }
    }

    async quitChannel(channel: string): Promise<void> {
        try {
            await this.firebaseChatService.quitChannel(channel);
            this.joinedChannels = this.joinedChannels.filter((c) => c !== channel);

            // If the quit channel is the currently selected channel, clear the selected channel
            if (this.selectedChannel === channel) {
                this.selectedChannel = null;
                this.selectedChannelMessages = [];
                this.selectedChannelMessagesLoading = false;
            }
        } catch (error) {
            console.error('Failed to quit channel:', error);
        }
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
            this.selectedChannelMessagesSubscription();
        }

        this.selectedChannelMessagesLoading = true;
        const channelDocRef = doc(this.firebaseChatService.getChatChannelsCollection(), channel);

        this.selectedChannelMessagesSubscription = onSnapshot(channelDocRef, (docSnapshot) => {
            if (!docSnapshot.exists()) {
                // Channel has been deleted
                this.selectedChannel = null;
                this.selectedChannelMessages = [];
                this.selectedChannelMessagesLoading = false;
                // Redirect to another tab or handle the UI update as needed
                const tab1 = document.querySelector('[href="#tab1"]') as HTMLElement;
                if (tab1) {
                    tab1.click();
                }
            } else {
                // Fetch messages if the channel still exists
                this.firebaseChatService.getMessages(channel).subscribe({
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
        });
    }

    filteredJoinedChannels(): string[] {
        return this.joinedChannels.filter((channel) => channel.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    filteredChannels(): ChatChannel[] {
        return this.channels.filter((channel) => channel.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
}
