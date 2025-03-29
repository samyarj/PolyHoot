/* eslint-disable max-lines */
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { doc, FieldPath, Firestore, getDoc, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FirebaseChatMessage } from '@app/interfaces/chat-message';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { ChatChannel, chatChannelFromJson } from '@app/services/chat-services/chat-channels';
import { ChatEvents } from '@app/services/chat-services/chat-events';
import { ChatService } from '@app/services/chat-services/chat.service';
import { FirebaseChatService } from '@app/services/chat-services/firebase/firebase-chat.service';
import { FriendSystemService } from '@app/services/friend-system.service';
import { HeaderNavigationService } from '@app/services/ui-services/header-navigation.service';
import { ChatMessage } from '@common/chat-message';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-side-bar',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnDestroy {
    globalChatMessages: FirebaseChatMessage[] = [];
    globalChatMessagesLoading: boolean = true;
    selectedChannelMessages: FirebaseChatMessage[] = [];
    selectedChannelMessagesLoading: boolean = true;
    user$: Observable<User | null>;
    userUID: string | null = null;
    friendRequests: { id: string; username: string; avatarEquipped?: string; borderEquipped?: string }[] = [];
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
    friends: { id: string; username: string; avatarEquipped?: string; borderEquipped?: string; isOnline?: boolean }[] = [];
    searchResults: { id: string; username: string; avatarEquipped?: string; borderEquipped?: string; isOnline?: boolean }[] = [];
    private searchSubscription: Subscription;
    private onlineStatusSubscription: { [key: string]: () => void } = {};

    gameChatMessages: ChatMessage[] = [];
    private gameChatSubscription: Subscription;
    private chatEventsSubscription: Subscription;
    isGameChatInitialized: boolean = false;
    isWorkingWithChannel: boolean = false;
    @ViewChild('tab1Link') tab1Link: any;
    activeTab: number = 1;
    constructor(
        private authService: AuthService,
        private router: Router,
        private firebaseChatService: FirebaseChatService,
        private headerService: HeaderNavigationService,
        private friendSystemService: FriendSystemService,
        private firestore: Firestore,
        private chatService: ChatService,
    ) {
        this.user$ = this.authService.user$;
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

        // Subscribe to game chat messages
        this.gameChatSubscription = this.chatService.allChatMessagesObservable.subscribe({
            next: (messages) => {
                this.gameChatMessages = messages;
            },
            error: (err) => {
                console.error('Error while fetching game chat messages:', err);
            },
        });

        // Subscribe to chat events to handle game chat clearing
        this.chatEventsSubscription = this.chatService.chatEvents$.subscribe((event) => {
            if (event.event === ChatEvents.RoomLeft) {
                this.cleanupGameChat();
            }
        });

        // Initialize game chat if we're on a game page
        if (this.isOnGamePage) {
            this.initializeGameChat();
        }
    }

    get isOnGamePage() {
        return this.headerService.isGameRelatedRoute;
    }

    get isOnResultsPage() {
        return this.headerService.isOnResultsPage;
    }

    setActiveTab(tab: number) {
        this.activeTab = tab;
    }

    handleChildAction() {
        if (this.activeTab === 2) this.tab1Link.nativeElement.click();
    }

    getBoundHandleChildAction() {
        return this.handleChildAction.bind(this); // Bind to the parent's context
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
                            const friendData = friendDoc.data();
                            return {
                                id,
                                username: friendData?.username || 'Unknown User',
                                avatarEquipped: friendData?.avatarEquipped,
                                borderEquipped: friendData?.borderEquipped,
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
                            const friendData = friendDoc.data();
                            return {
                                id,
                                username: friendData?.username || 'Unknown User',
                                avatarEquipped: friendData?.avatarEquipped,
                                borderEquipped: friendData?.borderEquipped,
                                isOnline: friendData?.isOnline || false,
                            };
                        }),
                    );
                    this.friends = friendsData;

                    // Set up online status listeners for each friend
                    this.setupOnlineStatusListeners(friendsData.map((friend) => friend.id));
                } else {
                    this.friends = [];
                }
            }
        });
    }

    private setupOnlineStatusListeners(friendIds: string[]) {
        // Clean up existing listeners
        Object.values(this.onlineStatusSubscription).forEach((unsubscribe) => unsubscribe());
        this.onlineStatusSubscription = {};

        // Set up new listeners for each friend
        friendIds.forEach((friendId) => {
            const userRef = doc(this.firestore, 'users', friendId);
            this.onlineStatusSubscription[friendId] = onSnapshot(userRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    const isOnline = userData.isOnline || false;

                    // Update the friend's online status in the friends array
                    this.friends = this.friends.map((friend) => (friend.id === friendId ? { ...friend, isOnline } : friend));
                }
            });
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
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
        if (this.gameChatSubscription) {
            this.gameChatSubscription.unsubscribe();
        }
        if (this.chatEventsSubscription) {
            this.chatEventsSubscription.unsubscribe();
        }

        // Clean up online status listeners
        Object.values(this.onlineStatusSubscription).forEach((unsubscribe) => unsubscribe());
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
        if (this.newChannelName.trim() && !this.isWorkingWithChannel) {
            try {
                this.isWorkingWithChannel = true;
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
                    this.isWorkingWithChannel = false;
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
                this.isWorkingWithChannel = false;
            } catch (error) {
                console.error('Error creating channel:', error);
                this.isWorkingWithChannel = false;
            }
        }
    }

    async selectChannel(channel: string): Promise<void> {
        if (!this.isWorkingWithChannel) {
            this.isWorkingWithChannel = true;
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
                this.isWorkingWithChannel = false;
            } catch (error) {
                console.error('Failed to join channel:', error);
                this.isWorkingWithChannel = false;
            }
        }
    }

    async deleteChannel(channel: string, event: Event): Promise<void> {
        if (!this.isWorkingWithChannel) {
            this.isWorkingWithChannel = true;
            try {
                event.stopPropagation();
                await this.firebaseChatService.deleteChannel(channel);
                this.channels = this.channels.filter((c) => c.name !== channel);
                this.joinedChannels = this.joinedChannels.filter((c) => c !== channel);

                // If the deleted channel is the currently selected channel, clear the selected channel
                if (this.selectedChannel === channel) {
                    this.selectedChannel = null;
                    this.selectedChannelMessages = [];
                    this.selectedChannelMessagesLoading = false;
                }
                this.isWorkingWithChannel = false;
            } catch (error) {
                console.error('Failed to delete channel:', error);
                this.isWorkingWithChannel = false;
            }
        }
    }

    async quitChannel(channel: string, event: Event): Promise<void> {
        if (!this.isWorkingWithChannel) {
            this.isWorkingWithChannel = true;
            try {
                event.stopPropagation();
                await this.firebaseChatService.quitChannel(channel);
                this.joinedChannels = this.joinedChannels.filter((c) => c !== channel);

                // If the quit channel is the currently selected channel, clear the selected channel
                if (this.selectedChannel === channel) {
                    this.selectedChannel = null;
                    this.selectedChannelMessages = [];
                    this.selectedChannelMessagesLoading = false;
                }
                this.isWorkingWithChannel = false;
            } catch (error) {
                console.error('Failed to quit channel:', error);
                this.isWorkingWithChannel = false;
            }
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
            this.searchError = '';
            this.searchQuery = '';
            this.searchResults = [];
        }
    }

    toggleFriendRequests(): void {
        this.showFriendRequests = !this.showFriendRequests;
    }

    toggleFriendList(): void {
        this.showFriendList = !this.showFriendList;
    }

    async onSearchInputChange(event: any): Promise<void> {
        const searchTerm = event.target.value.trim();
        if (!this.userUID) return;

        // Unsubscribe from previous search if it exists
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }

        try {
            // Subscribe to real-time search results
            this.searchSubscription = this.friendSystemService.searchUsers(searchTerm, this.userUID).subscribe({
                next: (results) => {
                    this.searchResults = results;
                    this.searchError = '';
                },
                error: (error) => {
                    console.error('Error searching users:', error);
                    this.searchError = 'Une erreur est survenue lors de la recherche';
                },
            });
        } catch (error) {
            console.error('Error setting up search:', error);
            this.searchError = 'Une erreur est survenue lors de la recherche';
        }
    }

    async sendFriendRequest(userId?: string, username?: string): Promise<void> {
        const currentUser = this.authService.getUser();
        if (!currentUser) {
            this.searchError = "Vous devez être connecté pour envoyer une demande d'ami";
            return;
        }

        try {
            if (username) {
                // When clicking the add button in search results
                await this.friendSystemService.sendFriendRequest(currentUser.uid, username);
                // Remove the user from search results after sending request
                this.searchResults = this.searchResults.filter((user) => user.id !== userId);
            } else {
                // When manually entering a username
                if (!this.searchQuery.trim()) {
                    this.searchError = "Veuillez entrer un nom d'utilisateur";
                    return;
                }

                if (this.searchQuery.trim().toLowerCase() === currentUser.username.toLowerCase()) {
                    this.searchError = "Vous ne pouvez pas vous envoyer une demande d'ami à vous-même";
                    return;
                }

                await this.friendSystemService.sendFriendRequest(currentUser.uid, this.searchQuery.trim());
                this.searchQuery = '';
            }
            this.searchError = '';
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

    private initializeGameChat(): void {
        if (!this.isGameChatInitialized) {
            if (!this.chatService.isInitialized) {
                this.chatService.configureChatSocketFeatures();
                this.chatService.getHistory();
            } else {
                this.chatService.retrieveRoomIdChat();
            }
            this.isGameChatInitialized = true;
        }
    }

    private cleanupGameChat(): void {
        if (this.isGameChatInitialized) {
            this.gameChatMessages = [];
            this.isGameChatInitialized = false;
        }
    }

    async handleSendMessageToGame(message: string): Promise<void> {
        if (this.isOnGamePage) {
            this.chatService.sendMessageToRoom(message);
        }
    }
}
