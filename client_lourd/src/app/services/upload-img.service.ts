import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class UploadImgService {
    private baseUrl = `${environment.serverUrl}/upload-img`;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
    ) {}

    uploadImage(file: File): Observable<{ message: string; avatarUrl: string }> {
        const formData = new FormData();
        formData.append('image', file);

        return this.authService.token$.pipe(
            switchMap((token) => {
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in.');
                }

                const headers = new HttpHeaders({
                    authorization: `Bearer ${token}`,
                });

                return this.http.post<{ message: string; avatarUrl: string }>(this.baseUrl, formData, { headers });
            }),
        );
    }
    getDefaultAvatars(): Observable<{ avatars: string[] }> {
        return this.http.get<{ avatars: string[] }>(`${this.baseUrl}/default-avatars`);
    }

    updateSelectedDefaultAvatar(avatarUrl: string): Observable<{ message: string }> {
        return this.authService.token$.pipe(
            switchMap((token) => {
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in.');
                }

                const headers = new HttpHeaders({
                    authorization: `Bearer ${token}`,
                });

                return this.http.post<{ message: string }>(`${environment.serverUrl}/users/update-avatar`, { avatarUrl }, { headers });
            }),
        );
    }
}
