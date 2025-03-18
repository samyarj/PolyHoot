import { QreAttributes } from './qre-attributes';
import { QuestionChoice } from './question-choice';

export interface Question {
    id?: string;
    type: string;
    text: string;
    points: number;
    choices?: QuestionChoice[];
    qreAttributes?: QreAttributes;
    image?: string;
    lastModified?: string;
}
