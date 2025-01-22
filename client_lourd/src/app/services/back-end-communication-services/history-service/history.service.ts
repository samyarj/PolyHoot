import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observable, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    readonly baseUrl = `${environment.serverUrl}/history`;

    constructor(
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
    ) {}

    getAllGamesRecords(): Observable<Game[]> {
        return this.http.get<Game[]>(`${this.baseUrl}/games`).pipe(catchError(this.messageHandler.handleHttpError));
    }

    cleanHistory(): Observable<Game[]> {
        return this.http.delete<Game[]>(`${this.baseUrl}/clean`).pipe(catchError(this.messageHandler.handleHttpError));
    }
}
