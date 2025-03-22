import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { backInLeftAnimation, backInRightAnimation, bounceOutAnimation, zoomInAnimation } from '@app/animations/animation';
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
export class ConsultPollPageComponent {
    polls: Poll[] = [];
    publishedPolls: PublishedPoll[] = [];
    private pollsObserver: Partial<Observer<Poll[]>> = {
        next: (polls: Poll[]) => {
            console.log('Dans le next avec ', polls);
            this.polls = polls;
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    constructor(
        private router: Router,
        private consultPollService: ConsultPollService,
        private messageHandlerService: MessageHandlerService,
    ) {
        this.consultPollService.getAllPolls().subscribe(this.pollsObserver);
    }

    navigate(route: string): void {
        this.router.navigate([route]);
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

    private deleteCallback(id: string) {
        this.consultPollService.deletePollById(id).subscribe(this.pollsObserver);
    }
}
