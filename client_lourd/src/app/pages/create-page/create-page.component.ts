import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopUpCreationComponent } from '@app/components/general-elements/pop-up-creation/pop-up-creation.component';
import { Quiz } from '@app/interfaces/quiz';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
})
export class CreatePageComponent {
    quizzes: Quiz[];
    quizPopUpWidth = '600px';
    title: string = 'Création de partie';

    quizzesObserver: Partial<Observer<Quiz[]>> = {
        next: (quizzes: Quiz[]) => {
            const visibleQuizzes = quizzes.filter((quiz) => quiz.visibility && quiz.title);
            if (!visibleQuizzes.length) {
                this.openErrorPopUp();
            } else {
                this.quizzes = visibleQuizzes;
            }
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };

    // Plus de 4 paramètres au niveau du constructeur en cas de nécessité est accepté
    // eslint-disable-next-line max-params
    constructor(
        private messageHandlerService: MessageHandlerService,
        private dialog: MatDialog,
        private quizServerService: QuizService,
    ) {
        this.fetchAvailableQuizzes();
    }

    openDialog(quiz: Quiz): void {
        this.dialog.open(PopUpCreationComponent, {
            width: '50%',
            backdropClass: 'quiz-info-popup',
            panelClass: 'custom-container',
            data: { quiz, isCreate: true },
        });
    }

    openErrorPopUp(): void {
        this.messageHandlerService.popUpErrorDialog("Aucun questionnaire n'est presentement disponible");
    }

    private fetchAvailableQuizzes(): void {
        this.quizServerService.getAllQuizzes().subscribe(this.quizzesObserver);
    }
}
