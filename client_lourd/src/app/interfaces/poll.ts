import { Question } from './question';
import { QuestionChoice } from './question-choice';
export interface Poll {
    title: string;
    questions: Question[];
    choices: QuestionChoice[];
    expired: boolean;
    expireDate: Date;
}
