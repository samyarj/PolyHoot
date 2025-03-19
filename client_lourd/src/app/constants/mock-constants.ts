/* eslint-disable max-lines */
// notre fichier des constantes, donc nous nous permettons de depasser les lignes
import { Game } from '@app/interfaces/game';
import { Poll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';

export const MOCK_POP_UP_QUIZ: Quiz = {
    title: 'React Quiz',
    description: 'A brief quiz on React',
    duration: 30,
    questions: [
        { text: 'What is React?', type: QuestionType.QCM, points: 30 },
        { text: 'Who built React?', type: QuestionType.QCM, points: 30 },
    ],
    visibility: true,
    id: '1234',
    lastModification: 'null',
};

export const EMPTY_QUIZ: Quiz = {
    title: '',
    description: '',
    lastModification: '',
    duration: 0,
    questions: [],
    visibility: false,
};

export const EMPTY_QUIZ_GAME_CLIENT: Quiz = {
    id: '123',
    title: '123',
    description: '123',
    duration: 15,
    lastModification: '123',
    questions: [
        { type: QuestionType.QCM, text: '', points: 20, lastModified: '123', choices: [] },
        { type: QuestionType.QCM, text: 'other text', points: 20, lastModified: '123', choices: [] },
    ],
};

export const EMPTY_QCM_QUESTION: Question = {
    type: QuestionType.QCM,
    text: '',
    points: 10,
    choices: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ],
};
export const EMPTY_QRE_QUESTION: Question = {
    id: '',
    type: 'QRE',
    text: '',
    points: 10,
    qreAttributes: {
        goodAnswer: 0,
        minBound: 0,
        maxBound: 0,
        tolerance: 0,
    },
};
export const EMPTY_POLL: Poll = {
    title: '',
    description: '',
    questions: [],
    expired: false,
    expireDate: new Date(9999, 1, 1),
    isPublished: false,
};
export const EMPTY_POLL_QUESTION: Question = {
    type: QuestionType.QCM,
    text: '',
    points: 0,
    choices: [{ text: '' }, { text: '' }],
};

