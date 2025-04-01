import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PollPushNotifService {
    private firestore = admin.firestore();
    private readonly logger = new Logger(PollPushNotifService.name);

    constructor() { }

    async sendNotification(token: string, title: string, body: string) {
        if (!token) return;
        try {
            await admin.messaging().send({
                token,
                notification: { title, body },
            });
        } catch (error) {
            this.logger.error("Error sending notification:", error);
        }
    }

    async onNewPublishedPoll(pollTitle: string) {
        // Fetch users who have FCM tokens
        this.logger.debug("New published poll.");

        const usersRef = this.firestore.collection('users');
        const usersSnapshot = await usersRef.where('fcmToken', '!=', '').get();

        const filteredUsers = usersSnapshot.docs.filter(doc => doc.data().role === 'player');

        // Si plusieurs joueurs utilisent la meme tablette, on envoie une seule notification de sondage
        const uniqueTokens = new Set<string>();

        filteredUsers.forEach((userDoc) => {
            const user = userDoc.data();
            if (user.fcmToken) {
                uniqueTokens.add(user.fcmToken);
            }
        });

        this.logger.log(`Will send push notifications to this number of mobile clients: ${uniqueTokens.size}`);

        const notifications = Array.from(uniqueTokens).map(token =>
            this.sendNotification(token, 'Polyhoot veut ton opinion !', `Nouveau sondage disponible: ${pollTitle}`)
        );

        await Promise.all(notifications);
    }

    async onPublishedPollExpired(pollTitle: string) {
        // Fetch users who have FCM tokens
        this.logger.debug("Poll expired.");

        const usersRef = this.firestore.collection('users');
        const usersSnapshot = await usersRef.where('fcmToken', '!=', '').get();

        const filteredUsers = usersSnapshot.docs.filter(doc => doc.data().role === 'admin');

        this.logger.debug(`FilteredUsers for admin with tablet is ${filteredUsers.length}`);

        // Si plusieurs joueurs utilisent la meme tablette, on envoie une seule notification d'expiration
        const uniqueTokens = new Set<string>();

        filteredUsers.forEach((userDoc) => {
            const user = userDoc.data();
            if (user.fcmToken) {
                uniqueTokens.add(user.fcmToken);
            }
        });

        this.logger.log("Poll expired. Will send push notifications to this number of mobile clients:", uniqueTokens.size);

        const notifications = Array.from(uniqueTokens).map(token =>
            this.sendNotification(token, 'Les statistiques sont prêtes!', `sondage expiré: ${pollTitle}`)
        );

        await Promise.all(notifications);
    }


}




