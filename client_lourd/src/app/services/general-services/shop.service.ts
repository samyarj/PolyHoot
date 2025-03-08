import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ShopItem } from '@app/interfaces/shop-item';
import { AuthService } from '@app/services/auth/auth.service';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageHandlerService } from './error-handler/message-handler.service';

@Injectable({
    providedIn: 'root',
})
export class ShopService {
    readonly baseUrl = `${environment.serverUrl}/shop`;
    tokenID: string | null = null;
    shop: {
        avatars: ShopItem[];
        banners: ShopItem[];
        themes: ShopItem[];
    } = {
        avatars: [],
        banners: [],
        themes: [],
    };
    constructor(
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
        private authService: AuthService,
    ) {
        this.authService.token$.subscribe((token: string | null) => {
            this.tokenID = token;
        });
        this.authService.user$.subscribe({
            next: () => {
                this.getShop();
            },
        });
    }

    get themes() {
        return this.shop.themes;
    }

    get banners() {
        return this.shop.banners;
    }

    get avatars() {
        return this.shop.avatars;
    }

    getShop() {
        this.fetchShop().subscribe({
            next: (shop) => {
                this.shop = shop;
            },
        });
    }
    fetchShop(): Observable<{
        avatars: ShopItem[];
        banners: ShopItem[];
        themes: ShopItem[];
    }> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .get<{
                avatars: ShopItem[];
                banners: ShopItem[];
                themes: ShopItem[];
            }>(`${this.baseUrl}/shop`, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }

    buyItem(type: string, itemURL: string): Observable<boolean> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .post<boolean>(`${this.baseUrl}/shop`, { type, itemURL }, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }
}
