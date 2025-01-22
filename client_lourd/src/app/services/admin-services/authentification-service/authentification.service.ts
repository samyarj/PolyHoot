import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthentificationService {
    isAuthorized: boolean = false;

    private readonly baseUrl = `${environment.serverUrl}/validate-password`;

    constructor(private http: HttpClient) {}

    verifyPassword(password: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}`, { password });
    }

    getStatus() {
        return true;
    }

    authorize() {
        this.isAuthorized = true;
    }

    unauthorize() {
        this.isAuthorized = false;
    }
}
