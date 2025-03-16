import { PlayerPerformanceMetrics } from './gameStats';

export interface User {
    uid: string; // Primary Key
    username: string; // Must be unique
    email: string; // Must be unique

    // Optional fields
    password?: string; // Hashed password
    role?: 'admin' | 'player'; // User role: admin or joueur
    friends?: string[]; // List of UIDs of friends
    friendRequests?: string[]; // List of UIDs of pending friend requests
    avatarEquipped?: string; // Link to the equipped avatar
    borderEquipped?: string; // Link to the equipped border
    config?: {
        themeEquipped?: string; // Currently equipped theme
        languageEquipped?: string; // Currently equipped language
    };
    nbReport?: number; // Number of reports
    nbBan?: number; // Number of bans
    unBanDate?: Date; // Date when the user will be unbanned
    inventory?: {
        banners?: string[]; // Links to owned banners
        themes?: string[]; // Links to owned themes
        avatars?: string[]; // Links to owned avatars
    };
    joinedChannels?: string[]; // IDs of channels the user has joined
    coins?: number; // User's coin balance
    cxnLogs?: string[]; // Connection logs
    playedGameLogs?: string[]; // Logs of played games
    stats?: PlayerPerformanceMetrics[];
    nWins?: number; // Number of wins
    nGames?: number; // Number of games played
    isOnline?: boolean; // Online status
    pity?: number; // Pity counter
    nextDailyFree?: Date; // Next date where user can get daily free
}
