/* eslint-disable max-lines */
import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { doc, FieldPath, Firestore, getDoc, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FirebaseChatMessage } from '@app/interfaces/chat-message';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { ChatChannel } from '@app/services/chat-services/chat-channels';
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
    @ViewChild('tab1Link') tab1Link: any;

    globalChatMessages: FirebaseChatMessage[] = [];
    globalChatMessagesLoading: boolean = true;
    selectedChannelMessages: FirebaseChatMessage[] = [];
    selectedChannelMessagesLoading: boolean = true;
    user$: Observable<User | null>;
    userUID: string | null = null;
    friendRequests: { id: string; username: string; avatarEquipped?: string; borderEquipped?: string }[] = [];
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
    gameChatMessages: ChatMessage[] = [];
    isGameChatInitialized: boolean = false;
    isWorkingWithChannel: boolean = false;
    activeTab: number = 1;
    deletionMessage: string = '';
    isClickingFriendButton: boolean = false;
    private messagesSubscription: Subscription | null = null;
    private channelsSubscription: Subscription;
    private userSubscription: Subscription;
    private friendRequestsSubscription: Subscription;
    private userDocSubscription: Unsubscribe;
    private lastMessageDate: FieldPath | undefined;
    private channelDeletedSubscription: Subscription;
    private searchSubscription: Subscription | null = null;
    private onlineStatusSubscription: { [key: string]: () => void } = {};
    private gameChatSubscription: Subscription;
    private chatEventsSubscription: Subscription;

    constructor(
        private authService: AuthService,
        private router: Router,
        private firebaseChatService: FirebaseChatService,
        private headerService: HeaderNavigationService,
        private friendSystemService: FriendSystemService,
        private firestore: Firestore,
        private chatService: ChatService,
        private cdr: ChangeDetectorRef,
    ) {
        this.user$ = this.authService.user$;
        // Subscribe to live chat messages for the global chat
        this.subscribeToGlobalMessages();

        // Subscribe to channel deletion events
        this.channelDeletedSubscription = this.firebaseChatService.channelDeleted$.subscribe((deletedChannel) => {
            console.log('Channel deleted:', deletedChannel);
            if (this.selectedChannel === deletedChannel) {
                if (this.activeTab === 3) {
                    this.deletionMessage = 'Le canal a été supprimé. Veuillez en sélectionner un autre ou en créer un nouveau.';
                    setTimeout(() => {
                        this.deletionMessage = '';
                    }, 5000);
                }
                this.selectedChannel = null;
                this.selectedChannelMessages = [];
                this.selectedChannelMessagesLoading = false;
                this.lastMessageDate = undefined;
                if (this.messagesSubscription) {
                    this.messagesSubscription.unsubscribe();
                    this.messagesSubscription = null;
                }
            }
            // Update channels list
            this.channels = this.channels.filter((c) => c.name !== deletedChannel);
        });

        // Subscribe to user data and channels
        this.userSubscription = this.authService.user$.subscribe((user) => {
            if (user) {
                // Clear deletion message on user change/login
                this.deletionMessage = '';

                this.userUID = user.uid;
                this.setupRealtimeUserUpdates(user.uid);

                // Subscribe to chat channels only after we have the user ID
                if (this.channelsSubscription) {
                    this.channelsSubscription.unsubscribe();
                }
                this.channelsSubscription = this.firebaseChatService.fetchAllChannels().subscribe({
                    next: (channels) => {
                        this.channels = channels;

                        // If a selectedChannel exists, verify it's still valid
                        if (this.selectedChannel) {
                            const channelExists = channels.some((c) => c.name === this.selectedChannel && c.isUserInChannel);
                            if (!channelExists) {
                                this.selectedChannel = null;
                                this.selectedChannelMessages = [];
                                this.selectedChannelMessagesLoading = false;
                            }
                        }
                    },
                    error: (err) => {
                        console.error('Error while fetching channels:', err);
                        // Don't show error messages for permission errors during authentication
                        if (!(err.code === 'permission-denied' && err.name === 'FirebaseError')) {
                            console.error('Error details:', err);
                        }
                    },
                });
            } else {
                // User logged out, clear relevant data
                this.selectedChannel = null;
                this.selectedChannelMessages = [];
                this.channels = [];
                this.deletionMessage = '';
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

    setActiveTab(tab: number): void {
        this.activeTab = tab;

        // Clear deletion message when switching tabs
        if (tab !== 3) {
            this.deletionMessage = '';
        }

        if (tab === 1) {
            // Assuming tab 1 is the global chat
            this.subscribeToGlobalMessages();
        } else if (tab === 3 && this.selectedChannel) {
            // Assuming tab 3 is the channel chat
            this.subscribeToSelectedChannelMessages(this.selectedChannel);
        }
    }

    handleChildAction() {
        if (this.activeTab === 2) {
            if (this.tab1Link) {
                setTimeout(() => {
                    this.cdr.detectChanges();
                    this.tab1Link.nativeElement.click();
                    this.cdr.detectChanges();
                });
            }
        }
    }

    getBoundHandleChildAction() {
        return this.handleChildAction.bind(this); // Bind to the parent's context
    }
    ngOnDestroy(): void {
        // Unsubscribe from messages observable to avoid memory leaks
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
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
        if (this.channelDeletedSubscription) {
            this.channelDeletedSubscription.unsubscribe();
        }

        // Clear all messages and UI state
        this.deletionMessage = '';
        this.selectedChannel = null;
        this.selectedChannelMessages = [];
        this.globalChatMessages = [];

        // Clean up online status listeners
        Object.values(this.onlineStatusSubscription).forEach((unsubscribe) => unsubscribe());
    }

    logout(): void {
        // Clear messages and state before logout
        this.deletionMessage = '';
        this.selectedChannel = null;
        this.selectedChannelMessages = [];

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
                    // Ensure olderMessages are sorted ascending before prepending
                    const sortedOlderMessages = [...olderMessages].sort((a, b) => {
                        const dateA = (a.date as any)?.toMillis?.() || 0;
                        const dateB = (b.date as any)?.toMillis?.() || 0;
                        return dateA - dateB; // Oldest first
                    });
                    this.selectedChannelMessages = [...sortedOlderMessages, ...this.selectedChannelMessages];
                    // Update lastMessageDate to the oldest message date from the newly loaded batch
                    if (sortedOlderMessages.length > 0) {
                        this.lastMessageDate = sortedOlderMessages[0].date;
                    }
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

                // Add the new channel to the channels array with isUserInChannel set to true
                const newChannel: ChatChannel = {
                    name: this.newChannelName.trim(),
                    isUserInChannel: true,
                };

                // Update the channels array to ensure the new channel is marked as one the user is a member of
                this.channels = this.channels.map((channel) => {
                    if (channel.name === this.newChannelName.trim()) {
                        return { ...channel, isUserInChannel: true };
                    }
                    return channel;
                });

                // If the channel doesn't exist in the array yet, add it
                if (!this.channels.some((channel) => channel.name === this.newChannelName.trim())) {
                    this.channels = [...this.channels, newChannel];
                }

                // Force a refresh of the channels to ensure the UI is updated
                this.channels = [...this.channels];

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
            this.deletionMessage = ''; // Clear the deletion message
            try {
                const tab3 = document.querySelector('[href="#tab3"]') as HTMLElement;
                if (this.selectedChannel === channel) {
                    // If the channel is already selected, switch to tab 3
                    if (tab3) {
                        tab3.click();
                    }
                    this.isWorkingWithChannel = false;
                    return;
                }

                // Call joinChannel to ensure the user is added to the channel
                await this.firebaseChatService.joinChannel(channel);

                this.selectedChannel = channel;
                this.selectedChannelMessages = []; // Clear the messages array
                this.selectedChannelMessagesLoading = true; // Set loading state

                // Switch to the third tab
                if (tab3) {
                    tab3.click();
                }
                this.subscribeToSelectedChannelMessages(channel);
            } catch (error) {
                console.error('Failed to join channel:', error);
            } finally {
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

                // If the deleted channel is the currently selected channel, clear the selected channel
                if (this.selectedChannel === channel) {
                    console.log('Current activeTab:', this.activeTab); // Debug log
                    this.selectedChannel = null;
                    this.selectedChannelMessages = [];
                    this.selectedChannelMessagesLoading = false;
                    this.lastMessageDate = undefined; // Reset pagination marker
                    if (this.messagesSubscription) {
                        // Unsubscribe if deleting the active channel
                        this.messagesSubscription.unsubscribe();
                        this.messagesSubscription = null;
                    }
                    // Redirect to global chat tab (tab1) only if currently on tab3
                    if (this.activeTab === 3) {
                        console.log('Redirecting to tab1...'); // Debug log
                        this.setActiveTab(1);
                        if (this.tab1Link) {
                            this.tab1Link.nativeElement.click();
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to delete channel:', error);
            } finally {
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

                // Update the channel's isUserInChannel property locally for immediate UI update
                this.channels = this.channels.map((c) => {
                    if (c.name === channel) {
                        return { ...c, isUserInChannel: false };
                    }
                    return c;
                });

                // If the quit channel is the currently selected channel, clear the selected channel
                if (this.selectedChannel === channel) {
                    this.selectedChannel = null;
                    this.selectedChannelMessages = [];
                    this.selectedChannelMessagesLoading = false;
                    this.lastMessageDate = undefined; // Reset pagination
                    if (this.messagesSubscription) {
                        // Unsubscribe if quitting active channel
                        this.messagesSubscription.unsubscribe();
                        this.messagesSubscription = null;
                    }
                }
            } catch (error) {
                console.error('Failed to quit channel:', error);
            } finally {
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
        return this.channels
            .filter((channel) => channel.isUserInChannel)
            .map((channel) => channel.name)
            .filter((channelName) => channelName.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    filteredChannels(): ChatChannel[] {
        return this.channels
            .filter((channel) => !channel.isUserInChannel)
            .filter((channel) => channel.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    toggleSearchInput(): void {
        this.showSearchInput = !this.showSearchInput;
        if (!this.showSearchInput) {
            this.searchError = '';
            this.searchQuery = '';
            this.searchResults = [];
            // Unsubscribe from the search subscription if it exists
            if (this.searchSubscription) {
                this.searchSubscription.unsubscribe();
                this.searchSubscription = null;
            }
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
            // Subscribe to real-time search results - now fully filtered in the service
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
        if (!this.isClickingFriendButton) {
            this.isClickingFriendButton = true;
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
                        this.isClickingFriendButton = false;
                        return;
                    }

                    await this.friendSystemService.sendFriendRequest(currentUser.uid, this.searchQuery.trim());
                    this.searchQuery = '';
                }
                this.isClickingFriendButton = false;
                this.searchError = '';
            } catch (error: any) {
                console.error("Erreur lors de l'envoi de la demande d'ami:", error);
                this.isClickingFriendButton = false;
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
    }

    async removeFriend(userId: string, friendId: string): Promise<void> {
        if (!this.isClickingFriendButton) {
            this.isClickingFriendButton = true;
            if (!userId) return;

            try {
                await this.friendSystemService.removeFriend(userId, friendId);
                this.isClickingFriendButton = false;
            } catch (error) {
                console.error("Erreur lors de la suppression de l'ami:", error);
                this.isClickingFriendButton = false;
            }
        }
    }

    async acceptFriendRequest(friendId: string): Promise<void> {
        if (!this.isClickingFriendButton) {
            this.isClickingFriendButton = true;
            console.log('accepting friend request');
            if (!this.userUID) return;

            try {
                await this.friendSystemService.acceptFriendRequest(this.userUID, friendId);
                this.isClickingFriendButton = false;
            } catch (error) {
                console.error("Erreur lors de l'acceptation de la demande d'ami:", error);
                this.isClickingFriendButton = false;
            }
        }
    }

    async declineFriendRequest(friendId: string): Promise<void> {
        if (!this.isClickingFriendButton) {
            this.isClickingFriendButton = true;
            if (!this.userUID) return;

            try {
                await this.friendSystemService.cancelFriendRequest(friendId, this.userUID);
                this.isClickingFriendButton = false;
            } catch (error) {
                console.error("Erreur lors du refus de la demande d'ami:", error);
                this.isClickingFriendButton = false;
            }
        }
    }

    async handleSendMessageToGame(message: string): Promise<void> {
        if (this.isOnGamePage) {
            this.chatService.sendMessageToRoom(message);
        }
    }

    private subscribeToGlobalMessages(): void {
        // Unsubscribe from previous global messages observable to avoid memory leaks
        if (this.messagesSubscription) {
            // Check the messages subscription used for both global and channel
            this.messagesSubscription.unsubscribe();
        }

        this.globalChatMessagesLoading = true;
        this.messagesSubscription = this.firebaseChatService.getMessages('General').subscribe({
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
        // Unsubscribe from previous channel's messages
        if (this.messagesSubscription) {
            this.messagesSubscription.unsubscribe();
            this.messagesSubscription = null; // Clear the reference
        }

        this.selectedChannelMessagesLoading = true;
        this.selectedChannelMessages = []; // Clear messages for the new channel
        this.lastMessageDate = undefined; // Reset pagination

        // Subscribe to the message stream from the service
        this.messagesSubscription = this.firebaseChatService.getMessages(channel).subscribe({
            next: (messages) => {
                this.selectedChannelMessages = messages; // Receives the full, sorted list
                this.selectedChannelMessagesLoading = false;

                // Set lastMessageDate for pagination 'loadOlderMessages'
                if (messages.length > 0) {
                    // Sort ascending (oldest first) to get the correct date for 'startAfter'
                    const sortedMessages = [...messages].sort((a, b) => {
                        const dateA = (a.date as any)?.toMillis?.() || 0;
                        const dateB = (b.date as any)?.toMillis?.() || 0;
                        return dateA - dateB;
                    });
                    if (sortedMessages.length > 0) {
                        this.lastMessageDate = sortedMessages[0].date;
                    }
                } else {
                    this.lastMessageDate = undefined; // Reset if channel is empty
                }
            },
            error: (err) => {
                console.error(`Error while fetching messages for channel ${channel}:`, err);
                this.selectedChannelMessagesLoading = false;
            },
        });
    }

    private setupRealtimeUserUpdates(uid: string) {
        // Clean up previous subscription if it exists
        if (this.userDocSubscription) {
            this.userDocSubscription();
        }

        // Clean up existing friend listeners
        Object.values(this.onlineStatusSubscription).forEach((unsubscribe) => unsubscribe());
        this.onlineStatusSubscription = {};

        const userRef = doc(this.firestore, 'users', uid);
        this.userDocSubscription = onSnapshot(userRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const prevFriendIds = this.friends.map((f) => f.id);
                const prevRequestIds = this.friendRequests.map((r) => r.id);

                // Update friend requests in real-time
                if (userData.friendRequests) {
                    // Set up real-time listeners for each friend request
                    userData.friendRequests.forEach((id: string) => {
                        const friendRef = doc(this.firestore, 'users', id);
                        onSnapshot(friendRef, (friendDoc) => {
                            if (friendDoc.exists()) {
                                const friendData = friendDoc.data();
                                // Update the friend request in the list
                                this.friendRequests = this.friendRequests.map((request) => {
                                    if (request.id === id) {
                                        return {
                                            ...request,
                                            username: friendData.username || 'Unknown User',
                                            avatarEquipped: friendData.avatarEquipped,
                                            borderEquipped: friendData.borderEquipped,
                                        };
                                    }
                                    return request;
                                });
                            }
                        });
                    });

                    // Initial fetch of friend requests data
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
                if (userData.friends && Array.isArray(userData.friends)) {
                    // Make sure friends array is unique to prevent duplicates
                    const uniqueFriendIds: string[] = [...new Set(userData.friends as string[])];

                    // Set up real-time listeners for each friend's profile data
                    this.setupFriendProfileListeners(uniqueFriendIds);

                    // Initial fetch of friends data
                    const friendsData = await Promise.all(
                        uniqueFriendIds.map(async (id: string) => {
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

                    // Set the friends list with the unique data
                    this.friends = friendsData;
                } else {
                    this.friends = [];
                }

                // Check if friend list or friend requests changed and update search results if needed
                const newFriendIds = this.friends.map((f) => f.id);
                const newRequestIds = this.friendRequests.map((r) => r.id);
                const friendsChanged =
                    newFriendIds.length !== prevFriendIds.length ||
                    newFriendIds.some((id) => !prevFriendIds.includes(id)) ||
                    prevFriendIds.some((id) => !newFriendIds.includes(id));
                const requestsChanged =
                    newRequestIds.length !== prevRequestIds.length ||
                    newRequestIds.some((id) => !prevRequestIds.includes(id)) ||
                    prevRequestIds.some((id) => !newRequestIds.includes(id));

                if (friendsChanged || requestsChanged) {
                    this.updateSearchResults();
                }
            }
        });
    }

    private setupFriendProfileListeners(friendIds: string[]): void {
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
                    const username = userData.username || 'Unknown User';
                    const avatarEquipped = userData.avatarEquipped || '';
                    const borderEquipped = userData.borderEquipped || '';

                    // Update the friend's data in the friends array
                    this.friends = this.friends.map((friend) =>
                        friend.id === friendId
                            ? {
                                  ...friend,
                                  isOnline,
                                  username,
                                  avatarEquipped,
                                  borderEquipped,
                              }
                            : friend,
                    );
                }
            });
        });
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

    // Add this as a new method to update search results when friendship status changes
    private updateSearchResults(): void {
        if (this.showSearchInput && this.searchQuery && this.searchSubscription) {
            // Re-trigger the search to update results
            this.onSearchInputChange({ target: { value: this.searchQuery } });
        }
    }
}
