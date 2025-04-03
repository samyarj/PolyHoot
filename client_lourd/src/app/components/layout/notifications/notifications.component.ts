import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PollPlayerPopInComponent } from '@app/components/general-elements/poll-related/poll-player-pop-in/poll-player-pop-in.component';
import { AppRoute } from '@app/constants/enum-class';
import { PublishedPoll } from '@app/interfaces/poll';
import { User } from '@app/interfaces/user'; // Assurez-vous d'importer l'interface User
import { AuthService } from '@app/services/auth/auth.service';
import { HistoryPublishedPollService } from '@app/services/poll-services/history-poll.service';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, filter, map, Observable, Subject, Subscription, take, takeUntil } from 'rxjs';
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
    private destroy$ = new Subject<void>();
    private combinedSubscription: Subscription;

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
        if (this.user && this.user.uid) {
            // Combiner les deux observables
            const combinedSubscription = combineLatest([
                this.historyPublishedPollService.watchPublishedPolls(),
                this.watchUser(this.user.uid),
            ]).subscribe(([publishedPolls, userData]) => {
                if (this.user?.role === 'player') {
                    this.publishedPolls = publishedPolls
                        .filter(
                            (poll) => !poll.expired && poll.id && !userData.pollsAnswered?.includes(poll.id), // Utilisation directe de userData
                        )
                        .sort((a, b) => {
                            // Convertir les dates en timestamps pour comparaison
                            const dateA = new Date(a.endDate!).getTime();
                            const dateB = new Date(b.endDate!).getTime();
                            return dateA - dateB; // Tri ascendant (plus petite date en premier)
                        });
                    this.notifications = this.publishedPolls.map((poll) => ({
                        title: `${poll.title}`,
                        poll,
                    }));
                } else if (this.user?.role === 'admin') {
                    this.publishedPolls = publishedPolls
                        .filter((poll) => poll.expired)
                        .sort((a, b) => {
                            // Convertir les dates en timestamps pour comparaison
                            const dateA = new Date(a.endDate!).getTime();
                            const dateB = new Date(b.endDate!).getTime();
                            return dateB - dateA; // Tri ascendant (plus petite date en premier)
                        });
                    this.notifications = this.publishedPolls.map((poll) => ({
                        title: `${poll.title}`,
                        poll,
                    }));
                }
            });

            // Stocker la souscription pour la désabonner plus tard
            this.combinedSubscription = combinedSubscription;
        }
    }

    ngOnDestroy(): void {
        // Se désabonner des observables
        if (this.publishedPollsSubscription) this.publishedPollsSubscription.unsubscribe();
        if (this.userSubscription) this.userSubscription.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
        if (this.combinedSubscription) {
            this.combinedSubscription.unsubscribe();
        }
    }

    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
    }

    openPollAnswer(poll: PublishedPoll) {
        const dialogRef = this.dialog.open(PollPlayerPopInComponent, {
            backdropClass: 'quiz-info-popup',
            panelClass: 'custom-container',
            data: {
                poll,
                pollStatus$: this.historyPublishedPollService.watchPublishedPolls().pipe(
                    map((polls) => polls.find((p) => p.id === poll.id)),
                    takeUntil(this.destroy$),
                ),
            },
        });
        // Surveiller l'expiration du sondage
        this.historyPublishedPollService
            .watchPublishedPolls()
            .pipe(
                takeUntil(this.destroy$),
                map((polls) => polls.find((p) => p.id === poll.id)),
                filter((currentPoll) => currentPoll?.expired === true),
                take(1),
            )
            .subscribe(() => {
                dialogRef.close();
            });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (result === 'expired') {
                    this.toastr.error('Ce sondage a expiré pendant que vous répondiez');
                    return;
                }
                this.toastr.success('Sondage complété!');
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
                }
            });

            // Retourne la fonction de nettoyage
            return () => unsubscribe();
        });
    }
}
