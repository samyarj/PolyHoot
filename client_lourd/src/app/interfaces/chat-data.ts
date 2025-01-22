import { ChatMessage } from '@common/chat-message';

export interface ChatData {
    message: ChatMessage;
    roomId?: string;
    playerName: string;
}
