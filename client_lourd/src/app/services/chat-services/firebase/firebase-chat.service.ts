import { Injectable } from '@angular/core';
import {
    FieldValue,
    Firestore,
    addDoc,
    collection,
    doc,
    getDoc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    startAfter,
} from '@angular/fire/firestore';
import { MESSAGES_LIMIT } from '@app/constants/constants';
import { FirebaseChatMessage } from '@app/interfaces/chat-message';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FirebaseChatService {
    private globalChatCollection = collection(this.firestore, 'globalChat');
    private usersCollection = collection(this.firestore, 'users'); // Firestore users collection

    constructor(
        private firestore: Firestore,
        private authService: AuthService,
    ) {}

    /**
     * Send a message to the global chat.
     */
    async sendMessage(message: string): Promise<void> {
        const user = this.authService.getUser(); // Get logged-in user from AuthService
        if (!user) {
            throw new Error('User is not authenticated');
        }

        const chatMessage: FirebaseChatMessage = {
            uid: user.uid,
            message,
            date: serverTimestamp(),
        };

        await addDoc(this.globalChatCollection, chatMessage); // Add message to Firestore
    }

    /**
     * Get a real-time stream of the latest 50 messages from the global chat.
     */

    getMessages(): Observable<FirebaseChatMessage[]> {
        const messagesQuery = query(this.globalChatCollection, orderBy('date', 'desc'), limit(MESSAGES_LIMIT));

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
    loadOlderMessages(lastMessageDate: FieldValue): Observable<FirebaseChatMessage[]> {
        const olderMessagesQuery = query(
            this.globalChatCollection,
            orderBy('date', 'desc'),
            startAfter(lastMessageDate), // Load older messages before the last known message
            limit(MESSAGES_LIMIT),
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
}
