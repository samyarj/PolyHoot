import { Injectable } from '@angular/core';
import { Firestore, addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, setDoc, startAfter, updateDoc } from '@angular/fire/firestore';
import { MESSAGES_LIMIT } from '@app/constants/constants';
import { FirebaseChatMessage } from '@app/interfaces/chat-message';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { ChatChannel, chatChannelFromJson } from '@app/services/chat-services/chat-channels';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FirebaseChatService {
    private globalChatCollection = collection(this.firestore, 'globalChat');
    private chatChannelsCollection = collection(this.firestore, 'chatChannels'); // Firestore chat channels collection
    private usersCollection = collection(this.firestore, 'users'); // Firestore users collection

    constructor(
        private firestore: Firestore,
        private authService: AuthService,
    ) {}

    /**
     * Send a message to the global chat.
     */
    async sendMessage(channel: string, message: string): Promise<void> {
        const user = this.authService.getUser(); // Get logged-in user from AuthService
        if (!user) {
            throw new Error('User is not authenticated');
        }

        const chatMessage: FirebaseChatMessage = {
            uid: user.uid,
            message,
            date: Date.now(),
        };

        if (channel === 'General') {
            await addDoc(this.globalChatCollection, chatMessage); // Add message to global chat
        } else {
            const channelMessagesCollection = collection(this.firestore, `chatChannels/${channel}/messages`);
            await addDoc(channelMessagesCollection, chatMessage); // Add message to specific channel
        }
    }

    /**
     * Get a real-time stream of the latest 50 messages from the global chat.
     */
    getMessages(channel: string): Observable<FirebaseChatMessage[]> {
        const messagesCollection = channel === 'General' ? this.globalChatCollection : collection(this.firestore, `chatChannels/${channel}/messages`);
        const messagesQuery = query(
            messagesCollection,
            orderBy('date', 'desc'), // Fetch latest messages first
            limit(MESSAGES_LIMIT), // Load only the last 50 messages
        );

        return new Observable<FirebaseChatMessage[]>((observer) => {
            let messagesCache: FirebaseChatMessage[] = []; // Store messages
            const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
                const newMessages: FirebaseChatMessage[] = [];
                const userIds: Set<string> = new Set();

                snapshot.docChanges().forEach((change) => {
                    const message = change.doc.data() as FirebaseChatMessage;

                    if (change.type === 'added') {
                        newMessages.push(message); // Collect new messages
                        userIds.add(message.uid);
                    }
                });

                if (newMessages.length === 0) return;

                // Fetch user details for all unique UIDs
                const users = await this.fetchUserDetails(Array.from(userIds));

                // Attach user details to messages
                const enrichedMessages = newMessages.map((msg) => ({
                    ...msg,
                    username: users[msg.uid]?.username || 'Inconnu',
                    avatar:
                        users[msg.uid]?.avatarEquipped || 'https://res.cloudinary.com/dtu6fkkm9/image/upload/v1737478954/default-avatar_qcaycl.jpg',
                }));

                // 🔥 **Ensure messages are always in ascending order**
                messagesCache = [...messagesCache, ...enrichedMessages].sort((a, b) => a.date - b.date);

                observer.next([...messagesCache]); // Send the correctly ordered messages
            });

            return () => unsubscribe();
        });
    }

    /**
     * Load older messages (pagination).
     */
    loadOlderMessages(channel: string,lastMessageDate: number): Observable<FirebaseChatMessage[]> {
        const messagesCollection = channel === 'General' ? this.globalChatCollection : collection(this.firestore, `chatChannels/${channel}/messages`);
        const olderMessagesQuery = query(
            messagesCollection,
            orderBy('date', 'desc'),
            startAfter(lastMessageDate), // Load older messages before the last known message
            limit(50),
        );

        return new Observable<FirebaseChatMessage[]>((observer) => {
            let messagesCache: FirebaseChatMessage[] = []; // Store older messages
            const unsubscribe = onSnapshot(olderMessagesQuery, async (snapshot) => {
                const newMessages: FirebaseChatMessage[] = [];
                const userIds: Set<string> = new Set();

                snapshot.docChanges().forEach((change) => {
                    const message = change.doc.data() as FirebaseChatMessage;

                    if (change.type === 'added') {
                        newMessages.push(message); // Add new messages only
                        userIds.add(message.uid);
                    }
                });

                if (newMessages.length === 0) return;

                // Fetch user details for all unique UIDs
                const users = await this.fetchUserDetails(Array.from(userIds));

                // Attach user details to messages
                const enrichedMessages = newMessages.map((msg) => ({
                    ...msg,
                    username: users[msg.uid]?.username || 'Unknown',
                    avatar: users[msg.uid]?.avatarEquipped || 'assets/default-avatar.png',
                }));

                // 🔥 **Ensure messages are always in ascending order**
                messagesCache = [...enrichedMessages, ...messagesCache].sort((a, b) => a.date - b.date);

                observer.next([...messagesCache]); // Send correctly ordered messages
            });

            return () => unsubscribe();
        });
    }

    /**
     * Fetch user details (username & avatar) for a list of UIDs.
     */
    private async fetchUserDetails(userIds: string[]): Promise<Record<string, Partial<User>>> {
        const userDetails: Record<string, Partial<User>> = {};

        // Fetch all users in parallel with Firestore's `.select()`
        const userFetches = userIds.map(async (uid) => {
            const userDocRef = doc(this.usersCollection, uid).withConverter({
                fromFirestore: (snap) => {
                    const data = snap.data();
                    return { username: data?.username, avatarEquipped: data?.avatarEquipped };
                },
                toFirestore: () => ({}),
            });

            const userSnapshot = await getDoc(userDocRef);
            if (userSnapshot.exists()) {
                userDetails[uid] = userSnapshot.data();
            }
        });

        await Promise.all(userFetches);
        return userDetails;
    }

    async createChannel(channel: string): Promise<void> {
        try {
            const channelDocRef = doc(this.chatChannelsCollection, channel);
            const channelDoc = await getDoc(channelDocRef);

            if (channelDoc.exists()) {
                throw new Error('A channel with the same name already exists.');
            }

            const newChannelData = {
                name: channel,
                users: [],
            };

            await setDoc(channelDocRef, newChannelData);
        } catch (error) {
            console.error('Error creating channel:', error);
            throw new Error('Failed to create channel.');
        }
    }

    fetchAllChannels(): Observable<ChatChannel[]> {
        return new Observable<ChatChannel[]>((observer) => {
            const currentUserId = this.authService.getUser()?.uid || '';
            const unsubscribe = onSnapshot(this.chatChannelsCollection, (snapshot) => {
                const channels: ChatChannel[] = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return chatChannelFromJson(data, currentUserId);
                });
                observer.next(channels);
            });

            return () => unsubscribe();
        });
    }

    async joinChannel(channel: string): Promise<void> {
        try {
            const user = this.authService.getUser();
            if (!user) {
                throw new Error('User is not authenticated');
            }

            const currentUserUid = user.uid;
            const channelDocRef = doc(this.chatChannelsCollection, channel);

            await updateDoc(channelDocRef, {
                users: arrayUnion(currentUserUid),
            });
        } catch (error) {
            console.error('Error joining channel:', error);
            throw new Error('Failed to join channel.');
        }
    }

    async quitChannel(channel: string): Promise<void> {
        try {
            const user = this.authService.getUser();
            if (!user) {
                throw new Error('User is not authenticated');
            }

            const currentUserUid = user.uid;
            const channelDocRef = doc(this.chatChannelsCollection, channel);

            await updateDoc(channelDocRef, {
                users: arrayRemove(currentUserUid),
            });
        } catch (error) {
            console.error('Error quitting channel:', error);
            throw new Error('Failed to quit channel.');
        }
    }

    async deleteChannel(channelName: string): Promise<void> {
        try {
            const channelDocRef = doc(this.chatChannelsCollection, channelName);
            const messagesCollectionRef = collection(channelDocRef, 'messages');

            // Delete all documents in the messages subcollection
            const messagesSnapshot = await getDocs(messagesCollectionRef);
            const deletePromises = messagesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // Delete the channel document
            await deleteDoc(channelDocRef);
        } catch (error) {
            console.error('Error deleting channel:', error);
            throw new Error('Failed to delete channel.');
        }
    }
}
