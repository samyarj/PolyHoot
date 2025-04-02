import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PollPushNotifService implements OnModuleInit, OnModuleDestroy {
    private firestore = admin.firestore();
    private readonly logger = new Logger(PollPushNotifService.name);
    private unsubscribeListeners = new Map<string, () => void>(); // Stores listeners for cleanup
    private unsubscribeChannelsListener: (() => void) | null = null;
    private firstSnapshotFlags = new Map<string, boolean>(); // Track first snapshot for each channel

    constructor() { }

    onModuleInit() {
        this.logger.debug("onModuleInit");
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

        this.logger.log(`Listening for new messages in channel: ${channelId}`);

        this.firstSnapshotFlags.set(channelId, true);

        const unsubscribe = this.firestore.collection(`chatChannels/${channelId}/messages`) // est ce que ca crash si ca ecoute un chat channel sans sub. messages?
            .orderBy('date', 'asc')
            .onSnapshot(snapshot => {
                if (this.firstSnapshotFlags.get(channelId)) {
                    this.logger.debug("Skipping first snapshot for channel:", channelId);
                    this.firstSnapshotFlags.set(channelId, false);
                    return;
                }
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        const newMessage = change.doc.data();
                        this.logger.log(`New message in ${channelId}: ${newMessage.message}`);

                        // Fetch users in the channel
                        const channelDoc = await this.firestore.collection('chatChannels').doc(channelId).get();
                        if (!channelDoc.exists) return;

                        const channelData = channelDoc.data();
                        if (!channelData || !channelData.users) return;

                        const usersRef = this.firestore.collection('users');
                        const usersSnapshot = await usersRef.where('uid', 'in', channelData.users).get();

                        const deviceUsersMap = new Map<string, string[]>(); // Map fcmToken -> [userNames]

                        usersSnapshot.forEach(userDoc => {
                            const user = userDoc.data();
                            if (user.fcmToken && user.uid !== newMessage.uid) {
                                // Avoid notifying the sender
                                if (!deviceUsersMap.has(user.fcmToken)) {
                                    deviceUsersMap.set(user.fcmToken, []);
                                }
                                deviceUsersMap.get(user.fcmToken)!.push(user.username);
                            }
                        });

                        this.logger.log(`Sending push notifications to ${deviceUsersMap.size} devices in ${channelId}`);

                        // Send personalized notifications per device
                        const notifications = Array.from(deviceUsersMap.entries()).map(([token, names]) => {
                            const nameList = names.join(", ");
                            const title = `Salut ${nameList} ! Ici PolyHoot !`;
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
        this.logger.log("Listening for new messages in global chat...");

        this.firstSnapshotFlags.set('globalChat', true);

        const unsubscribe = this.firestore.collection('globalChat')
            .orderBy('date', 'asc')
            .onSnapshot(snapshot => {
                if (this.firstSnapshotFlags.get('globalChat')) {
                    this.logger.debug("Skipping first snapshot for channel:", 'globalChat');
                    this.firstSnapshotFlags.set('globalChat', false);
                    return;
                }
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added' && this.unsubscribeListeners.has('globalChat')) {
                        const newMessage = change.doc.data();
                        this.logger.log(`New global message: ${newMessage.message}`);

                        // Fetch all users with an FCM token
                        const usersRef = this.firestore.collection('users');
                        const usersSnapshot = await usersRef.where('fcmToken', '!=', '').get();

                        const deviceUsersMap = new Map<string, string[]>(); // Map fcmToken -> [userNames]

                        usersSnapshot.forEach(userDoc => {
                            const user = userDoc.data();
                            if (user.fcmToken && user.uid !== newMessage.uid) {
                                if (!deviceUsersMap.has(user.fcmToken)) {
                                    deviceUsersMap.set(user.fcmToken, []);
                                }
                                deviceUsersMap.get(user.fcmToken)!.push(user.username);
                            }
                        });

                        this.logger.log(`Sending global chat notifications to ${deviceUsersMap.size} devices`);

                        // Send notifications per device
                        const notifications = Array.from(deviceUsersMap.entries()).map(([token, names]) => {
                            const nameList = names.join(", ");
                            const title = `Salut ${nameList} ! Ici PolyHoot !`;
                            const body = `Nouveau message dans le Global Chat: ${newMessage.message}`;
                            return this.sendNotification(token, title, body);
                        });

                        await Promise.all(notifications);
                    }
                });
            });

        this.unsubscribeListeners.set('globalChat', unsubscribe);
    }


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
            this.sendNotification(token, 'PolyHoot veut ton opinion !', `Nouveau sondage disponible: ${pollTitle}`)
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
            this.sendNotification(token, 'Les statistiques sont prêtes!', `Sondage expiré: ${pollTitle}`)
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




