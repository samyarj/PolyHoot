import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LootBoxContainer, Reward } from '@app/interfaces/lootbox-related';
import { User } from '@app/interfaces/user';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { catchError, Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LootBoxService {
    readonly baseUrl = `${environment.serverUrl}/loot`;
    tokenID: string | null = '';
    user: User | null = null;
    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
    ) {
        this.authService.token$.subscribe((token: string | null) => {
            this.tokenID = token;
        });
        this.authService.user$.subscribe({
            next: (user: User | null) => {
                this.user = user;
            },
        });
    }

    openBox(id: number): Observable<Reward> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .post<Reward>(`${this.baseUrl}/lootBox`, { id }, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }

    getBoxes(): Observable<LootBoxContainer[]> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .get<LootBoxContainer[]>(`${this.baseUrl}/lootBox`, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }

    openDailyFree(): Observable<Reward> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .post<Reward>(`${this.baseUrl}/dailyFree`, {}, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }

    getDailyFree(): Observable<{ lootbox: LootBoxContainer; canClaim: boolean; nextDailyFreeDate: Date }> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .get<{ lootbox: LootBoxContainer; canClaim: boolean; nextDailyFreeDate: Date }>(`${this.baseUrl}/dailyFree`, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }
}
