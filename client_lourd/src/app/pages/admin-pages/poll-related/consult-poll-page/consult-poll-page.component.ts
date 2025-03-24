import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { backInLeftAnimation, backInRightAnimation, bounceOutAnimation, zoomInAnimation } from '@app/animations/animation';
import { PollPlayerPopInComponent } from '@app/components/general-elements/poll-player-pop-in/poll-player-pop-in.component';
import { AppRoute, ConfirmationMessage } from '@app/constants/enum-class';
import { Poll, PublishedPoll } from '@app/interfaces/poll';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { ConsultPollService } from '@app/services/poll-services/consult-poll.service';
import { catchError, of, Subscription } from 'rxjs';

@Component({
    selector: 'app-consult-poll-page',
    templateUrl: './consult-poll-page.component.html',
    styleUrls: ['./consult-poll-page.component.scss'],
    animations: [backInLeftAnimation, backInRightAnimation, zoomInAnimation, bounceOutAnimation],
})
export class ConsultPollPageComponent implements OnInit, OnDestroy {
    polls: Poll[] = [];
    publishedPolls: PublishedPoll[] = [];
    private pollsSubscription: Subscription;
    private publishedPollsSubscription: Subscription;

    constructor(
        private router: Router,
        private consultPollService: ConsultPollService,
        private messageHandlerService: MessageHandlerService,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        // S'abonner aux changements dans les sondages
        this.pollsSubscription = this.consultPollService.watchPolls().subscribe((polls) => {
            this.polls = polls;
        });

        // S'abonner aux changements dans les sondages publiés
        this.publishedPollsSubscription = this.consultPollService.watchPublishedPolls().subscribe((publishedPolls) => {
            this.publishedPolls = publishedPolls.filter((poll) => !poll.expired);
        });
    }

    ngOnDestroy(): void {
        // Se désabonner des observables
        if (this.pollsSubscription) this.pollsSubscription.unsubscribe();
        if (this.publishedPollsSubscription) this.publishedPollsSubscription.unsubscribe();
    }

    navigate(route: string): void {
        this.router.navigate([route]);
    }

    consultPoll(poll: Poll) {
        this.dialog.open(PollPlayerPopInComponent, {
            backdropClass: 'quiz-info-popup',
            panelClass: 'custom-container',
            data: { poll, isAdmin: true },
        });
    }

    goToEdit(id: string | undefined) {
        if (id) this.router.navigate(['polls/' + AppRoute.MODIFYPOLL + id]);
    }

    trackByFn(_index: number, item: Poll) {
        return item.id;
    }

    delete(id: string | undefined) {
        if (id) {
            this.messageHandlerService.confirmationDialog(ConfirmationMessage.DeletePoll, () => this.deleteCallback(id));
        }
    }

    publish(id: string | undefined) {
        if (id) {
            this.messageHandlerService.confirmationDialog(ConfirmationMessage.PublishPoll, () => this.publishCallback(id));
        }
    }

    private deleteCallback(id: string) {
        this.consultPollService
            .deletePollById(id)
            .pipe(
                catchError((error: any) => {
                    console.error('Erreur lors de la suppression du sondage :', error);
                    this.messageHandlerService.popUpErrorDialog(error.message); // Gérer l'erreur avec un popup
                    return of(null); // Retourner un Observable vide pour continuer le flux
                }),
            )
            .subscribe();
    }

    private publishCallback(id: string) {
        const pollToPublish = this.polls.find((poll) => poll.id === id);
        if (pollToPublish) {
            this.consultPollService
                .publishPoll(pollToPublish)
                .pipe(
                    catchError((error: any) => {
                        console.error('Erreur lors de la publication du sondage :', error);
                        this.messageHandlerService.popUpErrorDialog(error.message); // Gérer l'erreur avec un popup
                        return of(null); // Retourner un Observable vide pour continuer le flux
                    }),
                )
                .subscribe();
        } else {
            console.error(`Sondage avec l'ID ${id} non trouvé.`);
        }
    }
}
