import { ChatMessage } from '@common/chat-message';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
    private histories: Map<string, ChatMessage[]>;
    private lastRequestTimestamps: Map<string, Map<string, number>> = new Map();

    constructor() {
        this.histories = new Map<string, ChatMessage[]>();
    }

    addMessage(message: ChatMessage, roomId: string): void {
        if (this.isConvoInHistories(roomId)) this.addMessageInHistory(message, roomId);
        else this.addMessageAndCreateHistory(message, roomId);
    }

    getHistory(roomId: string) {
        return this.isConvoInHistories(roomId) ? this.histories.get(roomId) : [];
    }

    deleteHistory(roomId: string) {
        this.lastRequestTimestamps.delete(roomId);
        return this.histories.delete(roomId);
    }

    private isConvoInHistories(roomId: string) {
        return this.histories.has(roomId);
    }

    private addMessageAndCreateHistory(message: ChatMessage, roomId: string): void {
        if (roomId) this.histories.set(roomId, [message]);
    }

    private addMessageInHistory(message: ChatMessage, roomId: string): void {
        this.histories.get(roomId).push(message);
    }

    checkAndUpdateTimestamp(roomId: string, user: string, minInterval: number): boolean {
        const currentTime = Date.now();
        if (!this.lastRequestTimestamps.has(roomId)) {
            this.lastRequestTimestamps.set(roomId, new Map());
        }

        const userTimestamps = this.lastRequestTimestamps.get(roomId);
        if (userTimestamps.has(user)) {
            const lastRequestTime = userTimestamps.get(user);
            if (lastRequestTime && currentTime - lastRequestTime < minInterval) {
                return false;
            }
        }
        userTimestamps.set(user, currentTime);
        return true;
    }
}
