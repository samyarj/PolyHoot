import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

    private async getUserIdByUsername(username: string): Promise<string> {
        const headers = this.getAuthHeaders();
        const response = await firstValueFrom(this.http.get<{ uid: string }>(`${this.apiUrl}/by-username/${username}`, { headers }));
        return response.uid;
    }

    async sendFriendRequest(userId: string, friendUsername: string): Promise<void> {
        const headers = this.getAuthHeaders();
        const friendId = await this.getUserIdByUsername(friendUsername);
        await firstValueFrom(this.http.post<void>(`${this.apiUrl}/${userId}/friend-request/${friendId}`, {}, { headers }));
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

    // ...other methods...
}
