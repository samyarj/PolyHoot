/* eslint-disable @typescript-eslint/member-ordering */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '@app/interfaces/user';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class FriendSystemService {
    private apiUrl = `${environment.serverUrl}/users`;
    private tokenId: string | null = null;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private firestore: Firestore,
    ) {
        this.authService.token$.subscribe((token) => {
            this.tokenId = token;
        });
    }

    private getAuthHeaders(): HttpHeaders {
        if (!this.tokenId) {
            throw new Error('Not authenticated');
        }
        return new HttpHeaders().set('Authorization', `Bearer ${this.tokenId}`);
    }

    private async getUserById(userId: string): Promise<(User & { id: string }) | null> {
        const userDoc = await getDocs(query(collection(this.firestore, 'users'), where('uid', '==', userId)));
        if (userDoc.empty) return null;
        const data = userDoc.docs[0].data() as User;
        return { ...data, id: userDoc.docs[0].id };
    }

    private async getUserByUsername(username: string): Promise<(User & { id: string }) | null> {
        const userDoc = await getDocs(query(collection(this.firestore, 'users'), where('username', '==', username)));
        if (userDoc.empty) return null;
        const data = userDoc.docs[0].data() as User;
        return { ...data, id: userDoc.docs[0].id };
    }

    async sendFriendRequest(userId: string, friendUsername: string): Promise<void> {
        const headers = this.getAuthHeaders();

        // Get current user's data
        const currentUser = await this.getUserById(userId);
        if (!currentUser) {
            throw new Error('Utilisateur non trouvé');
        }
        const currentUserRole = currentUser.role || 'player';

        // Get target friend's data
        const friendData = await this.getUserByUsername(friendUsername);
        if (!friendData) {
            throw new Error(`L'utilisateur avec le pseudonyme "${friendUsername}" n'existe pas`);
        }
        const friendRole = friendData.role || 'player';

        // Check if player is trying to add an admin
        if (currentUserRole === 'player' && friendRole === 'admin') {
            throw new Error("Vous ne pouvez pas envoyer de demande d'ami à un administrateur");
        }

        await firstValueFrom(this.http.post<void>(`${this.apiUrl}/${userId}/friend-request/${friendData.id}`, {}, { headers }));
    }

    async acceptFriendRequest(userId: string, friendId: string): Promise<void> {
        const headers = this.getAuthHeaders();

        try {
            // First, we update the local Firestore data immediately to eliminate the in-between state
            // This ensures the UI immediately reflects the changes before waiting for server response
            const userRef = doc(this.firestore, 'users', userId);
            const friendRef = doc(this.firestore, 'users', friendId);

            // Get current data
            const userDoc = await getDoc(userRef);
            const friendDoc = await getDoc(friendRef);

            if (userDoc.exists() && friendDoc.exists()) {
                const userData = userDoc.data();
                const friendData = friendDoc.data();

                // Update user's document to add friend to friends list
                // We don't remove from friendRequests yet to prevent the in-between state
                const userFriends = [...(userData.friends || [])];
                if (!userFriends.includes(friendId)) {
                    userFriends.push(friendId);
                    // Ensure the list is unique (no duplicates)
                    const uniqueUserFriends = [...new Set(userFriends)];
                    await updateDoc(userRef, { friends: uniqueUserFriends });
                }

                // Update friend's document to add user to their friends list
                // We don't remove from pending requests yet to prevent the in-between state
                const friendFriends = [...(friendData.friends || [])];
                if (!friendFriends.includes(userId)) {
                    friendFriends.push(userId);
                    // Ensure the list is unique (no duplicates)
                    const uniqueFriendFriends = [...new Set(friendFriends)];
                    await updateDoc(friendRef, { friends: uniqueFriendFriends });
                }
            }

            // Then send request to server to properly sync everything
            await firstValueFrom(this.http.post<void>(`${this.apiUrl}/${userId}/accept-friend/${friendId}`, {}, { headers }));
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw error;
        }
    }

    async removeFriend(userId: string, friendId: string): Promise<void> {
        const headers = this.getAuthHeaders();
        await firstValueFrom(this.http.post<void>(`${this.apiUrl}/${userId}/remove-friend/${friendId}`, {}, { headers }));
    }

    async cancelFriendRequest(userId: string, friendId: string): Promise<void> {
        const headers = this.getAuthHeaders();
        await firstValueFrom(this.http.post<void>(`${this.apiUrl}/${userId}/cancel-friend-request/${friendId}`, {}, { headers }));
    }

    async getFriends(userId: string): Promise<string[]> {
        const headers = this.getAuthHeaders();
        return firstValueFrom(this.http.get<string[]>(`${this.apiUrl}/${userId}/friends`, { headers }));
    }

    async getFriendRequests(userId: string): Promise<string[]> {
        const headers = this.getAuthHeaders();
        return firstValueFrom(this.http.get<string[]>(`${this.apiUrl}/${userId}/friend-requests`, { headers }));
    }

    searchUsers(
        searchTerm: string,
        currentUserId: string,
    ): Observable<{ id: string; username: string; avatarEquipped?: string; borderEquipped?: string }[]> {
        return new Observable((subscriber) => {
            if (!searchTerm.trim()) {
                subscriber.next([]);
                return;
            }

            let searchUnsubscribe: () => void;
            let pendingRequestsUnsubscribe: () => void;
            let friendsUnsubscribe: () => void;
            let sentRequestsUnsubscribe: () => void;

            (async () => {
                try {
                    const currentUser = await this.getUserById(currentUserId);
                    if (!currentUser) {
                        subscriber.next([]);
                        return;
                    }

                    const currentUserRole = currentUser.role || 'player';
                    let friendsList: string[] = [];
                    let pendingRequestsIds: string[] = [];
                    let sentRequestsIds: string[] = [];

                    // Get real-time updates for friends list
                    const currentUserRef = doc(this.firestore, 'users', currentUserId);
                    friendsUnsubscribe = onSnapshot(currentUserRef, (userDoc) => {
                        if (userDoc.exists()) {
                            friendsList = userDoc.data()['friends'] || [];
                            sentRequestsIds = userDoc.data()['pendingRequests'] || [];

                            // When friends or sent requests change, update search results
                            if (searchUnsubscribe) {
                                searchUnsubscribe();
                            }
                            performSearch();
                        }
                    });

                    // Get real-time updates for pending friend requests
                    const usersRef = collection(this.firestore, 'users');
                    const pendingRequestsQuery = query(usersRef, where('friendRequests', 'array-contains', currentUserId));

                    pendingRequestsUnsubscribe = onSnapshot(pendingRequestsQuery, (pendingSnapshot) => {
                        pendingRequestsIds = pendingSnapshot.docs.map((doc) => doc.id);

                        // When pending requests change, update search results
                        if (searchUnsubscribe) {
                            searchUnsubscribe();
                        }
                        performSearch();
                    });

                    // Function to perform the actual search with the latest friend data
                    const performSearch = () => {
                        const searchQuery = query(usersRef, where('username', '>=', searchTerm), where('username', '<=', searchTerm + '\uf8ff'));

                        searchUnsubscribe = onSnapshot(
                            searchQuery,
                            (querySnapshot) => {
                                const results = querySnapshot.docs
                                    .map((docSnap) => ({
                                        id: docSnap.id,
                                        username: docSnap.data()['username'],
                                        role: docSnap.data()['role'] || 'player',
                                        avatarEquipped: docSnap.data()['avatarEquipped'] || '',
                                        borderEquipped: docSnap.data()['borderEquipped'] || '',
                                    }))
                                    .filter(
                                        (user) =>
                                            user.id !== currentUserId && // Exclude current user
                                            !friendsList.includes(user.id) && // Exclude friends
                                            !pendingRequestsIds.includes(user.id) && // Exclude users with pending requests
                                            !sentRequestsIds.includes(user.id) && // Exclude users to whom requests have been sent
                                            !(currentUserRole === 'player' && user.role === 'admin'), // Exclude admins if current user is player
                                    )
                                    .map(({ id, username, avatarEquipped, borderEquipped }) => ({
                                        id,
                                        username,
                                        avatarEquipped,
                                        borderEquipped,
                                    }));

                                subscriber.next(results);
                            },
                            (error) => {
                                console.error('Error searching users:', error);
                                subscriber.error(error);
                            },
                        );
                    };

                    // Initial search
                    performSearch();
                } catch (error) {
                    console.error('Error in searchUsers:', error);
                    subscriber.error(error);
                }
            })();

            // Return cleanup function
            return () => {
                if (searchUnsubscribe) {
                    searchUnsubscribe();
                }
                if (pendingRequestsUnsubscribe) {
                    pendingRequestsUnsubscribe();
                }
                if (friendsUnsubscribe) {
                    friendsUnsubscribe();
                }
                if (sentRequestsUnsubscribe) {
                    sentRequestsUnsubscribe();
                }
            };
        });
    }
}
