import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CoinTransferService {
    private readonly apiUrl = `${environment.serverUrl}/coin-transfer`;

    constructor(private http: HttpClient) {}

    transferCoins(senderId: string, recipientId: string, amount: number): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}`, {
            senderId,
            recipientId,
            amount,
        });
    }
}
