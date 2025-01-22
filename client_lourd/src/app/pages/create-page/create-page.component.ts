import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopUpCreationComponent } from '@app/components/general-elements/pop-up-creation/pop-up-creation.component';
import { EMPTY_QUIZ, RANDOM_QUESTIONS_NUMBER } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { QuestionService } from '@app/services/back-end-communication-services/question-service/question.service';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
})
export class CreatePageComponent implements OnDestroy {
    quizzes: Quiz[];
    randomModeQuiz: Quiz = EMPTY_QUIZ;
    randomModeQuizId: string;
    quizPopUpWidth = '600px';
    title: string = 'Création de partie';

    quizzesObserver: Partial<Observer<Quiz[]>> = {
        next: (quizzes: Quiz[]) => {
            const visibleQuizzes = quizzes.filter((quiz) => quiz.visibility && quiz.title !== 'Mode aléatoire');
            if (!visibleQuizzes.length) {
                this.openErrorPopUp();
            } else {
                this.quizzes = visibleQuizzes;
                this.randomModeQuiz = quizzes[quizzes.length - 1];
                if (this.randomModeQuiz.id) {
                    this.randomModeQuizId = this.randomModeQuiz.id;
                }
            }
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    qcmQuestionsObserver: Partial<Observer<Question[]>> = {
        next: (questions: Question[]) => {
            this.qcmQuestions = questions.filter((question) => question.type === 'QCM');
            if (this.qcmQuestions.length >= RANDOM_QUESTIONS_NUMBER) {
                this.randomQuestions = this.getRandomQuestions(this.qcmQuestions);
                this.generateRandomModeQuiz();
            }
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    private qcmQuestions: Question[];
    private randomQuestions: Question[];

    // Plus de 4 paramètres au niveau du constructeur en cas de nécessité est accepté
    // eslint-disable-next-line max-params
    constructor(
        private questionService: QuestionService,
        private messageHandlerService: MessageHandlerService,
        private dialog: MatDialog,
        private quizServerService: QuizService,
    ) {
        this.onReload();
        this.fetchAvailableQuestions();
        this.fetchAvailableQuizzes();
    }

    @HostListener('window:beforeunload')
    handleBeforeUnload() {
        localStorage.setItem('randomModeQuizId', this.randomModeQuizId);
    }

    ngOnDestroy(): void {
        if (this.randomModeQuiz.id) {
            this.removeQuiz(this.randomModeQuiz.id);
        }
    }

    openDialog(quiz: Quiz): void {
        this.dialog.open(PopUpCreationComponent, {
            width: this.quizPopUpWidth,
            data: quiz,
        });
    }

    openErrorPopUp(): void {
        this.messageHandlerService.popUpErrorDialog("Aucun questionnaire n'est presentement disponible");
    }

    private fetchAvailableQuizzes(): void {
        this.quizServerService.getAllQuizzes().subscribe(this.quizzesObserver);
    }

    private fetchAvailableQuestions(): void {
        this.questionService.getAllQuestions().subscribe(this.qcmQuestionsObserver);
    }

    private removeQuiz(quizId: string): void {
        this.quizServerService.deleteQuizById(quizId).subscribe(this.quizzesObserver);
    }

    private getRandomQuestions(questions: Question[]): Question[] {
        if (questions.length >= RANDOM_QUESTIONS_NUMBER) {
            const shuffledQuestions = questions.slice();
            const selectedQuestions: Question[] = [];

            while (selectedQuestions.length < RANDOM_QUESTIONS_NUMBER && shuffledQuestions.length > 0) {
                const randomIndex = Math.floor(Math.random() * shuffledQuestions.length);
                const randomElement = shuffledQuestions.splice(randomIndex, 1)[0];

                if (!selectedQuestions.includes(randomElement)) {
                    selectedQuestions.push(randomElement);
                }
            }

            return selectedQuestions;
        }
        return [];
    }

    private generateRandomModeQuiz() {
        const quiz: Quiz = {
            title: 'Mode aléatoire',
            description:
                'Ce mode est accessible uniquement si la banque de questions comporte au moins 5 QCM.' +
                'Chaque partie contient 5 QCM choisies aléatoirement de la banque.',
            lastModification: new Date().toISOString(),
            duration: 20,
            questions: this.randomQuestions,
            visibility: true,
        };
        this.quizServerService.createQuiz(quiz).subscribe(this.quizzesObserver);
    }

    private onReload() {
        const quizId = localStorage.getItem('randomModeQuizId');
        if (quizId) {
            this.removeQuiz(quizId);
            localStorage.removeItem('randomModeQuizId');
        }
    }
}
