import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, onSnapshot } from '@angular/fire/firestore';
import { ChatMessage } from '@app/interfaces/chat-message';
import { AuthService } from '@app/services/auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FirebaseChatService {
    private globalChatCollection = collection(this.firestore, 'globalChat'); // Firestore collection for global chat

    constructor(
        private firestore: Firestore,
        private authService: AuthService,
    ) {}

    /**
     * Send a message to the global chat.
     */
    async sendMessage(message: string): Promise<void> {
        const user = this.authService.getUser(); // Get the logged-in user from AuthService
        if (!user) {
            throw new Error('User is not authenticated');
        }

        const chatMessage: ChatMessage = {
            message,
            author: user.username,
            date: Date.now(),
            uid: user.uid,
        };

        await addDoc(this.globalChatCollection, chatMessage); // Add message to Firestore
    }

    /**
     * Get a real-time stream of messages from the global chat.
     */
    getMessages(): Observable<ChatMessage[]> {
        const messagesQuery = query(this.globalChatCollection, orderBy('date', 'asc'));

        return new Observable<ChatMessage[]>((observer) => {
            let existingMessages: ChatMessage[] = [];
            const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const newMessage = change.doc.data() as ChatMessage;

                        // Append only new messages
                        existingMessages = [...existingMessages, newMessage];
                    }
                });

                observer.next(existingMessages);
            });

            // Unsubscribe from Firestore listener when observable is completed
            return () => unsubscribe();
        });
    }
}
