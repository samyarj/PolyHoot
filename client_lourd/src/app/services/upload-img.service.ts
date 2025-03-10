import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from './auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class UploadImgService {
    private uploadUrl = 'http://localhost:3000/api/upload-img';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
    ) {}

    uploadImage(file: File): Observable<any> {
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

                return this.http.post(this.uploadUrl, formData, { headers });
            }),
        );
    }
}
