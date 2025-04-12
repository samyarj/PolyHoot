import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { ThemeService } from '@app/services/ui-services/theme/theme.service';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageHandlerService } from './error-handler/message-handler.service';

@Injectable({
    providedIn: 'root',
})
export class InventoryService {
    tokenID: string | null = '';
    inventory: { avatars: string[]; banners: string[]; themes: string[] } = { avatars: [], banners: [], themes: [] };
    readonly baseUrl = `${environment.serverUrl}/inventory`;
    equippedAvatar: string = '';
    equippedBorder: string = '';
    constructor(
        private themeService: ThemeService,
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
        private authService: AuthService,
    ) {
        this.authService.token$.subscribe((token: string | null) => {
            this.tokenID = token;
        });
        this.authService.user$.subscribe({
            next: (user: User | null) => {
                if (user?.inventory) {
                    if (user?.inventory.avatars) {
                        this.inventory.avatars = user?.inventory.avatars;
                    }
                    if (user?.inventory.banners) {
                        this.inventory.banners = user?.inventory.banners;
                    }
                    if (user?.inventory.themes) {
                        this.inventory.themes = user?.inventory.themes;
                    }
                }
                if (user?.avatarEquipped) {
                    this.equippedAvatar = user.avatarEquipped;
                }
                if (user?.borderEquipped || user?.borderEquipped === '') {
                    this.equippedBorder = user.borderEquipped;
                }
            },
        });
    }

    get themes() {
        return this.themeService.themes;
    }

    get banners() {
        return this.inventory.banners;
    }

    get avatars() {
        return this.inventory.avatars;
    }

    setAvatar(avatarURL: string): Observable<boolean> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .post<boolean>(`${this.baseUrl}/avatar`, { avatarURL }, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }

    setBanner(bannerURL: string): Observable<boolean> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .post<boolean>(`${this.baseUrl}/banner`, { bannerURL }, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }

    setTheme(theme: string): Observable<boolean> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .post<boolean>(`${this.baseUrl}/theme`, { theme }, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }
}
