import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Poll, PublishedPoll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { Observable, Subject, takeUntil } from 'rxjs';

enum PollState {
    NotStarted = 'not_started',
    Started = 'started',
    Finished = 'finished',
}

const NO_SELECTION = -1;
@Component({
    selector: 'app-poll-player-pop-in.component',
    templateUrl: './poll-player-pop-in.component.html',
    styleUrls: ['./poll-player-pop-in.component.scss'],
})
export class PollPlayerPopInComponent implements OnInit, OnDestroy {
    state: PollState = PollState.NotStarted;
    currentQuestion: Question;
    currentIndex: number = 0;
    selectedChoice: number = NO_SELECTION;
    errorMessage: string | null = null;
    poll: Poll;
    isQuizValid: boolean = false;
    playerAnswer: number[] = [];
    private destroy$ = new Subject<void>();
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<PollPlayerPopInComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            poll: PublishedPoll;
            pollStatus$: Observable<PublishedPoll | undefined>;
        },
    ) {
        this.poll = data.poll;
    }
    ngOnInit(): void {
        this.data.pollStatus$.pipe(takeUntil(this.destroy$)).subscribe((currentPoll) => {
            if (currentPoll?.expired) {
                this.dialogRef.close('expired');
            }
        });
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    startPoll() {
        this.currentQuestion = this.poll.questions[this.currentIndex];
        this.state = PollState.Started;
    }

    nextQuestion() {
        if (this.selectedChoice !== NO_SELECTION && this.currentIndex < this.poll.questions.length - 1) {
            this.currentIndex++;
            this.playerAnswer.push(this.selectedChoice);
            this.selectedChoice = NO_SELECTION;
            this.currentQuestion = this.poll.questions[this.currentIndex];
        } else {
            this.playerAnswer.push(this.selectedChoice);
            this.selectedChoice = NO_SELECTION;
            this.state = PollState.Finished;
        }
    }

    selectChoice(index: number) {
        if (index === this.selectedChoice) {
            this.selectedChoice = NO_SELECTION;
        } else {
            this.selectedChoice = index;
        }
    }
    onSubmit(): void {
        this.dialogRef.close(this.playerAnswer);
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
