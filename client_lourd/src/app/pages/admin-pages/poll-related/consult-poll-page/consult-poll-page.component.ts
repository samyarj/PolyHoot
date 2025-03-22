import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { backInLeftAnimation, backInRightAnimation, bounceOutAnimation, zoomInAnimation } from '@app/animations/animation';
import { PollPlayerPopInComponent } from '@app/components/general-elements/poll-player-pop-in/poll-player-pop-in.component';
import { AppRoute, ConfirmationMessage } from '@app/constants/enum-class';
import { Poll, PublishedPoll } from '@app/interfaces/poll';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { PollService } from '@app/services/poll.service';
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
            this.polls = polls.filter((poll) => poll.title);
            this.polls = this.pollService.sortPollBySomething(this.polls);
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    constructor(
        private router: Router,
        private pollService: PollService,
        private messageHandlerService: MessageHandlerService,
        private dialog: MatDialog,
    ) {
        this.pollService.getAllPolls().subscribe(this.pollsObserver);
    }

    navigate(route: string): void {
        this.router.navigate([route]);
    }

    consultPoll(poll: Poll) {
        this.dialog.open(PollPlayerPopInComponent, {
            // width: '40%',
            backdropClass: 'quiz-info-popup',
            panelClass: 'custom-container',
            data: { poll, isAdmin: true },
        });
    }

    goToEdit(id: string | undefined) {
        if (id) this.router.navigate([AppRoute.CREATE + id]);
    }

    trackByFn(_index: number, item: Poll) {
        return item.id;
    }

    publish(pollId: string | undefined) {
        if (pollId) this.pollService.publishPoll(pollId).subscribe(this.pollsObserver);
    }

    delete(pollId: string | undefined) {
        if (pollId) this.messageHandlerService.confirmationDialog(ConfirmationMessage.DeleteGame, () => this.deleteCallback(pollId));
    }

    private deleteCallback(pollId: string) {
        this.pollService.deletePollById(pollId).subscribe(this.pollsObserver);
    }
}
