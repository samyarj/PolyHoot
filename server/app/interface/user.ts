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
    playerReports?: string[]; // List of player uids that reported the user.
    inventory?: {
        banners?: string[]; // Links to owned banners
        themes?: string[]; // Links to owned themes
        avatars?: string[]; // Links to owned avatars
    };
    joinedChannels?: string[]; // IDs of channels the user has joined
    coins?: number; // User's coin balance
    cxnLogs?: {
        timestamp: string;
        action: 'connect' | 'disconnect';
    }[];
    playedGameLogs?: string[]; // Logs of played games
    gameLogs?: {
        gameName?: string; // Name of the game
        startTime?: string; // Start time of the game
        endTime?: string; // End time of the game
        status?: 'complete' | 'abandoned'; // Game status
        result?: 'win' | 'lose'; // Game result
    }[];
    stats?: {
        nQuestions?: number; // Total number of questions answered
        nGoodAnswers?: number; // Number of correct answers
        rightAnswerPercentage?: number; // Percentage of correct answers
        timeSpent?: number; // Total time spent playing (in seconds)
    };
    nWins?: number; // Number of wins
    nGames?: number; // Number of games played
    isOnline?: boolean; // Online status
    pity?: number; // Pity counter
    nextDailyFree?: Date; // Next date where user can get daily free
}
