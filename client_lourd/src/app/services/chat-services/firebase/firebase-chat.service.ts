import { Injectable } from '@angular/core';
import {
    FieldValue,
    Firestore,
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    startAfter,
    updateDoc,
} from '@angular/fire/firestore';
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
            date: serverTimestamp(),
        };

        if (channel === 'General') {
            await addDoc(this.globalChatCollection, chatMessage); // Add message to global chat
        } else {
            const channelMessagesCollection = collection(this.firestore, `chatChannels/${channel}/messages`);
            await addDoc(channelMessagesCollection, chatMessage); // Add message to specific channel
        }
    }

    getChatChannelsCollection() {
        return this.chatChannelsCollection;
    }

    /**
     * Get a real-time stream of the latest 50 messages from the global chat.
     */

    getMessages(channel: string): Observable<FirebaseChatMessage[]> {
        const messagesCollection = channel === 'General' ? this.globalChatCollection : collection(this.firestore, `chatChannels/${channel}/messages`);
        const messagesQuery = query(messagesCollection, orderBy('date', 'desc'), limit(MESSAGES_LIMIT));

        return new Observable<FirebaseChatMessage[]>((observer) => {
            let messagesCache: FirebaseChatMessage[] = [];

            const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
                const updatedMessages: FirebaseChatMessage[] = [];
                const userIds: Set<string> = new Set();

                snapshot.docChanges().forEach((change) => {
                    const message = change.doc.data() as FirebaseChatMessage;

                    if (change.type === 'added' || change.type === 'modified') {
                        if (!message.date) return; // Skip if Firestore still hasn't set the timestamp

                        userIds.add(message.uid);
                        updatedMessages.push(message);
                    }
                });

                if (updatedMessages.length === 0) return;

                // Fetch user details
                const users = await this.fetchUserDetails(Array.from(userIds));

                // Attach user details
                const enrichedMessages = updatedMessages.map((msg) => ({
                    ...msg,
                    username: users[msg.uid]?.username || 'Inconnu',
                    avatar:
                        users[msg.uid]?.avatarEquipped || 'https://res.cloudinary.com/dtu6fkkm9/image/upload/v1737478954/default-avatar_qcaycl.jpg',
                    banner: users[msg.uid]?.borderEquipped,
                    isAdmin: users[msg.uid]?.role === 'player' ? false : true,
                }));

                // 🔥 Ensure messages are sorted correctly using `Timestamp`
                messagesCache = [...messagesCache, ...enrichedMessages].sort((a, b) => {
                    const dateA = (a.date as any)?.toMillis?.() || 0; // Convert Firestore Timestamp
                    const dateB = (b.date as any)?.toMillis?.() || 0; // Convert Firestore Timestamp
                    return dateA - dateB;
                });

                observer.next([...messagesCache]); // ✅ Emit updated messages
            });

            return () => unsubscribe();
        });
    }

    /**
     * Load older messages (pagination).
     */
    loadOlderMessages(channel: string, lastMessageDate: FieldValue): Observable<FirebaseChatMessage[]> {
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
                    banner: users[msg.uid]?.borderEquipped,
                    isAdmin: users[msg.uid]?.role === 'player' ? false : true,
                }));

                // 🔥 **Ensure messages are always in ascending order**
                messagesCache = [...enrichedMessages, ...messagesCache].sort((a, b) => {
                    const dateA = (a.date as any)?.toMillis?.() || 0; // Convert Firestore Timestamp
                    const dateB = (b.date as any)?.toMillis?.() || 0; // Convert Firestore Timestamp
                    return dateA - dateB;
                });

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
                    return {
                        username: data?.username,
                        avatarEquipped: data?.avatarEquipped,
                        borderEquipped: data?.borderEquipped,
                        role: data?.role,
                    };
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
            const user = this.authService.getUser();
            if (!user) {
                throw new Error('User is not authenticated');
            }

            const channelDocRef = doc(this.chatChannelsCollection, channel);
            const channelDoc = await getDoc(channelDocRef);

            if (channelDoc.exists()) {
                throw new Error('A channel with the same name already exists.');
            }

            const newChannelData = {
                name: channel,
                users: [user.uid],
            };

            await setDoc(channelDocRef, newChannelData);

            const userDocRef = doc(this.usersCollection, user.uid);
            await updateDoc(userDocRef, {
                joinedChannels: arrayUnion(channel),
            });
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
            const userDocRef = doc(this.usersCollection, currentUserUid);

            // Add the user to the channel's user list
            await updateDoc(channelDocRef, {
                users: arrayUnion(currentUserUid),
            });

            // Add the channel to the user's joinedChannels list
            await updateDoc(userDocRef, {
                joinedChannels: arrayUnion(channel),
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

            const userDocRef = doc(this.usersCollection, currentUserUid);

            // Remove the user from the channel's user list
            await updateDoc(channelDocRef, {
                users: arrayRemove(currentUserUid),
            });

            // Remove the channel from the user's joinedChannels list
            await updateDoc(userDocRef, {
                joinedChannels: arrayRemove(channel),
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
            const deletePromises = messagesSnapshot.docs.map(async (doc) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // Remove the channel from the joinedChannels field of all users
            const channelDoc = await getDoc(channelDocRef);
            if (channelDoc.exists()) {
                const channelData = channelDoc.data();
                const users = channelData.users || [];

                const userUpdatePromises = users.map(async (userId: string) => {
                    const userDocRef = doc(this.usersCollection, userId);
                    await updateDoc(userDocRef, {
                        joinedChannels: arrayRemove(channelName),
                    });
                });

                await Promise.all(userUpdatePromises);
            }

            // Delete the channel document
            await deleteDoc(channelDocRef);
        } catch (error) {
            console.error('Error deleting channel:', error);
            throw new Error('Failed to delete channel.');
        }
    }
}
