export interface FirebaseChatMessage {
    message: string;
    username?: string;
    avatar?: string;
    date: number;
    uid: string;
}
