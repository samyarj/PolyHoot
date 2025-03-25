import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
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
        await firstValueFrom(this.http.post<void>(`${this.apiUrl}/${userId}/accept-friend/${friendId}`, {}, { headers }));
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

            (async () => {
                try {
                    const currentUser = await this.getUserById(currentUserId);
                    if (!currentUser) {
                        subscriber.next([]);
                        return;
                    }

                    const currentUserRole = currentUser.role || 'player';
                    const friendsList = currentUser.friends || [];
                    let pendingRequestsIds: string[] = [];

                    // Get real-time updates for pending friend requests
                    const usersRef = collection(this.firestore, 'users');
                    const pendingRequestsQuery = query(usersRef, where('friendRequests', 'array-contains', currentUserId));

                    pendingRequestsUnsubscribe = onSnapshot(pendingRequestsQuery, (pendingSnapshot) => {
                        pendingRequestsIds = pendingSnapshot.docs.map((doc) => doc.id);

                        // Set up or update the search query with the new pending requests
                        const searchQuery = query(usersRef, where('username', '>=', searchTerm), where('username', '<=', searchTerm + '\uf8ff'));

                        if (searchUnsubscribe) {
                            searchUnsubscribe();
                        }

                        searchUnsubscribe = onSnapshot(
                            searchQuery,
                            (querySnapshot) => {
                                const results = querySnapshot.docs
                                    .map((doc) => ({
                                        id: doc.id,
                                        username: doc.data()['username'],
                                        role: doc.data()['role'] || 'player',
                                        avatarEquipped: doc.data()['avatarEquipped'] || '',
                                        borderEquipped: doc.data()['borderEquipped'] || '',
                                    }))
                                    .filter(
                                        (user) =>
                                            user.id !== currentUserId && // Exclude current user
                                            !friendsList.includes(user.id) && // Exclude friends
                                            !pendingRequestsIds.includes(user.id) && // Exclude users with pending requests
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
                    });
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
            };
        });
    }
}
