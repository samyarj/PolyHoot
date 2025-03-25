import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firestore, collection, onSnapshot, query, where } from '@angular/fire/firestore';
import { User } from '@app/interfaces/user';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private readonly apiUrl = `${environment.serverUrl}/users`;
    private readonly reportUrl = `${environment.serverUrl}/report`;

    constructor(
        private http: HttpClient,
        private firestore: Firestore,
    ) {}

    getAllPlayers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/players`);
    }

    getPlayersRealtime(callback: (players: User[]) => void): () => void {
        const usersRef = collection(this.firestore, 'users');
        const playersQuery = query(usersRef, where('role', '==', 'player'));

        const unsubscribe = onSnapshot(
            playersQuery,
            (snapshot) => {
                const players: User[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    players.push({
                        uid: doc.id,
                        username: data['username'],
                        email: data['email'],
                        role: data['role'],
                        avatarEquipped: data['avatarEquipped'],
                        borderEquipped: data['borderEquipped'],
                        isOnline: data['isOnline'],
                        coins: data['coins'],
                        nWins: data['nWins'],
                        nGames: data['nGames'],
                        nbReport: data['nbReport'],
                        nbBan: data['nbBan'],
                        unBanDate: data['unBanDate'],
                        stats: data['stats'],
                        inventory: data['inventory'],
                        config: data['config'],
                        joinedChannels: data['joinedChannels'],
                        cxnLogs: data['cxnLogs'],
                        gameLogs: data['gameLogs'],
                        playedGameLogs: data['playedGameLogs'],
                        playerReports: data['playerReports'],
                        friendRequests: data['friendRequests'],
                        friends: data['friends'],
                        pity: data['pity'],
                        nextDailyFree: data['nextDailyFree'],
                    } as User);
                });

                callback(players);
            },
            (error) => {
                console.error('Error getting real-time players:', error);
            },
        );

        return unsubscribe;
    }

    adminBanPlayer(playerId: string): Observable<void> {
        return this.http.post<void>(`${this.reportUrl}/ban-player`, { playerId });
    }
}
