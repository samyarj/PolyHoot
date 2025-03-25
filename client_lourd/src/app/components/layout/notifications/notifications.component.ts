import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PollPlayerPopInComponent } from '@app/components/general-elements/poll-related/poll-player-pop-in/poll-player-pop-in.component';
import { AppRoute } from '@app/constants/enum-class';
import { PublishedPoll } from '@app/interfaces/poll';
import { User } from '@app/interfaces/user'; // Assurez-vous d'importer l'interface User
import { AuthService } from '@app/services/auth/auth.service';
import { HistoryPublishedPollService } from '@app/services/poll-services/history-poll.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
    showNotifications = false;
    publishedPolls: PublishedPoll[] = [];
    notifications: { title: string; poll: PublishedPoll }[] = [];
    user: User | null;
    private publishedPollsSubscription: Subscription;
    private userSubscription: Subscription;

    constructor(
        private dialog: MatDialog,
        private toastr: ToastrService,
        private http: HttpClient,
        private historyPublishedPollService: HistoryPublishedPollService,
        private authService: AuthService,
        private firestore: Firestore, // Injectez Firestore
        private router: Router,
    ) {
        this.user = this.authService.getUser();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.notification-container')) {
            this.showNotifications = false;
        }
    }

    ngOnInit(): void {
        // S'abonner aux changements dans les sondages publiés
        this.publishedPollsSubscription = this.historyPublishedPollService.watchPublishedPolls().subscribe((publishedPolls) => {
            if (this.user?.role === 'player') {
                this.publishedPolls = publishedPolls.filter((poll) => !poll.expired);
                this.notifications = this.publishedPolls.map((poll) => ({
                    title: `${poll.title}`,
                    poll,
                }));
            } else if (this.user?.role === 'admin') {
                this.publishedPolls = publishedPolls.filter((poll) => poll.expired);
                this.notifications = this.publishedPolls.map((poll) => ({
                    title: `${poll.title}`,
                    poll,
                }));
            }
        });

        if (this.user && this.user.uid) {
            this.userSubscription = this.watchUser(this.user.uid).subscribe({
                next: (userData) => {
                    // Filtrer les publishedPolls pour retirer ceux qui sont dans pollAnswered
                    if (userData.pollsAnswered) {
                        this.publishedPolls = this.publishedPolls.filter((poll) => poll.id && !userData.pollsAnswered?.includes(poll.id));

                        // Mettre à jour les notifications en conséquence
                        this.notifications = this.publishedPolls.map((poll) => ({
                            title: `${poll.title}`,
                            poll,
                        }));
                    }
                },
                error: (error) => {
                    console.error("Erreur lors de la surveillance de l'utilisateur:", error);
                },
            });
        }
    }

    ngOnDestroy(): void {
        // Se désabonner des observables
        if (this.publishedPollsSubscription) this.publishedPollsSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
    }

    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
    }

    openPollAnswer(poll: PublishedPoll) {
        const dialogRef = this.dialog.open(PollPlayerPopInComponent, {
            backdropClass: 'quiz-info-popup',
            panelClass: 'custom-container',
            data: poll,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.toastr.success('Sondage complété, voir la console pour les réponses retournées !');
                this.http.patch<PublishedPoll[]>(`${environment.serverUrl}/published-polls/${poll.id}`, result).subscribe({
                    next: () => {
                        this.updateUserPollsAnswered(poll.id);
                    },
                    error: (error) => {
                        console.error("Erreur lors de l'envoi du résultat:", error);
                    },
                });
            } else {
                this.toastr.warning('Complétion du sondage annulée');
            }
        });
    }
    goToStats(poll: PublishedPoll) {
        this.router.navigate([AppRoute.POLLSHISTORY + poll.id]);
        this.showNotifications = false;
    }

    private updateUserPollsAnswered(id: string | undefined) {
        if (this.user && this.user.uid && id) {
            this.http.patch(`${environment.serverUrl}/published-polls/${this.user.uid}/addPollsAnswered/`, { id }).subscribe({
                error: (error) => {
                    console.error('Erreur lors de la mise à jour de pollsAnswered:', error);
                },
            });
        }
    }

    // Fonction pour surveiller les changements d'un utilisateur
    private watchUser(uid: string): Observable<User> {
        return new Observable((subscriber) => {
            const userDoc = doc(this.firestore, 'users', uid);
            const unsubscribe = onSnapshot(userDoc, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data() as User;
                    subscriber.next({ ...data, uid: docSnapshot.id });
                } else {
                    subscriber.error(new Error("L'utilisateur n'existe pas."));
                }
            });

            // Retourne la fonction de nettoyage
            return () => unsubscribe();
        });
    }
}
