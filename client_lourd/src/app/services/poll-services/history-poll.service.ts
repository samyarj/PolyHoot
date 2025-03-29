import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { PublishedPoll } from '@app/interfaces/poll';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HistoryPublishedPollService {
    readonly baseUrl = `${environment.serverUrl}/published-polls`;
    constructor(
        private firestore: Firestore,
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
    ) {}
    // Surveiller les changements dans les sondages publiés
    watchPublishedPolls(): Observable<PublishedPoll[]> {
        return new Observable((subscriber) => {
            const publishedPollsCollection = collection(this.firestore, 'publishedPolls');
            const unsubscribe = onSnapshot(publishedPollsCollection, (snapshot) => {
                const publishedPolls: PublishedPoll[] = [];
                snapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data() as PublishedPoll;
                    publishedPolls.push({ ...data, id: docSnapshot.id });
                });
                subscriber.next(publishedPolls);
            });

            // Retourne la fonction de nettoyage
            return () => unsubscribe();
        });
    }
    deleteAllExpiredPolls() {
        return this.http.delete<PublishedPoll[]>(`${this.baseUrl}/delete`).pipe(catchError(this.messageHandler.handleHttpError));
    }

    getPublishedPollById(id: string): Observable<PublishedPoll> {
        return this.http.get<PublishedPoll>(`${this.baseUrl}/${id}`).pipe(
            catchError((error) => {
                return this.messageHandler.handleHttpError(error);
            }),
        );
    }
}
