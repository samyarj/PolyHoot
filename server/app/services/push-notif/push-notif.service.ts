import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PushNotifService implements OnModuleInit, OnModuleDestroy {
    private firestore = admin.firestore();
    private readonly logger = new Logger(PushNotifService.name);
    private unsubscribeListeners = new Map<string, () => void>(); // Liste des channels et de leur subscription
    private unsubscribeChannelsListener: (() => void) | null = null;
    private firstSnapshotFlags = new Map<string, boolean>(); // Track first snapshot for each channel

    constructor() { }

    onModuleInit() {
        this.logger.log("onModuleInit");
        this.listenForChannelChanges();
        this.listenToGlobalChat();
    }

    listenForChannelChanges() {
        this.logger.log("Listening for chat channel changes...");

        if (this.unsubscribeChannelsListener) {
            return;
        }

        this.unsubscribeChannelsListener = this.firestore.collection('chatChannels')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    // If this is the first snapshot, all documents will be in the list as added changes.
                    const channelId = change.doc.id;
                    if (change.type === 'added') {
                        this.logger.log(`New channel detected: ${channelId}`);
                        this.listenForNewMessagesInChannel(channelId);
                    } else if (change.type === 'removed') {
                        this.logger.log(`Channel deleted: ${channelId}`);
                        this.unsubscribeFromChannel(channelId);
                    }
                });
            });
    }

    unsubscribeFromChannel(channelId: string) {
        if (this.unsubscribeListeners.has(channelId)) {
            this.unsubscribeListeners.get(channelId)!();
            this.unsubscribeListeners.delete(channelId);
            this.firstSnapshotFlags.delete(channelId); // Clear the flag as well
            this.logger.log(`Stopped listening to messages in channel: ${channelId}`);
        }
    }


    listenForNewMessagesInChannel(channelId: string) {
        if (this.unsubscribeListeners.has(channelId)) {
            return; // Avoid duplicate listeners
        }

        this.firstSnapshotFlags.set(channelId, true);

        const unsubscribe = this.firestore.collection(`chatChannels/${channelId}/messages`)
            .orderBy('date', 'asc')
            .onSnapshot(snapshot => {
                if (this.firstSnapshotFlags.get(channelId)) {
                    this.firstSnapshotFlags.set(channelId, false);
                    return;
                }
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        const newMessage = change.doc.data();

                        // Fetch users in the channel
                        const channelDoc = await this.firestore.collection('chatChannels').doc(channelId).get();
                        if (!channelDoc.exists) return;

                        const channelData = channelDoc.data();
                        if (!channelData || !channelData.users) return;

                        const usersRef = this.firestore.collection('users');
                        const usersSnapshot = await usersRef.where('uid', 'in', channelData.users).get();

                        const deviceUserMap = new Map<string, string>(); // Map fcmToken -> username
                        // normalement pour 1 device, on a seulement 1 user de connecté à la fois

                        usersSnapshot.forEach(userDoc => {
                            const user = userDoc.data();
                            if (user.fcmToken && user.uid !== newMessage.uid && user.isOnline === true) {
                                this.logger.debug(`User online with FCM token found: ${user.username}`);
                                deviceUserMap.set(user.fcmToken, user.username);
                            }
                        });

                        this.logger.log(`Sending push notifications to ${deviceUserMap.size} devices in ${channelId}`);

                        // Send personalized notifications per device
                        const notifications = Array.from(deviceUserMap.entries()).map(([token, name]) => {
                            const title = `Salut ${name} ! Ici PolyHoot !`;
                            const body = `Nouveau message dans ${channelId}: ${newMessage.message}`;
                            return this.sendNotification(token, title, body);
                        });

                        await Promise.all(notifications);
                    }
                });
            });

        // Store the unsubscribe function for cleanup
        this.unsubscribeListeners.set(channelId, unsubscribe);
    }

    listenToGlobalChat() {
        this.firstSnapshotFlags.set('globalChat', true);

        const unsubscribe = this.firestore.collection('globalChat')
            .orderBy('date', 'asc')
            .onSnapshot(snapshot => {
                if (this.firstSnapshotFlags.get('globalChat')) {
                    this.firstSnapshotFlags.set('globalChat', false);
                    return;
                }
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        const newMessage = change.doc.data();

                        // Fetch all users with an FCM token
                        const usersRef = this.firestore.collection('users');
                        const usersSnapshot = await usersRef.where('fcmToken', '!=', '').get();

                        const deviceUserMap = new Map<string, string>(); // Map fcmToken -> username

                        usersSnapshot.forEach(userDoc => {
                            const user = userDoc.data();
                            if (user.fcmToken && user.uid !== newMessage.uid && user.isOnline === true) {
                                this.logger.debug(`User online with FCM token found: ${user.username}`);
                                deviceUserMap.set(user.fcmToken, user.username);
                            }
                        });

                        this.logger.log(`Sending global chat notifications to ${deviceUserMap.size} devices`);

                        // Send notifications per device
                        const notifications = Array.from(deviceUserMap.entries()).map(([token, name]) => {
                            const title = `Salut ${name} ! Ici PolyHoot !`;
                            const body = `Nouveau message dans le chat Général: ${newMessage.message}`;
                            return this.sendNotification(token, title, body);
                        });

                        await Promise.all(notifications);
                    }
                });
            });

        this.unsubscribeListeners.set('globalChat', unsubscribe);
    }

    async onIngameMessage(message: string, userUid: string) {
        try {
            // Fetch the user from Firestore
            const userDoc = await this.firestore.collection('users').doc(userUid).get();

            if (!userDoc.exists) {
                this.logger.log(`User with UID ${userUid} not found`);
                return;
            }

            const user = userDoc.data();

            // Check for valid FCM token
            if (user?.fcmToken && user.isOnline) {
                const title = `Salut ${user.username} ! Ici PolyHoot !`;
                const body = `Nouveau message en jeu : ${message}`;
                this.logger.log(`Sending ingame push notification to ${user.username}`);
                await this.sendNotification(user.fcmToken, title, body);
            }
        } catch (error) {
            this.logger.debug(`Failed to send ingame message notification: ${error}`);
        }

    }


    async sendNotification(token: string, title: string, body: string) {
        if (!token) return;
        try {
            await admin.messaging().send({
                token,
                notification: { title, body },
            });
        } catch (error) {
            this.logger.debug(`Error sending notification: ${error} to ${token}`);
        }
    }

    async onNewPublishedPoll(pollTitle: string) {
        const usersRef = this.firestore.collection('users');
        const usersSnapshot = await usersRef.where('fcmToken', '!=', '').get();

        const filteredUsers = usersSnapshot.docs.filter(doc => doc.data().role === 'player');

        const deviceUserMap = new Map<string, string>(); // Map fcmToken -> username

        filteredUsers.forEach((userDoc) => {
            const user = userDoc.data();
            if (user.fcmToken && user.isOnline === true) {
                this.logger.debug(`User online with FCM token found: ${user.username}`);
                deviceUserMap.set(user.fcmToken, user.username);
            }
        });

        this.logger.log(`Will send push notifications to this number of mobile clients: ${deviceUserMap.size}`);

        const notifications = Array.from(deviceUserMap.entries()).map(([token, name]) =>
            this.sendNotification(token, `Salut ${name} ! Ici PolyHoot !`, `Nouveau sondage disponible: ${pollTitle}`)
        );

        await Promise.all(notifications);
    }

    async onPublishedPollExpired(pollTitle: string) {

        const usersRef = this.firestore.collection('users');
        const usersSnapshot = await usersRef.where('fcmToken', '!=', '').get();

        const filteredUsers = usersSnapshot.docs.filter(doc => doc.data().role === 'admin');

        const deviceUserMap = new Map<string, string>(); // Map fcmToken -> username

        filteredUsers.forEach((userDoc) => {
            const user = userDoc.data();
            if (user.fcmToken && user.isOnline === true) {
                this.logger.debug(`User online with FCM token found: ${user.username}`);
                deviceUserMap.set(user.fcmToken, user.username);
            }
        });

        this.logger.log(`Poll expired. Will send push notifications to this number of mobile clients: ${deviceUserMap.size}`);

        const notifications = Array.from(deviceUserMap.entries()).map(([token, name]) =>
            this.sendNotification(token, `Salut ${name} ! Ici PolyHoot !`, `Sondage expiré: ${pollTitle}`)
        );

        await Promise.all(notifications);
    }

    onModuleDestroy() {
        this.logger.log("Unsubscribing from all Firestore listeners.");

        // Unsubscribe from all message listeners
        this.unsubscribeListeners.forEach(unsub => unsub());
        this.unsubscribeListeners.clear();

        // Unsubscribe from the chatChannels collection listener
        if (this.unsubscribeChannelsListener) {
            this.unsubscribeChannelsListener();
            this.unsubscribeChannelsListener = null;
        }

        this.firstSnapshotFlags.clear();
    }


}




