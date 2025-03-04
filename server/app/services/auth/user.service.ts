import { DEFAULT_AVATAR_URL, emptyUser } from '@app/constants';
import { User } from '@app/interface/user';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserCredential } from 'firebase/auth';

@Injectable()
export class UserService {
    private adminAuth = admin.auth();
    private firestore = admin.firestore();
    private mobileClientMap = new Map<string, string>();

    addMobileClientToMap(socketClientId: string, uid: string) {
        this.mobileClientMap.set(socketClientId, uid);
    }

    isMobileClient(socketClientId: string): boolean {
        return this.mobileClientMap.has(socketClientId);
    }

    getMobileClientUid(socketClientId: string): string | undefined {
        return this.mobileClientMap.get(socketClientId);
    }

    removeMobileClientFromMap(socketClientId: string) {
        this.mobileClientMap.delete(socketClientId);
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
            throw new Error('Échec de la vérification de la disponibilité de l’e-mail.');
        }
    }

    async logout(uid: string): Promise<void> {
        await this.firestore.collection('users').doc(uid).update({ isOnline: false });
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
            throw new Error('Échec de la vérification du statut en ligne de l’utilisateur.');
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
            nWins: userDoc.nWins || 0,
            isOnline: true,
            pity: userDoc.pity || 0,
        };
    }
}
