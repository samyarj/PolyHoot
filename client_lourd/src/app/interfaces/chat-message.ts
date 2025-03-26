import { FieldValue } from '@angular/fire/firestore';

export interface FirebaseChatMessage {
    message: string;
    username?: string;
    avatar?: string;
    banner?: string;
    date: FieldValue;
    uid: string;
}