export const POLL_1: Poll = {
    title: 'Premier sondage',
    description: 'Sondage portant sur les items par défaut de la boutique',
    questions: [
        {
            type: QuestionType.QCM,
            text: 'Quel est votre avatar préféré ?',
            points: 0,
            choices: [{ text: 'Wonder Woman' }, { text: 'Superman' }, { text: 'Spider-man' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quel est votre thème préféré ?',
            points: 0,
            choices: [{ text: 'vice' }, { text: 'celstial' }, { text: 'dark' }, { text: 'sunset' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quel est votre banner préférée ?',
            points: 0,
            choices: [{ text: 'league of legends' }, { text: 'le cercle jaune là' }],
        },
    ],
    expired: false,
    expireDate: new Date(9999, 1, 1),
    isPublished: false,
};

export const EMPTY_QUESTION_WITHOUT_CHOICES: Question = {
    type: QuestionType.QRL,
    text: '',
    points: 10,
};

export const QUIZ_EXAMPLE: Quiz = {
    id: '1a2b3c',
    title: 'Questionnaire sur le JS',
    description: 'Questions de pratique sur le langage JavaScript',
    duration: 6,
    lastModification: '2018-11-13T20:20:39+00:00',
    questions: [
        {
            type: QuestionType.QCM,
            text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
            points: 40,
            lastModified: '123',
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                },
                {
                    text: 'self',
                    isCorrect: false,
                },
                {
                    text: 'this',
                    isCorrect: true,
                },
                {
                    text: 'int',
                },
            ],
        },
        {
            type: QuestionType.QRL,
            text: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
            points: 60,
            lastModified: '123',
        },
        {
            type: QuestionType.QCM,
            text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
            points: 20,
            lastModified: '123',
            choices: [
                {
                    text: 'Non',
                    isCorrect: true,
                },
                {
                    text: 'Oui',
                    isCorrect: null,
                },
            ],
        },
    ],
};

export const MOCK_QUIZ: Quiz = {
    title: 'React Quiz',
    description: 'A brief quiz on React',
    duration: 30,
    questions: [
        {
            text: 'What is React?',
            type: QuestionType.QCM,
            points: 30,
            choices: [
                { text: 'A library for building user interfaces', isCorrect: true },
                { text: 'A framework for building user interfaces', isCorrect: false },
                { text: 'A language for building user interfaces', isCorrect: false },
            ],
        },
        {
            text: 'Who built React?',
            type: QuestionType.QCM,
            points: 30,
            choices: [
                { text: 'Facebook', isCorrect: true },
                { text: 'Google', isCorrect: false },
                { text: 'Twitter', isCorrect: false },
                { text: 'Amazon', isCorrect: false },
            ],
        },
        {
            text: 'Fin du questionnaire',
            type: QuestionType.QCM,
            points: 0,
            choices: [],
        },
    ],
    visibility: false,
    id: '1234',
    lastModification: 'null',
};

export const MOCK_QUIZZES: Quiz[] = [
    {
        id: 'quiz1',
        title: 'General Knowledge',
        description: 'Test your general knowledge with a range of questions on various topics.',
        lastModification: new Date().toString(),
        duration: 15,
        questions: [
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
        ],
        visibility: true,
    },
    {
        id: 'quiz2',
        title: 'Science and Nature',
        description: 'A quiz dedicated to your knowledge of science and the natural world.',
        lastModification: new Date().toString(),
        duration: 20,
        questions: [
            {
                id: 'q3',
                type: QuestionType.QCM,
                text: 'What is the chemical symbol for gold?',
                points: 40,
                choices: [
                    { text: 'Au', isCorrect: true },
                    { text: 'Ag', isCorrect: false },
                    { text: 'Pb', isCorrect: false },
                ],
                lastModified: new Date().toString(),
            },
            {
                id: 'q4',
                type: QuestionType.QCM,
                text: 'How many planets are in our solar system?',
                points: 50,
                choices: [
                    { text: '8', isCorrect: true },
                    { text: '9', isCorrect: false },
                    { text: '7', isCorrect: false },
                ],
                lastModified: new Date().toString(),
            },
        ],
        visibility: true,
    },
    {
        id: 'quiz3',
        title: 'World History',
        description: 'Dive into the past with questions on world history.',
        lastModification: new Date().toString(),
        duration: 25,
        questions: [
            {
                id: 'q5',
                type: QuestionType.QCM,
                text: 'Who was the first president of the United States?',
                points: 50,
                choices: [
                    { text: 'George Washington', isCorrect: true },
                    { text: 'Thomas Jefferson', isCorrect: false },
                    { text: 'John Adams', isCorrect: false },
                ],
                lastModified: new Date().toString(),
            },
            {
                id: 'q6',
                type: QuestionType.QCM,
                text: 'In which year did the World War I begin?',
                points: 20,
                choices: [
                    { text: '1914', isCorrect: true },
                    { text: '1916', isCorrect: false },
                    { text: '1912', isCorrect: false },
                ],
                lastModified: new Date().toString(),
            },
        ],
        visibility: true,
    },
];

export const MOCK_QUESTION: Question = MOCK_QUIZ.questions[0];

export const MOCK_QUESTIONS: Question[] = [...MOCK_QUIZZES[0].questions, ...MOCK_QUIZZES[1].questions, ...MOCK_QUIZZES[2].questions];

export const MOCK_QUIZZES_ADMIN: Quiz[] = [
    {
        id: '15',
        title: 'NestJS Framework Challenge',
        description: 'Test your understanding of NestJS, a powerful Node.js framework.',
        duration: 45,
        lastModification: '2024-03-20T12:00:00',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'What is the main architectural pattern used by NestJS?',
                points: 30,
                choices: [
                    { text: 'Model-View-Controller (MVC)', isCorrect: false },
                    { text: 'Observer pattern', isCorrect: false },
                    { text: 'Dependency Injection (DI)', isCorrect: true },
                ],
            },
            {
                type: QuestionType.QCM,
                text: 'Which package is commonly used for handling HTTP requests in NestJS?',
                points: 15,
                choices: [
                    { text: 'express', isCorrect: true },
                    { text: 'koa', isCorrect: false },
                    { text: 'hapi', isCorrect: false },
                ],
            },
        ],
    },
    {
        id: '2c4k6a',
        title: 'Quiz on Angular',
        description: 'Test your knowledge of Angular',
        duration: 45,
        lastModification: '2020-08-25T15:30:00+00:00',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'Which of the following directives is used to loop on an array?',
                points: 30,
                choices: [
                    { text: 'div', isCorrect: false },
                    { text: '*ngFor', isCorrect: true },
                    { text: 'span', isCorrect: false },
                    { text: 'p', isCorrect: false },
                ],
            },
            {
                type: QuestionType.QCM,
                text: 'What does HTML stand for?',
                points: 20,
                choices: [
                    { text: 'HyperText Markup Language', isCorrect: true },
                    { text: 'Highly Typed Modeling Language', isCorrect: false },
                    { text: 'Hyperlink and Text Management Language', isCorrect: false },
                ],
            },
        ],
    },
];

export const MOCK_QUESTION_GAME_PAGE: Question = {
    type: QuestionType.QCM,
    text: 'asd',
    points: 20,
    lastModified: '123',
    choices: [
        {
            text: 'var',
            isCorrect: true,
        },
        {
            text: 'self',
            isCorrect: false,
        },
        {
            text: 'this',
            isCorrect: true,
        },
    ],
};

export const MOCK_QUESTION_ADD_POINTS: Question = {
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
            text: 'self',
            isCorrect: false,
            isSelected: false,
        },
    ],
};

export const MOCK_SCROLL_HEIGHT = 100;

export const MOCK_GAMES: Game[] = [
    { name: 'Space Invaders', startingDate: '2024-01-01', playersNumber: 4, bestScore: 5000 },
    { name: 'Mystic Quest', startingDate: '2024-02-15', playersNumber: 2, bestScore: 3000 },
    { name: 'Castle Raiders', startingDate: '2024-03-10', playersNumber: 3, bestScore: 4500 },
    { name: 'Ocean Explorer', startingDate: '2024-04-05', playersNumber: 5, bestScore: 3500 },
    { name: 'Sky High', startingDate: '2024-05-20', playersNumber: 2, bestScore: 4000 },
    { name: 'Dungeon Maze', startingDate: '2024-06-15', playersNumber: 4, bestScore: 4800 },
    { name: 'Racing Legends', startingDate: '2024-07-01', playersNumber: 6, bestScore: 5200 },
    { name: 'Alien Shooter', startingDate: '2024-08-12', playersNumber: 3, bestScore: 4700 },
    { name: 'Puzzle Master', startingDate: '2024-09-30', playersNumber: 1, bestScore: 2800 },
    { name: 'Treasure Hunt', startingDate: '2024-10-25', playersNumber: 4, bestScore: 4100 },
];
