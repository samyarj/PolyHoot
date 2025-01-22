import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';

export const MOCK_NUMBER = 13;
export const MOCK_OUTSIDE_RANGE_POINTS = 5;
export const MOCK_VALID_POINTS = 100;

export const MOCK_QUIZ_ONE_QUESTION_CHOICES: Quiz = {
    id: '2c4k6a',
    title: 'Quiz on Angular',
    description: 'Test your knowledge of Angular',
    duration: 45,
    lastModification: '2020-08-25T15:30:00+00:00',
    questions: [
        {
            type: QuestionType.QCM,
            text: 'text',
            points: 40,
            lastModified: '123',
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                    isSelected: true,
                },
            ],
        },
    ],
};

export const MOCK_WHITESPACE_QUESTION_CHOICES: Question = {
    type: QuestionType.QCM,
    text: 'text',
    points: 40,
    lastModified: '123',
    choices: [
        {
            text: 'var',
            isCorrect: true,
            isSelected: true,
        },
        {
            text: '  ',
            isCorrect: false,
            isSelected: false,
        },
    ],
};

export const MOCK_DUPLICATE_QUESTION_CHOICES: QuestionChoice[] = [
    {
        text: 'var',
        isCorrect: true,
        isSelected: true,
    },
    {
        text: 'var',
        isCorrect: false,
        isSelected: false,
    },
];

export const MOCK_UNIQUE_QUESTION_CHOICES: QuestionChoice[] = [
    {
        text: 'var',
        isCorrect: true,
        isSelected: true,
    },
    {
        text: 'const',
        isCorrect: false,
        isSelected: false,
    },
];

export const MOCK_EMPTY_QUESTION_CHOICES: QuestionChoice[] = [
    {
        text: ' ',
        isCorrect: true,
        isSelected: true,
    },
    {
        text: ' ',
        isCorrect: false,
        isSelected: false,
    },
];

export const MOCK_QUESTIONS_ARRAY: Question[] = [
    {
        id: 'q1',
        type: QuestionType.QCM,
        text: 'What is the capital of France?',
        points: 5,
        choices: [
            { text: 'Paris', isCorrect: true },
            { text: 'London', isCorrect: false },
            { text: 'Rome', isCorrect: false },
        ],
        lastModified: new Date().toString(),
    },
    {
        id: 'q2',
        type: QuestionType.QCM,
        text: 'Who wrote Hamlet?',
        points: 5,
        choices: [
            { text: 'William Shakespeare', isCorrect: true },
            { text: 'Charles Dickens', isCorrect: false },
            { text: 'Leo Tolstoy', isCorrect: false },
        ],
        lastModified: new Date().toString(),
    },
];

export const MOCK_QUESTION_HAMLET: Question = {
    id: 'q3',
    type: QuestionType.QCM,
    text: 'Who wrote Hamlet?',
    points: 5,
    choices: [
        { text: 'William Shakespeare', isCorrect: true },
        { text: 'Charles Dickens', isCorrect: false },
        { text: 'Leo Tolstoy', isCorrect: false },
    ],
    lastModified: new Date().toString(),
};

export const MOCK_QRL: Question = {
    id: 'IEEE',
    type: QuestionType.QRL,
    text: 'Qui est le meilleur prof de Polytechnique ?',
    points: 10,
};

export const MOCK_MIXED_QUESTIONS: Question[] = [
    {
        type: 'QRL',
        text: 'Comment se nomme la capital du Nepal ?',
        points: 10,
        lastModified: '2024-03-25 19 h 56 min 41 s',
        choices: [],
        id: '66021525e42fb9b2df424746',
    },
    {
        type: 'QCM',
        text: "Quelle planète est connue comme la 'Planète Rouge' ?",
        points: 40,
        choices: [
            {
                text: 'Mars',
                isCorrect: true,
            },
            {
                text: 'Jupiter',
                isCorrect: false,
            },
            {
                text: 'Vénus',
                isCorrect: false,
            },
            {
                text: 'Mercure',
                isCorrect: false,
            },
        ],
        lastModified: '2024-03-20 19 h 56 min 41 s',
        id: '660210fae42fb9b2df4217b3',
    },
    {
        type: 'QRL',
        text: 'Qui est le meilleur prof de Poly ?',
        points: 30,
        lastModified: '2024-02-23 19 h 56 min 41 s',
        choices: [],
        id: '66021525e42fb9b2df424747',
    },
];

export const MOCK_MIXED_QUESTIONS_CHOICES_REMOVED: Question[] = [
    {
        type: 'QRL',
        text: 'Comment se nomme la capital du Nepal ?',
        points: 10,
        lastModified: '2024-03-25 19 h 56 min 41 s',
        id: '66021525e42fb9b2df424746',
    },
    {
        type: 'QCM',
        text: "Quelle planète est connue comme la 'Planète Rouge' ?",
        points: 40,
        choices: [
            {
                text: 'Mars',
                isCorrect: true,
            },
            {
                text: 'Jupiter',
                isCorrect: false,
            },
            {
                text: 'Vénus',
                isCorrect: false,
            },
            {
                text: 'Mercure',
                isCorrect: false,
            },
        ],
        lastModified: '2024-03-20 19 h 56 min 41 s',
        id: '660210fae42fb9b2df4217b3',
    },
    {
        type: 'QRL',
        text: 'Qui est le meilleur prof de Poly ?',
        points: 30,
        lastModified: '2024-02-23 19 h 56 min 41 s',
        id: '66021525e42fb9b2df424747',
    },
];
