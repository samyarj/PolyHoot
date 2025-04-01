import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { Poll, PublishedPoll } from '@app/interfaces/poll';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ConsultPollService {
    private readonly baseUrl = `${environment.serverUrl}/polls`;

    constructor(
        private http: HttpClient,
        private firestore: Firestore,
        private messageHandler: MessageHandlerService,
    ) {}

    // Surveiller les changements dans les sondages
    watchPolls(): Observable<Poll[]> {
        return new Observable((subscriber) => {
            const pollsCollection = collection(this.firestore, 'polls');
            const unsubscribe = onSnapshot(pollsCollection, (snapshot) => {
                const polls: Poll[] = [];
                snapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data() as Poll;
                    polls.push({ ...data, id: docSnapshot.id });
                });
                subscriber.next(polls);
            });

            // Retourne la fonction de nettoyage
            return () => unsubscribe();
        });
    }

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

    // Supprimer un sondage
    deletePollById(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
            catchError((error) => {
                console.error(`❌ Erreur lors de la suppression du sondage ${id}:`, error);
                return this.messageHandler.handleHttpError(error);
            }),
        );
    }

    // Publier un sondage
    publishPoll(poll: Poll): Observable<{ polls: Poll[]; publishedPolls: PublishedPoll[] }> {
        console.log('va publish normalement');
        return this.http.patch<{ polls: Poll[]; publishedPolls: PublishedPoll[] }>(`${this.baseUrl}/publish`, poll).pipe(
            catchError((error) => {
                console.error('❌ Erreur lors de la publication du sondage', error);
                return this.messageHandler.handleHttpError(error);
            }),
        );
    }
}
