import { NavItem } from '@app/interfaces/ux-related';

export const MIN_POINTS = 10;
export const MAX_POINTS = 100;
export const STEP = 10;
export const MAX_CHOICES = 4;
export const MIN_CHOICES = 2;
export const BONUS_MULTIPLIER = 1.2;
export const QRL_TIME = 60;
export const INVALID_INDEX = -1;
export const QUESTION_DELAY = 3000;
export const START_GAME_COUNTDOWN = 5;
export const MAX_CHAR = 200;
export const TIME_TO_NEXT_ANSWER = 3000;
export const TIMER_VALUE = 5000;
export const NOT_FOUND = -1;
export const BUFFER_TIME = 4000;
export const EMPTY_STRING = '';
export const ID = 'id';
export const WIDTH_SIZE = '400px';
export const DISPLAYED_COLUMNS = ['name', 'startingDate', 'playersNumber', 'bestScore'];
export const RELOAD_DELAY_MS = 2000;

export const ASC = 'asc';
export const DESC = 'desc';
export const NONE = '';

export type SortDirection = typeof ASC | typeof DESC | typeof NONE;
export const ALERT_SOUND_PATH = 'assets/alert_sound.mp3';
export const ALERT_SOUND_INTENSITY_DECREMENTATION = 0.01;
export const ALERT_SOUND_DECREASE_INTERVAL = 200;
export const BASE_VOLUME = 0.5;

const MINUTES = 60;
export const MILLISECONDS = 1000;
const QUARTER_HOUR = 15;

export const TOKEN_EXPIRY_TIME = QUARTER_HOUR * MINUTES * MILLISECONDS;
export const EXPIRY_CHECK_INTERVAL = MINUTES * MILLISECONDS;

export const EMAIL_REGEX = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,20}$/;
export const PASSWORD_MIN_LENGTH = 6;
export const MESSAGES_LIMIT = 5;
export const MIN_LOADING_TIME = 600;

export const DEFAULT_HOVER_INDEX = -1;

export const NAV_PLAYER_INFO: NavItem[] = [
    {
        title: ' Jouer',
        description: 'Testez vos connaissances en joignant ou créant une partie!',
        screenshots: [
            {
                image: 'joinGame.png',
                route: '/game-home/joinGame',
                buttonDescription: 'Joindre une partie',
            },
            {
                image: 'create.png',
                route: '/game-home/create',
                buttonDescription: 'Créer une partie',
            },
            {
                image: '',
                route: '/game-home/lobby-list',
                buttonDescription: 'Voir les parties',
            },
        ],
    },
    {
        title: 'Section chance',
        description: 'Tentez votre chance dans la section chance!',
        screenshots: [
            {
                image: 'dailyFree.png',
                route: '/luck/dailyFree',
                buttonDescription: 'Prix Quotidien',
            },
            {
                image: 'lootBox.png',
                route: '/luck/lootBox',
                buttonDescription: 'Ouvrir une LootBox',
            },
            {
                image: 'coinFlip.png',
                route: '/luck/coinFlip',
                buttonDescription: 'Jouer au coin flip',
            },
        ],
    },
    {
        title: 'Administrer les quiz', // Administrer les quiz
        description: 'Gérez et créez des quiz pour les utilisateurs!',
        screenshots: [
            {
                image: 'quizList.png',
                route: '/quiz-question-management/quizList',
                buttonDescription: 'Gérer les quiz',
            },
            {
                image: 'createQuiz.png',
                route: '/quiz-question-management/createQuiz',
                buttonDescription: 'Créer un quiz',
            },
            {
                image: 'questionBank.png',
                route: '/quiz-question-management/questionBank',
                buttonDescription: 'Gérer les questions',
            },
        ],
    },
    {
        title: 'Inventaire',
        description: 'Gérez votre inventaire et vos objets!',
        screenshots: [
            {
                image: 'inventory.png',
                route: '/inventory',
                buttonDescription: "Voir l'inventaire",
            },
        ],
    },
    {
        title: 'Boutique',
        description: 'Achetez des objets dans notre boutique!',
        screenshots: [
            {
                image: 'shop.png',
                route: '/shop-home/shop',
                buttonDescription: 'Voir la boutique',
            },
            {
                image: '',
                route: '/shop-home/transfer',
                buttonDescription: 'Transférer des coins',
            },
        ],
    },
    {
        title: 'Profil',
        description: 'Gérez votre profil et vos paramètres!',
        screenshots: [
            {
                image: '',
                route: '/profile',
                buttonDescription: 'Voir le profil',
            },
        ],
    },
];

export const NAV_ADMIN_INFO: NavItem[] = [
    {
        title: 'Administrer les joueurs',
        description: 'Observez les joueurs et leurs informations!',
        screenshots: [
            {
                image: 'playerInfo.png',
                route: 'playerInfo',
                buttonDescription: 'Consultez les joueurs',
            },
        ],
    },
    {
        title: 'Sondages',
        description: 'Créez, gérez et consultez des sondages pour les utilisateurs!',
        screenshots: [
            {
                image: 'pollList.png',
                route: '/polls/consult',
                buttonDescription: 'Voir les sondages',
            },
            { image: 'createPoll.png', route: '/polls/create', buttonDescription: 'Créer un sondage' },
            { image: 'createPoll.png', route: '/polls/history', buttonDescription: 'Historique des sondages' },
        ],
    },
];
