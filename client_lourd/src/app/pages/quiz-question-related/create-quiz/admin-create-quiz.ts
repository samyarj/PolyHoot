/*
https://www.youtube.com/watch?v=cIotO5XdfSg 
https://stackoverflow.com/questions/41138081/do-i-have-to-unsubscribe-from-activatedroute-e-g-params-observables 
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { gameFormAnimation } from '@app/animations/animation';
import { QuestionBankComponent } from '@app/components/quiz-related/bank-related/question-bank/question-bank.component';
import { AdminQuizPageMode, AppRoute, ButtonType } from '@app/constants/enum-class';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHandlerService } from '@app/services/admin-services/quiz-handler-service/quiz-handler.service';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-admin-create-quiz',
    templateUrl: './admin-create-quiz.html',
    styleUrls: ['./admin-create-quiz.scss'],
    animations: [gameFormAnimation],
})
export class AdminQuizCreateComponent implements OnDestroy {
    @ViewChild(QuestionBankComponent) questionBankComponent: QuestionBankComponent;

    title: string = AdminQuizPageMode.CREATE;
    submitButton: string = ButtonType.CREATE;

    private quizObserver: Partial<Observer<Quiz>> = {
        next: (quiz: Quiz) => {
            this.quizHandler.quiz = quiz;
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandler.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };

    private errorObserver: Partial<Observer<Quiz[]>> = {
        next: () => {
            this.router.navigate([AppRoute.QUIZMANAGEMENT]);
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandler.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };

    // constructeur a 5 parametres permis selon les charges et le prof, etant donne la nature des attributs
    // eslint-disable-next-line max-params
    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private quizHandler: QuizHandlerService,
        private messageHandler: MessageHandlerService,
        private quizService: QuizService,
    ) {
        this.setMode();
        this.quizHandler.disableAnimations = false;
    }

    get disableAnimations(): boolean {
        return this.quizHandler.disableAnimations;
    }

    ngOnDestroy(): void {
        this.quizHandler.disableAnimations = true;
        this.quizHandler.emptyQuiz();
    }

    addQuestionToQuiz(clickedQuestion: Question): void {
        this.quizHandler.addQuestionToQuiz(clickedQuestion);
    }

    addQuestionToBank(clickedQuestion: Question): void {
        this.questionBankComponent.addQuestionToBank(clickedQuestion);
    }

    submitQuiz(quiz: Quiz): void {
        if (this.quizHandler.quizId) {
            this.quizService.updateQuiz(this.quizHandler.quizId, quiz).subscribe(this.errorObserver);
            return;
        }
        quiz.visibility = false;
        this.quizService.createQuiz(quiz).subscribe(this.errorObserver);
    }

    navigateTologin() {
        this.router.navigate([AppRoute.LOGIN]);
    }

    private setMode(): void {
        const quizId = this.activatedRoute.snapshot.params.id;
        if (quizId) {
            this.quizService.getQuizById(quizId).subscribe(this.quizObserver);
            this.title = AdminQuizPageMode.MODIFY;
            this.submitButton = ButtonType.MODIFY;
        }
        this.quizHandler.quizId = quizId;
    }
}
