import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Poll, PublishedPoll } from '@app/interfaces/poll';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ConsultPollService {
    readonly baseUrl = `${environment.serverUrl}/polls`;
    constructor(
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
    ) {}

    getAllPolls(): Observable<{ polls: Poll[]; publishedPolls: PublishedPoll[] }> {
        return this.http.get<{ polls: Poll[]; publishedPolls: PublishedPoll[] }>(this.baseUrl).pipe(
            catchError((error) => {
                return this.messageHandler.handleHttpError(error);
            }),
        );
    }

    getPollById(id: string): Observable<Poll> {
        return this.http.get<Poll>(`${this.baseUrl}/${id}`).pipe(
            tap((poll) => console.log('📡 Récupération du sondage avec ID:', id, poll)),
            catchError((error) => {
                console.error(`❌ Erreur lors de la récupération du sondage ${id}:`, error);
                return this.messageHandler.handleHttpError(error);
            }),
        );
    }

    deletePollById(id: string): Observable<Poll[]> {
        return this.http.delete<Poll[]>(`${this.baseUrl}/delete/${id}`).pipe(
            tap((polls) => console.log(`🗑️ Sondage ${id} supprimé, nouvelle liste:`, polls)),
            catchError((error) => {
                console.error(`❌ Erreur lors de la suppression du sondage ${id}:`, error);
                return this.messageHandler.handleHttpError(error);
            }),
        );
    }
    publishPoll(poll: Poll): Observable<{ polls: Poll[]; publishedPolls: PublishedPoll[] }> {
        return this.http.patch<{ polls: Poll[]; publishedPolls: PublishedPoll[] }>(`${this.baseUrl}/publish`, poll).pipe(
            catchError((error) => {
                console.error('❌ Erreur lors de la publication du sondage', error);
                return this.messageHandler.handleHttpError(error);
            }),
        );
    }
    expirePublishedPoll(poll: Poll): Observable<PublishedPoll> {
        console.log('Envoie au serveur cet id à expirer ', poll.id);
        return this.http.patch<PublishedPoll>(`${environment.serverUrl}/published-polls/expire/${poll.id}`, {}).pipe(
            catchError((error) => {
                console.error('❌ Erreur lors de la publication du sondage', error);
                return this.messageHandler.handleHttpError(error);
            }),
        );
    }
}
