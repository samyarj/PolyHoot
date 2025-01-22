export const SEED_1 = 1000;
export const SEED_2 = 9000;
export const TIME_FOR_QRL = 60;
export const BONUS_MULTIPLIER = 1.2;
export const MAX_POINTS = 100;
export const MIN_POINTS = 10;
export const PASSWORD_MIN_LENGTH = 6;
export const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/dtu6fkkm9/image/upload/v1737478954/default-avatar_qcaycl.jpg';
export const emptyUser = {
    uid: '',
    username: '',
    email: '',
    role: '',
    friends: [],
    friendRequests: [],
    avatarEquipped: '',
    borderEquipped: '',
    config: {
        themeEquipped: 'default',
        languageEquipped: 'fr',
    },
    nbReport: 0,
    nbBan: 0,
    unBanDate: null,
    inventory: {
        banners: [],
        themes: [],
        avatars: [],
    },
    joinedChannels: [],
    coins: 0,
    cxnLogs: [],
    playedGameLogs: [],
    nWins: 0,
    isOnline: true,
    pity: 0,
};
