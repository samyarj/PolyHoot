import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';

export const MOCK_NORMAL_QUIZ: Quiz = {
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
            ],
        },
        {
            type: QuestionType.QCM,
            text: 'What does HTML stand for?',
            points: 20,
            choices: [
                { text: 'HyperText Markup Language', isCorrect: true },
                { text: 'Highly Typed Modeling Language', isCorrect: false },
            ],
        },
    ],
};

export const MOCK_INCOMPLETE_QUIZ = {
    id: '2c4k6a',
    lastModification: '2020-08-25T15:30:00+00:00',
};

export const MOCK_QUIZ_BAD_QUESTIONS = {
    id: '2c4k6a',
    title: 'Quiz on Angular',
    description: 'Test your knowledge of Angular',
    duration: 45,
    lastModification: '2020-08-25T15:30:00+00:00',
    questions: [
        {
            choices: '',
        },
    ],
};

export const MOCK_QUIZ_BAD_CHOICES = {
    title: 'Quiz on Angular',
    description: 'Test your knowledge of Angular',
    duration: 45,
    questions: [
        {
            type: QuestionType.QCM,
            text: 'Which of the following directives is used to loop on an array?',
            points: 30,
            choices: [
                { text: ' ', isCorrect: false },
                { text: 3 as unknown as string, isCorrect: true },
                { text: 'span', isCorrect: false },
            ],
        },
    ],
};

export const MOCK_QUIZ_EXTRA_ATTRIBUTES = {
    id: '2c4k6a',
    weirdAttribute: 'hell no',
    title: 'Quiz on Angular',
    description: 'Test your knowledge of Angular',
    duration: 45,
    lastModification: '2020-08-25T15:30:00+00:00',
    questions: [
        {
            type: QuestionType.QCM,
            anotherOne: 'bites the dust',
            text: 'Which of the following directives is used to loop on an array?',
            points: 30,
            choices: [
                { text: 'div', isCorrect: false },
                { text: '*ngFor', isCorrect: true, nothingToSeeHere: 1 },
            ],
        },
    ],
};

export const MOCK_QUIZ_EXTRA_CORRECTED = {
    title: 'Quiz on Angular',
    description: 'Test your knowledge of Angular',
    duration: 45,
    questions: [
        {
            type: QuestionType.QCM,
            text: 'Which of the following directives is used to loop on an array?',
            points: 30,
            choices: [
                { text: 'div', isCorrect: false },
                { text: '*ngFor', isCorrect: true },
            ],
        },
    ],
};

export const MOCK_QUESTION_CHOICES = [
    {
        text: 'Un système de gestion de base de données',
        isCorrect: false,
    },
    {
        text: 'Un système de contrôle de version',
        isCorrect: null,
    },
];

export const MOCK_QUESTION_CHOICES_AFTER = [
    {
        text: 'Un système de gestion de base de données',
        isCorrect: false,
    },
    {
        text: 'Un système de contrôle de version',
        isCorrect: false,
    },
];

export const GOOD_MOCKFILE = {
    name: 'Quiz on Angular 2',
    body: JSON.stringify(MOCK_NORMAL_QUIZ),
    mimeType: 'application/json',
};

export const BAD_MOCKFILE = {
    name: 'Quiz on Angular 2',
    body: 'random',
    mimeType: 'application/json',
};

export const MOCK_QRL_WITH_CHOICES = {
    type: 'QRL',
    text: 'Which of the following is a valid programming language?',
    points: 10,
    choices: [
        {
            text: 'Java',
            isCorrect: true,
        },
        {
            text: 'HTML',
            isCorrect: false,
        },
    ],
};

export const MOCK_QCM_WITHOUT_CHOICES = {
    type: 'QCM',
    text: 'Which of the following is a valid programming language?',
    points: 10,
    choices: null,
};

export const MOCK_QUESTION_INVALID_TYPE = {
    type: 'QRC',
    text: 'Which of the following is a valid programming language?',
    points: 10,
};

export const EXPECTED_ERRORS_1 = [
    'Le champ obligatoire title doit être de type string et être non vide',
    'Le champ obligatoire description doit être de type string et être non vide',
    'Le champ obligatoire duration doit être de type number',
    'Le jeu questionnaire doit contenir au minimum 1 question',
];

export const EXPECTED_ERRORS_2 = [
    'Le champ obligatoire title doit être présent',
    'Le champ obligatoire description doit être présent',
    'Le champ obligatoire duration doit être présent',
    'Le champ obligatoire questions doit être présent',
];

export const EXPECTED_ERRORS_3 = [
    'La question #1 doit avoir un champ type valide qui doit être QCM ou QRL',
    'La question #1 doit avoir un nombre de points entre 10 et 100 inclusivement qui est un multiple de 10',
    'La question #2 doit avoir un champ "text" valide',
];

export const EXPECTED_ERRORS_4 = [
    'La question #1 doit avoir un champ "text" valide',
    'La question #1 doit avoir un champ type valide qui doit être QCM ou QRL',
    'La question #1 doit avoir un champ points pour le nombre de point qui est un number',
];

export const EXPECTED_ERRORS_5 = [
    'La question #2 doit avoir entre 2 à 4 choix de réponses inclusivement',
    'La question #2 doit avoir au moins 1 choix de réponse true et 1 choix de réponse false',
];

export const EXPECTED_ERRORS_6 = [
    'Le choix de réponse #1 de la question #1 doit avoir un champ "text" valide',
    'Le choix de réponse #2 de la question #1 doit avoir un champ "text" valide',
];
