import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PublishedPoll } from '@app/interfaces/poll';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observable, catchError, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HistoryPublishedPollService {
    readonly baseUrl = `${environment.serverUrl}/published-polls`;
    constructor(
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
    ) {}

    getAllPublishedPolls(): Observable<PublishedPoll[]> {
        return this.http.get<PublishedPoll[]>(this.baseUrl).pipe(
            map((publishedPolls) => {
                return publishedPolls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    getPublishedPollById(id: string): Observable<PublishedPoll> {
        return this.http.get<PublishedPoll>(`${this.baseUrl}/${id}`).pipe(
            map((publishedPolls) => {
                return publishedPolls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }
}
