import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Quiz } from '@app/interfaces/quiz';

@Component({
    selector: 'app-poll-player-pop-in.component',
    templateUrl: './poll-player-pop-in.component.html',
    styleUrls: ['./poll-player-pop-in.component.scss'],
})
export class PollPlayerPopInComponent {
    errorMessage: string | null = null;
    component: { title: string; description: string; duration: number; questions: { text: string }[] };
    isQuizValid: boolean = false;

    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<PollPlayerPopInComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { quiz: Quiz; isCreate: boolean },
        private dialog: MatDialog,
    ) {}

    onClose(): void {
        this.dialogRef.close();
    }
}
