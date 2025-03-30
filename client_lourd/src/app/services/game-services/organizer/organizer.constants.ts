import { QuestionType } from '@app/interfaces/question-type';

export const DEFAULT_QUESTION = {
    id: '12',
    points: 15,
    creator: '',
    choices: [
        {
            text: '',
        },
        {
            text: '',
        },
        {
            text: '',
        },
        {
            text: '',
        },
    ],
    type: QuestionType.QCM,
    text: '',
};
