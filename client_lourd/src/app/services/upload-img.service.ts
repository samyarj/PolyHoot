import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
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

    uploadImage(file: File, context: 'avatar' | 'question'): Observable<{ message: string; imageUrl: string }> {
        const formData = new FormData();
        formData.append('image', file);

        // Ajoutez le contexte comme paramètre de requête
        const urlWithContext = `${this.baseUrl}?context=${context}`;

        return this.authService.token$.pipe(
            switchMap((token) => {
                if (!token) {
                    // throw new Error('Authentication token is missing. Please log in.');
                    return of({ message: '', imageUrl: '' });
                }

                const headers = new HttpHeaders({
                    authorization: `Bearer ${token}`,
                });
                return this.http.post<{ message: string; imageUrl: string }>(urlWithContext, formData, { headers });
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
    deleteImage(imageURL: string): Observable<{ message: string }> {
        return this.authService.token$.pipe(
            switchMap((token) => {
                if (!token) {
                    throw new Error('Authentication token is missing. Please log in.');
                }

                const headers = new HttpHeaders({
                    authorization: `Bearer ${token}`,
                });

                // Inclure l'URL de l'image comme paramètre de requête
                const urlWithQuery = `${this.baseUrl}/delete?imageUrl=${encodeURIComponent(imageURL)}`;
                return this.http.delete<{ message: string }>(urlWithQuery, { headers });
            }),
        );
    }
}
