import { Component, OnDestroy, OnInit } from '@angular/core';
import { doc, FieldPath, Firestore, getDoc, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FirebaseChatMessage } from '@app/interfaces/chat-message';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { ChatChannel, chatChannelFromJson } from '@app/services/chat-services/chat-channels';
import { FirebaseChatService } from '@app/services/chat-services/firebase/firebase-chat.service';
import { FriendSystemService } from '@app/services/friend-system.service';
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
    friendRequests: { id: string; username: string }[] = [];
    private globalMessagesSubscription: Subscription;
    private selectedChannelMessagesSubscription: Unsubscribe;
    private channelsSubscription: Subscription;
    private userSubscription: Subscription;
    private friendRequestsSubscription: Subscription;
    private userDocSubscription: Unsubscribe;
    private lastMessageDate: FieldPath;
    isFetchingOlderMessages: boolean = false;
    channels: ChatChannel[] = [];
    joinedChannels: string[] = [];
    newChannelName: string = '';
    selectedChannel: string | null = null;
    searchTerm: string = '';
    errorMessage: string = '';

    showSearchInput: boolean = false;
    searchQuery: string = '';
    showFriendRequests: boolean = false;
    showFriendList: boolean = false;
    searchError: string = '';
    friends: { id: string; username: string }[] = [];

    constructor(
        private authService: AuthService,
        private router: Router,
        private firebaseChatService: FirebaseChatService,
        private headerService: HeaderNavigationService,
        private friendSystemService: FriendSystemService,
        private firestore: Firestore,
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

        // Subscribe to user data to get joined channels and set up real-time updates
        this.userSubscription = this.authService.user$.subscribe((user) => {
            if (user) {
                this.userUID = user.uid;
                this.joinedChannels = user.joinedChannels || [];
                this.setupRealtimeUserUpdates(user.uid);
            }
        });
    }

    private setupRealtimeUserUpdates(uid: string) {
        // Clean up previous subscription if it exists
        if (this.userDocSubscription) {
            this.userDocSubscription();
        }

        const userRef = doc(this.firestore, 'users', uid);
        this.userDocSubscription = onSnapshot(userRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();

                // Update friend requests in real-time
                if (userData.friendRequests) {
                    const friendRequestsData = await Promise.all(
                        userData.friendRequests.map(async (id: string) => {
                            const friendDoc = await getDoc(doc(this.firestore, 'users', id));
                            return {
                                id,
                                username: friendDoc.data()?.username || 'Unknown User',
                            };
                        }),
                    );
                    this.friendRequests = friendRequestsData;
                } else {
                    this.friendRequests = [];
                }

                // Update friends list in real-time
                if (userData.friends) {
                    const friendsData = await Promise.all(
                        userData.friends.map(async (id: string) => {
                            const friendDoc = await getDoc(doc(this.firestore, 'users', id));
                            return {
                                id,
                                username: friendDoc.data()?.username || 'Unknown User',
                            };
                        }),
                    );
                    this.friends = friendsData;
                } else {
                    this.friends = [];
                }
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
        if (this.channelsSubscription) {
            this.channelsSubscription.unsubscribe();
        }
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        if (this.friendRequestsSubscription) {
            this.friendRequestsSubscription.unsubscribe();
        }
        if (this.userDocSubscription) {
            this.userDocSubscription();
        }
    }

    logout(): void {
        this.authService.logout();
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

    filteredJoinedChannels(): string[] {
        return this.joinedChannels.filter((channel) => channel.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    filteredChannels(): ChatChannel[] {
        return this.channels.filter((channel) => channel.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    toggleSearchInput(): void {
        this.showSearchInput = !this.showSearchInput;
        if (!this.showSearchInput) {
            this.searchError = ''; // Clear error when closing
            this.searchQuery = ''; // Clear search query when closing
        }
    }

    toggleFriendRequests(): void {
        this.showFriendRequests = !this.showFriendRequests;
    }

    toggleFriendList(): void {
        this.showFriendList = !this.showFriendList;
    }

    async sendFriendRequest(): Promise<void> {
        const currentUser = this.authService.getUser();
        if (!currentUser) {
            this.searchError = "Vous devez être connecté pour envoyer une demande d'ami";
            return;
        }

        if (!this.searchQuery.trim()) {
            this.searchError = "Veuillez entrer un nom d'utilisateur";
            return;
        }

        // Check if user is trying to send request to themselves
        if (this.searchQuery.trim().toLowerCase() === currentUser.username.toLowerCase()) {
            this.searchError = "Vous ne pouvez pas vous envoyer une demande d'ami à vous-même";
            return;
        }

        try {
            await this.friendSystemService.sendFriendRequest(currentUser.uid, this.searchQuery.trim());
            this.searchQuery = '';
            this.searchError = '';
            this.toggleSearchInput(); // Close the search overlay after successful send
        } catch (error: any) {
            console.error("Erreur lors de l'envoi de la demande d'ami:", error);
            if (error?.status === 401) {
                this.searchError = 'Votre session a expiré. Veuillez vous reconnecter.';
                this.authService.logout();
                this.router.navigateByUrl('/login');
            } else if (error?.error?.message) {
                this.searchError = error.error.message;
            } else {
                this.searchError = "Erreur lors de l'envoi de la demande d'ami. Veuillez réessayer.";
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

    async removeFriend(userId: string, friendId: string): Promise<void> {
        if (!userId) return;

        try {
            await this.friendSystemService.removeFriend(userId, friendId);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'ami:", error);
        }
    }

    async acceptFriendRequest(friendId: string): Promise<void> {
        if (!this.userUID) return;

        try {
            await this.friendSystemService.acceptFriendRequest(this.userUID, friendId);
        } catch (error) {
            console.error("Erreur lors de l'acceptation de la demande d'ami:", error);
        }
    }

    async declineFriendRequest(friendId: string): Promise<void> {
        if (!this.userUID) return;

        try {
            await this.friendSystemService.cancelFriendRequest(friendId, this.userUID);
        } catch (error) {
            console.error("Erreur lors du refu de la demande d'ami:", error);
        }
    }
}
