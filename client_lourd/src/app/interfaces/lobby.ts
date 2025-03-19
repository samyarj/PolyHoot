import { Quiz } from './quiz';

export interface Lobby {
    title: string;
    nbPlayers: number;
    roomId: string;
    isLocked: boolean;
    quiz: Quiz;
}
