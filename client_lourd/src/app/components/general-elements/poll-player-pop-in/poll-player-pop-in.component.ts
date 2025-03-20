import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Poll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';

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
export class PollPlayerPopInComponent {
    state: PollState = PollState.NotStarted;
    currentQuestion: Question;
    currentIndex: number = 0;
    selectedChoice: number = NO_SELECTION;
    errorMessage: string | null = null;
    poll: Poll;
    isQuizValid: boolean = false;
    playerAnswer: number[] = [];
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<PollPlayerPopInComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Poll, // private dialog: MatDialog,
    ) {
        this.poll = data;
    }

    startPoll() {
        this.currentQuestion = this.poll.questions[this.currentIndex];
        this.state = PollState.Started;
    }

    nextQuestion() {
        console.log('appelle');
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
