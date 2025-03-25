export interface ChatMessage {
    message: string;
    author: string;
    date?: Date;
    uid?: string;
    avatar?: string;
    banner?: string;
}
