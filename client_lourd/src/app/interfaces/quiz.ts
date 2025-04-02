import { Question } from './question';

export interface Quiz {
    id?: string;
    title: string;
    description: string;
    lastModification: string;
    duration: number;
    questions: Question[];
}
