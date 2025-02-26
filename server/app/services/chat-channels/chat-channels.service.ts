import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class ChatChannelsService {
    private firestore = admin.firestore();
    private globalChatCollection = this.firestore.collection('globalChat');
    private chatChannelsCollection = this.firestore.collection('chatChannels');


    async deleteChatChannel(channelName: string): Promise<void> {
        const channelRef = this.chatChannelsCollection.doc(channelName);
        const messagesRef = channelRef.collection('messages');

        // Delete all documents in the subcollection
        const messagesSnapshot = await messagesRef.get();
        const deletePromises = messagesSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        // Delete the parent document
        await channelRef.delete();
    }

    async deleteAllMessages(): Promise<void> {
        // 1. Delete messages from the "General" channel
        const generalMessagesSnapshot = await this.globalChatCollection.get();
        const batch = this.firestore.batch();
        generalMessagesSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // 2. Delete messages from all other channels
        const channelsSnapshot = await this.chatChannelsCollection.get();
        for (const channelDoc of channelsSnapshot.docs) {
            const messagesSnapshot = await channelDoc.ref.collection('messages').get();
            const channelBatch = this.firestore.batch();
            messagesSnapshot.forEach((messageDoc) => {
                channelBatch.delete(messageDoc.ref);
            });
            await channelBatch.commit();
        }

    }

}