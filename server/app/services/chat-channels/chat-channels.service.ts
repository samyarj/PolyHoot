import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class ChatChannelsService {
    private firestore = admin.firestore();

    async deleteChatChannel(channelName: string): Promise<void> {
        const channelRef = this.firestore.collection('chatChannels').doc(channelName);
        const messagesRef = channelRef.collection('messages');

        // Delete all documents in the subcollection
        const messagesSnapshot = await messagesRef.get();
        const deletePromises = messagesSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        // Delete the parent document
        await channelRef.delete();
    }

}