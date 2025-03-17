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
