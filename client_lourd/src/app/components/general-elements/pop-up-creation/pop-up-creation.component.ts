import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ErrorDialogComponent } from '@app/components/general-elements/error-dialog/error-dialog.component';
import { JoinEvents } from '@app/constants/enum-class';
import { Quiz } from '@app/interfaces/quiz';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';

@Component({
    selector: 'app-pop-up-creation',
    templateUrl: './pop-up-creation.component.html',
    styleUrls: ['./pop-up-creation.component.scss'],
})
export class PopUpCreationComponent {
    errorMessage: string | null = null;
    component: { title: string; description: string; duration: number; questions: { text: string }[] };
    isQuizValid: boolean = false;

    // constructeur a 6 parametres permis selon les charges et le prof, etant donne la nature des attributs
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<PopUpCreationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { quiz: Quiz; isCreate: boolean },
        private quizService: QuizService,
        private router: Router,
        private dialog: MatDialog,
        private socketService: SocketClientService,
    ) {
        this.fetchQuizById(this.data.quiz.id);
    }

    onClose(): void {
        this.dialogRef.close();
    }

    openNewGame(): void {
        const quiz = this.data.quiz;
        this.socketService.send(JoinEvents.Create, quiz, (roomId: string) => {
            this.socketService.roomId = roomId;
            this.socketService.isOrganizer = true;
            this.verifyLocalStorage();
            this.navigate('/waiting');
        });
    }

    navigate(route: string): void {
        if (!this.isQuizValid) {
            this.openErrorMessage();
            return;
        }
        this.router.navigate([route]);
        this.dialogRef.close();
    }
    private openErrorMessage(): void {
        this.dialogRef.close();
        this.dialog.open(ErrorDialogComponent, {
            width: '400px',
            panelClass: 'custom-container',
            data: { message: this.errorMessage, reloadOnClose: true },
        });
    }

    private verifyLocalStorage() {
        if (localStorage.getItem('navigatedFromUnload') === 'true') {
            localStorage.removeItem('navigatedFromUnload');
        }
    }
    private fetchQuizById(id: string | undefined) {
        if (id) {
            this.quizService.getQuizById(id).subscribe({
                next: (quiz: Quiz) => {
                    if (quiz.visibility) {
                        this.data.quiz = quiz;
                        this.isQuizValid = true;
                    } else {
                        this.errorMessage = 'Le jeu a été caché aux utilisateurs!';
                    }
                },
                error: (httpErrorResponse: HttpErrorResponse) => {
                    this.errorMessage = "Le jeu n'existe plus. Message erreur: " + httpErrorResponse.message;
                },
            });
        }
    }
}
