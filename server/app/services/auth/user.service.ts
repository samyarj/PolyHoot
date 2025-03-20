import { DEFAULT_AVATAR_URL, DEFAULT_AVATARS, emptyUser } from '@app/constants';
import { User } from '@app/interface/user';
import { CloudinaryService } from '@app/modules/cloudinary/cloudinary.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserCredential } from 'firebase/auth';

@Injectable()
export class UserService {
    private adminAuth = admin.auth();
    private firestore = admin.firestore();
    private usersSocketIdMap = new Map<string, string>();

    constructor(private readonly cloudinaryService: CloudinaryService) {}

    addUserToMap(socketId: string, uid: string) {
        this.usersSocketIdMap.set(socketId, uid);
    }

    isUserInMap(socketId: string): boolean {
        return this.usersSocketIdMap.has(socketId);
    }

    getUserUidFromMap(socketId: string): string | undefined {
        return this.usersSocketIdMap.get(socketId);
    }

    removeUserFromMap(socketId: string) {
        this.usersSocketIdMap.delete(socketId);
    }

    // Sign up a new user and return user data with token
    async createUserInFirestore(uid: string, username: string, email: string): Promise<User> {
        // Check if the username or email already exists in Firestore
        const usernameExists = await this.isUsernameTaken(username);
        const { emailExists } = await this.isEmailTaken(email);
        if (usernameExists) throw new Error('Username is already taken.');
        if (emailExists) throw new Error('Email is already in use.');

        // Initialize additional user data
        const newUser: User = {
            ...emptyUser, // Start with all default properties from emptyUser
            uid,
            username,
            email,
            avatarEquipped: DEFAULT_AVATAR_URL,
            role: 'player',
        };

        // Save the user data in Firestore
        await this.firestore.collection('users').doc(uid).set(newUser);

        return newUser; // Return the created user object
    }

    async signInWithGoogle(uid: string, email: string, displayName: string): Promise<User> {
        try {
            const userDoc = await this.firestore.collection('users').doc(uid).get();

            if (userDoc.exists) {
                // User exists, update isOnline status and return the user
                return await this.getUserByUid(uid);
            } else {
                // User does not exist, create a new user in Firestore
                const username = displayName || 'New User'; // Use display name or fallback
                const newUser = await this.createUserInFirestore(uid, username, email);
                return newUser;
            }
        } catch (error) {
            throw new Error('Échec de la gestion de la connexion Google.');
        }
    }

    async isUsernameTaken(username: string): Promise<boolean> {
        const usersRef = this.firestore.collection('users');
        const querySnapshot = await usersRef.where('username', '==', username).get();
        return !querySnapshot.empty;
    }

    async isEmailTaken(email: string): Promise<{ emailExists: boolean; provider: string | null }> {
        try {
            // Check if the email exists in Firestore
            const usersRef = this.firestore.collection('users');
            const querySnapshot = await usersRef.where('email', '==', email).get();

            let provider: string | null = null;
            const user = await this.adminAuth.getUserByEmail(email);
            provider = user.providerData.length > 0 ? user.providerData[0].providerId : null;

            return { emailExists: !querySnapshot.empty, provider };
        } catch (error) {
            if ((error as { code: string }).code === 'auth/user-not-found') {
                return { emailExists: false, provider: null };
            }
            throw new Error("Échec de la vérification de la disponibilité de l'e-mail.");
        }
    }

    async logout(uid: string): Promise<void> {
        const userRef = this.firestore.collection('users').doc(uid);

        // Create a log entry for the disconnect action
        const logEntry = {
            timestamp: this.formatTimestamp(new Date()),
            action: 'disconnect',
        };

        // Use a transaction to ensure atomicity
        await this.firestore.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error("L'utilisateur n'existe pas.");
            }

            const updateData: any = {
                isOnline: false,
            };

            // Check if cxnLogs exists, if not initialize it
            if (!userDoc.data().cxnLogs) {
                updateData.cxnLogs = [logEntry]; // Initialize cxnLogs with the new log entry
            } else {
                updateData.cxnLogs = admin.firestore.FieldValue.arrayUnion(logEntry); // Add the log entry to cxnLogs
            }

