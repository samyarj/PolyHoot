import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core'; // Ajoutez OnDestroy et OnInit
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { backInLeftAnimation, backInRightAnimation, bounceOutAnimation, zoomInAnimation } from '@app/animations/animation';
import { PollPlayerPopInComponent } from '@app/components/general-elements/poll-player-pop-in/poll-player-pop-in.component';
import { AppRoute, ConfirmationMessage } from '@app/constants/enum-class';
import { Poll, PublishedPoll } from '@app/interfaces/poll';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { ConsultPollService } from '@app/services/poll-services/consult-poll.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-consult-poll-page',
    templateUrl: './consult-poll-page.component.html',
    styleUrls: ['./consult-poll-page.component.scss'],
    animations: [backInLeftAnimation, backInRightAnimation, zoomInAnimation, bounceOutAnimation],
})
export class ConsultPollPageComponent implements OnInit, OnDestroy {
    // Implémentez OnInit et OnDestroy
    polls: Poll[] = [];
    publishedPolls: PublishedPoll[] = [];
    private intervalId: any; // Pour stocker l'ID de l'intervalle

    private pollsObserver: Partial<Observer<Poll[]>> = {
        next: (polls: Poll[]) => {
            this.polls = polls;
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };

    private allPollsObserver: Partial<Observer<{ polls: Poll[]; publishedPolls: PublishedPoll[] }>> = {
        next: (response: { polls: Poll[]; publishedPolls: PublishedPoll[] }) => {
            console.log('Dans le next du getAllPolls avec ', response.publishedPolls);
            this.polls = response.polls;
            this.publishedPolls = response.publishedPolls.filter((poll) => !poll.expired);
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };

    constructor(
        private router: Router,
        private consultPollService: ConsultPollService,
        private messageHandlerService: MessageHandlerService,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        // Charger les sondages au démarrage
        this.consultPollService.getAllPolls().subscribe(this.allPollsObserver);

        // Démarrer la vérification toutes les secondes
        this.intervalId = setInterval(() => {
            this.checkAndUpdateExpiredStatus();
        }, 1000); // 1000 ms = 1 seconde
    }

    ngOnDestroy(): void {
        // Nettoyer l'intervalle lorsque le composant est détruit
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
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
        this.consultPollService.deletePollById(id).subscribe(this.pollsObserver);
    }

    private publishCallback(id: string) {
        const pollToPublish = this.polls.find((poll) => poll.id === id);
        if (pollToPublish) {
            this.consultPollService.publishPoll(pollToPublish).subscribe(this.allPollsObserver);
        } else {
            console.error(`Sondage avec l'ID ${id} non trouvé.`);
        }
    }

    private checkAndUpdateExpiredStatus(): void {
        const currentDate = new Date(); // Obtenir la date actuelle

        this.publishedPolls.forEach((poll) => {
            const pollEndDate = new Date(poll.endDate); // Convertir endDate en objet Date
            // Vérifier si la date de fin est maintenant ou dans le passé
            if (pollEndDate <= currentDate && !poll.expired) {
                console.log('Le sondage est expiré');
                poll.expired = true;
                // this.publishedPolls = this.publishedPolls.map((p) => (p.id === poll.id ? poll : p));
                this.expirePublishedPoll(poll);
            }
        });
    }

    private expirePublishedPoll(poll: PublishedPoll): void {
        this.consultPollService.expirePublishedPoll(poll).subscribe({
            next: () => {
                // Récupérer toutes les polls mises à jour depuis le serveur
                this.consultPollService.getAllPolls().subscribe(this.allPollsObserver);
            },
            error: (error) => {
                console.error('Erreur lors de la mise à jour du sondage :', error);
            },
        });
    }
}
