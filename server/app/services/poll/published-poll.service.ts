/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { ERROR } from '@app/constants/error-messages';
import { PublishedPoll } from '@app/model/schema/poll/published-poll.schema';
import { PushNotifService } from '@app/services/push-notif/push-notif.service';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PublishedPollService implements OnModuleInit {
    private firestore = admin.firestore();

    constructor(private readonly pushNotifService: PushNotifService) { }

    async createPublishedPoll(poll: PublishedPoll): Promise<PublishedPoll> {
        const pollRef = this.firestore.collection('publishedPolls').doc(poll.id);
        await pollRef.set(poll);
        await this.pushNotifService.onNewPublishedPoll(poll.title);
        return poll;
    }

    async getAllPublishedPolls(): Promise<PublishedPoll[]> {
        const snapshot = await this.firestore.collection('publishedPolls').get();
        return snapshot.docs.map((doc) => doc.data() as PublishedPoll);
    }

    async getPublishedPollById(id: string): Promise<PublishedPoll> {
        const pollRef = this.firestore.collection('publishedPolls').doc(id);
        const pollDoc = await pollRef.get();

        if (!pollDoc.exists) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }

        const pollData = pollDoc.data() as PublishedPoll;
        return pollData;
    }

    async deleteExpiredPolls(): Promise<void> {
        try {
            // 1. Récupérer tous les sondages expirés
            const expiredPollsSnapshot = await this.firestore.collection('publishedPolls').where('expired', '==', true).get();

            // 2. Vérifier s'il y a des sondages à supprimer
            if (expiredPollsSnapshot.empty) {
                return;
            }

            // 3. Supprimer chaque sondage expiré
            const batch = this.firestore.batch(); // Utiliser un batch pour des performances optimales
            expiredPollsSnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // 4. Exécuter la suppression en une seule opération
            await batch.commit();
        } catch (error) {
            console.error('Erreur lors de la suppression des sondages expirés:', error);
            throw error; // Propager l'erreur pour la gestion ultérieure
        }
    }

    async updatePublishedPollVotes(id: string, results: number[]): Promise<PublishedPoll> {
        const pollRef = this.firestore.collection('publishedPolls').doc(id);
        const pollDoc = await pollRef.get();
        if (!pollDoc.exists) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }
        const pollData = pollDoc.data() as PublishedPoll;
        if (pollData.expired) return; //Vérif pour mina
        // Mettre à jour totalVotes
        results.forEach((choiceIndex, questionIndex) => {
            if (pollData.totalVotes[questionIndex]) {
                pollData.totalVotes[questionIndex][choiceIndex]++;
            }
        });
        // Sauvegarder les modifications
        await pollRef.update({ totalVotes: pollData.totalVotes });

        return pollData;
    }
    //Pas idéal mais meilleur endroit pour maintenant
    onModuleInit() {
        this.scheduleMinutelyCheck();
    }

    private scheduleMinutelyCheck() {
        this.checkAndUpdateExpiredStatus(); //direct en arrivant
        const now = new Date();
        const secondsUntilNextMinute = 60 - now.getSeconds();
        const millisUntilNextMinute = secondsUntilNextMinute * 1000 - now.getMilliseconds();

        setTimeout(() => {
            this.checkAndUpdateExpiredStatus(); // Exécute à la prochaine minute pile
            setInterval(() => this.checkAndUpdateExpiredStatus(), 60 * 1000); // Puis toutes les minutes
        }, millisUntilNextMinute);
    }

    private async checkAndUpdateExpiredStatus(): Promise<void> {
        const now = new Date();
        const snapshot = await this.firestore.collection('publishedPolls').where('expired', '==', false).get();
        const batch = this.firestore.batch();
        snapshot.forEach((doc) => {
            const poll = doc.data();
            const pollEndDate = new Date(poll.endDate);
            console.log(`Données du sondage:`, {
                id: doc.id,
                endDateStocké: poll.endDate,
                endDateInterprété: pollEndDate.toISOString(),
                maintenantEST: now.toISOString(),
            });

            // 3. Comparaison
            if (pollEndDate <= now) {
                batch.update(doc.ref, { expired: true });
                this.pushNotifService.onPublishedPollExpired(poll.title);
            }
        });
        await batch.commit();
    }
}