            // Update the user's online status and log the disconnect
            transaction.update(userRef, updateData);
        });
    }

    async getUserByUid(uid: string): Promise<User> {
        const userRecord = await this.adminAuth.getUser(uid);
        const userDoc = await this.getUserFromFirestore(uid);
        await this.firestore.collection('users').doc(uid).update({ isOnline: true });
        return this.mapUserFromFirestore(userRecord, userDoc);
    }

    async getEmailByUsername(username: string): Promise<string> {
        try {
            // Reference to the 'users' collection
            const usersRef = this.firestore.collection('users');

            // Query Firestore for the document with the specified username
            const querySnapshot = await usersRef.where('username', '==', username).limit(1).get();

            // Check if a document is found
            if (querySnapshot.empty) {
                throw new Error(`Utilisateur avec le Pseudonyme "${username}" introuvable.`);
            }

            // Extract the email from the document
            const userDoc = querySnapshot.docs[0].data();
            return userDoc.email;
        } catch (error) {
            throw new Error('Email/Pseudonyme ou mot de passe invalide.');
        }
    }

    async isUserOnline(email: string): Promise<boolean> {
        try {
            // Reference the `users` collection and query by email
            const usersRef = this.firestore.collection('users');
            const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

            if (querySnapshot.empty) {
                return false; // User not found, return false
            }

            // Extract the `isOnline` field from the user document
            const userDoc = querySnapshot.docs[0].data();
            return userDoc.isOnline || false; // Return true/false based on the `isOnline` field
        } catch (error) {
            throw new Error("Échec de la vérification du statut en ligne de l'utilisateur.");
        }
    }

    async updateUserCoins(uid: string, bet: number): Promise<boolean> {
        const userRef = await this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }

        const currentCoins = userDoc.data().coins || 0;
        const newCoins = currentCoins + bet;
        if (newCoins < 0) {
            return false;
        } else {
            await userRef.update({ coins: newCoins });
            return true;
        }
    }

    async updatePity(uid: string, pity: number): Promise<boolean> {
        const userRef = await this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }

        if (pity < 0 || pity > 100) {
            return false;
        } else {
            await userRef.update({ pity: pity });
            return true;
        }
    }

    async updateNextDailyFree(uid: string) {
        const userRef = await this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }

        const currentTimestamp = new Date();
        if (!userDoc.data().nextDailyFree) {
            await userRef.update({ nextDailyFree: currentTimestamp });
            return true;
        }
        if (currentTimestamp > userDoc.data().nextDailyFree.toDate()) {
            currentTimestamp.setDate(currentTimestamp.getDate() + 1);
            await userRef.update({ nextDailyFree: currentTimestamp });
            return true;
        } else {
            return false;
        }
    }

    async canClaimDailyFreeUser(uid: string) {
        const userRef = await this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }
        const currentTimestamp = new Date();
        if (!userDoc.data().nextDailyFree) {
            await userRef.update({ nextDailyFree: currentTimestamp });
            return true;
        }

        if (currentTimestamp > userDoc.data().nextDailyFree.toDate()) {
            return true;
        } else {
            return false;
        }
    }

    async equipTheme(uid: string, theme: string): Promise<boolean> {
        const userRef = await this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }
        const themes = userDoc.data().inventory?.themes || [];
        if (themes.includes(theme) || theme === 'dark' || theme === 'light') {
            //considers default themes.
            await userRef.update({ 'config.themeEquipped': theme });
            return true;
        }
        return false;
    }

    private async deleteOldUploadedAvatar(currentAvatarUrl: string, avatars: string[]): Promise<void> {
        if (
            currentAvatarUrl &&
            currentAvatarUrl !== DEFAULT_AVATAR_URL &&
            !avatars.includes(currentAvatarUrl) &&
            !DEFAULT_AVATARS.includes(currentAvatarUrl)
        ) {
            try {
                await this.cloudinaryService.deleteImage(currentAvatarUrl);
            } catch (error) {
                console.error('Failed to delete old avatar:', error);
            }
        }
    }

    async equipAvatar(uid: string, avatarURL: string): Promise<boolean> {
        const userRef = await this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }
        const userData = userDoc.data();
        const avatars = userData.inventory?.avatars || [];
        const currentAvatarUrl = userData.avatarEquipped;
        // default avatar so it doesn't change/show errors.
        avatars.push('https://res.cloudinary.com/dtu6fkkm9/image/upload/v1737478954/default-avatar_qcaycl.jpg');

        const canEquipAvatar = avatars.includes(avatarURL) || DEFAULT_AVATARS.includes(avatarURL);
        if (canEquipAvatar) {
            await userRef.update({ avatarEquipped: avatarURL });
            await this.deleteOldUploadedAvatar(currentAvatarUrl, avatars);
        }

        return canEquipAvatar;
    }

    async equipBanner(uid: string, bannerURL: string): Promise<boolean> {
        const userRef = await this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }
        const banners = userDoc.data().inventory?.banners || [];

        if (banners.includes(bannerURL)) {
            await userRef.update({ borderEquipped: bannerURL });
            return true;
        } else if (bannerURL === '') {
            return true;
        }
        return false;
    }

    async addToInventory(uid: string, category: string, rewardLink: string | number) {
        const userRef = await this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }
        const themes = userDoc.data().inventory?.themes || [];
        const banners = userDoc.data().inventory?.banners || [];
        const avatars = userDoc.data().inventory?.avatars || [];
        if (category === 'avatar' && !avatars.includes(rewardLink)) {
            await userRef.update({
                'inventory.avatars': admin.firestore.FieldValue.arrayUnion(rewardLink),
            });
            return true;
        } else if (category === 'banner' && !banners.includes(rewardLink)) {
            await userRef.update({
                'inventory.banners': admin.firestore.FieldValue.arrayUnion(rewardLink),
            });
            return true;
        } else if (category === 'theme' && !themes.includes(rewardLink)) {
            await userRef.update({
                'inventory.themes': admin.firestore.FieldValue.arrayUnion(rewardLink),
            });
            return true;
        }
        return false;
    }

    private async getUserFromFirestore(uid: string): Promise<admin.firestore.DocumentData> {
        const userDoc = await this.firestore.collection('users').doc(uid).get();
        if (!userDoc.exists) throw new UnauthorizedException("L'utilisateur n'existe pas.");
        return userDoc.data();
    }

    // eslint-disable-next-line complexity
    private mapUserFromFirestore(userRecord: UserCredential['user'] | admin.auth.UserRecord, userDoc: admin.firestore.DocumentData): User {
        const isAdminUserRecord = (user: unknown): user is admin.auth.UserRecord => {
            return typeof user === 'object' && user !== null && 'uid' in user && 'displayName' in user;
        };

        return {
            uid: userRecord.uid,
            username: isAdminUserRecord(userRecord) ? userRecord.displayName || '' : userRecord.displayName || '',
            email: isAdminUserRecord(userRecord) ? userRecord.email || '' : userRecord.email || '',
            role: userDoc.role || 'player',
            friends: userDoc.friends || [],
            friendRequests: userDoc.friendRequests || [],
            avatarEquipped: userDoc.avatarEquipped || null,
            borderEquipped: userDoc.borderEquipped || null,
            config: userDoc.config || {
                themeEquipped: 'default',
                languageEquipped: 'en',
            },
            nbReport: userDoc.nbReport || 0,
            nbBan: userDoc.nbBan || 0,
            unBanDate: userDoc.unBanDate || null,
            inventory: userDoc.inventory || { banners: [], themes: [], avatars: [] },
            joinedChannels: userDoc.joinedChannels || [],
            coins: userDoc.coins || 0,
            cxnLogs: userDoc.cxnLogs || [],
            playedGameLogs: userDoc.playedGameLogs || [],
            stats: userDoc.stats || {
                nQuestions: 0,
                nGoodAnswers: 0,
                rightAnswerPercentage: 0,
                timeSpent: 0,
            },
            nWins: userDoc.nWins || 0,
            nGames: userDoc.nGames || 0,
            isOnline: true,
            pity: userDoc.pity || 0,
            nextDailyFree: userDoc.nextDailyFree || new Date(),
        };
    }

    async updateUserAvatar(uid: string, avatarUrl: string): Promise<void> {
        const userRef = this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new UnauthorizedException("L'utilisateur n'existe pas.");
        }

        // Get the current avatar URL before updating
        const userData = userDoc.data();
        const currentAvatarUrl = userData.avatarEquipped;
        const avatars = userData.inventory?.avatars || [];

        await userRef.update({ avatarEquipped: avatarUrl });
        await this.deleteOldUploadedAvatar(currentAvatarUrl, avatars);
    }

    async updateUsername(uid: string, newUsername: string): Promise<User> {
        const usernameExists = await this.isUsernameTaken(newUsername);
        if (usernameExists) {
            throw new Error('Ce pseudonyme est déjà pris');
        }

        // Update the username in Firestore
        const userRef = this.firestore.collection('users').doc(uid);
        await userRef.update({ username: newUsername });

        return await this.getUserByUid(uid);
    }

    async incrementGames(uid: string): Promise<void> {
        const userRef = await this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }

        const currentGames = userDoc.data().nGames || 0;
        await userRef.update({ nGames: currentGames + 1 });
    }

    async incrementWins(uid: string): Promise<void> {
        const userRef = this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }
        const currentWins = userDoc.data().nWins || 0;
        await userRef.update({ nWins: currentWins + 1 });
    }

    async updateStats(uid: string, newStats: { nQuestions?: number; nGoodAnswers?: number; timeSpent?: number }): Promise<void> {
        const userRef = this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }

        const currentStats = userDoc.data().stats || {
            nQuestions: 0,
            nGoodAnswers: 0,
            rightAnswerPercentage: 0,
            timeSpent: 0,
        };

        const updatedStats = {
            nQuestions: (currentStats.nQuestions || 0) + (newStats.nQuestions || 0),
            nGoodAnswers: (currentStats.nGoodAnswers || 0) + (newStats.nGoodAnswers || 0),
            timeSpent: (currentStats.timeSpent || 0) + (newStats.timeSpent || 0),
        };

        // Calculate the new percentage
        updatedStats['rightAnswerPercentage'] = updatedStats.nQuestions > 0 ? (updatedStats.nGoodAnswers / updatedStats.nQuestions) * 100 : 0;

        await userRef.update({ stats: updatedStats });
    }

    async addConnectionLog(uid: string, logEntry: { timestamp: number; action: 'connect' | 'disconnect'; deviceInfo?: string; ipAddress?: string }) {
        const userRef = await this.firestore.collection('users').doc(uid);
        await userRef.update({
            cxnLogs: admin.firestore.FieldValue.arrayUnion(logEntry),
        });
    }

    async getConnectionLogs(uid: string): Promise<{ timestamp: string; action: 'connect' | 'disconnect' }[]> {
        const userRef = this.firestore.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error("L'utilisateur n'existe pas.");
        }

        const cxnLogs = userDoc.data().cxnLogs || [];
        return cxnLogs.map((log) => ({
            timestamp: log.timestamp, // Assuming timestamp is already formatted
            action: log.action,
        }));
    }

    async addGameLog(
        uid: string,
        gameLog: {
            gameName?: string;
            startTime?: string;
            endTime?: string;
            status?: 'complete' | 'abandoned';
            result?: 'win' | 'lose';
        },
    ): Promise<boolean> {
        try {
            const userRef = this.firestore.collection('users').doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                throw new Error("L'utilisateur n'existe pas.");
            }

            // Add the new game log to the user's gameLogs array
            await userRef.update({
                gameLogs: admin.firestore.FieldValue.arrayUnion(gameLog),
            });

            return true;
        } catch (error) {
            console.error('Failed to add game log:', error);
            return false;
        }
    }

    async updateGameLog(
        uid: string,
        updatedGameLog: {
            gameName?: string;
            startTime?: string;
            endTime?: string;
            status?: 'complete' | 'abandoned';
            result?: 'win' | 'lose';
        },
    ): Promise<boolean> {
        try {
            const userRef = this.firestore.collection('users').doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                throw new Error("L'utilisateur n'existe pas.");
            }

            const gameLogs = userDoc.data().gameLogs || [];

            if (gameLogs.length === 0) {
                throw new Error('No game logs found.');
            }

            // Always update the last game log
            const lastIndex = gameLogs.length - 1;
            gameLogs[lastIndex] = {
                ...gameLogs[lastIndex],
                ...updatedGameLog,
            };

            await userRef.update({ gameLogs });

            return true;
        } catch (error) {
            console.error('Failed to update game log:', error);
            return false;
        }
    }

    formatTimestamp(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1); // Months are zero-based
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
}
