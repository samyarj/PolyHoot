import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Poll } from '@app/interfaces/poll';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observable, catchError, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PollService {
    readonly baseUrl = `${environment.serverUrl}/polls`;

    constructor(
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
    ) {}

    getAllPolls(): Observable<Poll[]> {
        return this.http.get<Poll[]>(this.baseUrl).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    getPollById(id: string): Observable<Poll> {
        return this.http.get<Poll>(`${this.baseUrl}/${id}`).pipe(
            map((poll) => {
                return poll;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    createPoll(pollData: unknown): Observable<Poll[]> {
        return this.http.post<Poll[]>(`${this.baseUrl}/create`, pollData).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    updatePoll(id: string, pollData: unknown): Observable<Poll[]> {
        return this.http.patch<Poll[]>(`${this.baseUrl}/update/${id}`, pollData).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    togglePollVisibility(id: string): Observable<Poll[]> {
        return this.http.patch<Poll[]>(`${this.baseUrl}/toggle-visibility/${id}`, {}).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    deletePollById(id: string): Observable<Poll[]> {
        return this.http.delete<Poll[]>(`${this.baseUrl}/delete/${id}`).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }
}
