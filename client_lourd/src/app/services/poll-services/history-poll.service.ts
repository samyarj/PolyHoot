import { Injectable } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { PublishedPoll } from '@app/interfaces/poll';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HistoryPublishedPollService {
    readonly baseUrl = `${environment.serverUrl}/published-polls`;
    constructor(private firestore: Firestore) {}
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
}
