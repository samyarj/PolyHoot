import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { addQuestionAnimation, deleteQuestionAnimation, gameFormAnimation, questionFormAnimation } from '@app/animations/animation';
import { ID } from '@app/constants/constants';
import { AppRoute, ButtonType, ConfirmationMessage } from '@app/constants/enum-class';
import { EMPTY_QCM_QUESTION, EMPTY_QRE_QUESTION } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { QuizHandlerService } from '@app/services/admin-services/quiz-handler-service/quiz-handler.service';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';

@Component({
    selector: 'app-create-quiz',
    templateUrl: './create-quiz.component.html',
    styleUrls: ['./create-quiz.component.scss'],
    animations: [addQuestionAnimation, deleteQuestionAnimation, questionFormAnimation, gameFormAnimation],
})
export class CreateQuizComponent {
    @Input() submitQuizButton: string;
    @Output() questionToBank = new EventEmitter<Question>();
    @Output() submitQuiz = new EventEmitter<Quiz>();
    submitQuestionButton: string = ButtonType.ADD;
    currentQuestion: Question = JSON.parse(JSON.stringify(EMPTY_QCM_QUESTION));
    // 4 services injectés plutôt que 3, c'est raisonnable d'après les chargés car 1 fichier = 1 responsabilité
    // eslint-disable-next-line max-params
    constructor(
        private quizHandler: QuizHandlerService,
        private router: Router,
        private validationService: ValidationService,
        private messageHandlerService: MessageHandlerService,
    ) {}

    get quiz(): Quiz {
        return this.quizHandler.quiz;
    }

    emptyCurrentQuestion(questionType: string) {
        const id = this.currentQuestion.id;
        this.emptyQuestion(questionType);
        this.currentQuestion.id = id;
    }

    addEmptyQuestion() {
        this.emptyQuestion();
        this.submitQuestionButton = ButtonType.ADD;
    }

    onQuestionSubmitted(newQuestion: Question): void {
        if (this.submitQuestionButton === ButtonType.MODIFY) {
            this.quizHandler.modifyQuestionInQuiz(newQuestion);
            this.submitQuestionButton = ButtonType.ADD;
            this.emptyQuestion();
            return;
        }
        this.quizHandler.addQuestionToQuiz(newQuestion);
        this.emptyQuestion(newQuestion.type);
    }

    addQuestionToBank(clickedQuestion: Question): void {
        delete clickedQuestion[ID];
        this.questionToBank.emit(clickedQuestion);
    }

    modifyQuestionAction(clickedQuestion: Question): void {
        this.submitQuestionButton = ButtonType.MODIFY;
        this.currentQuestion = { ...clickedQuestion };
    }

    deleteQuestion(index: number): void {
        this.quizHandler.deleteQuestionFromQuiz(index);
    }

    onDrop(event: CdkDragDrop<Question[]>): void {
        moveItemInArray(this.quizHandler.quiz.questions, event.previousIndex, event.currentIndex);
    }

    validateQuiz(): boolean {
        return this.quizHandler.validateQuiz();
    }

    isQuizTitleEmpty(): boolean {
        return this.validationService.isStringEmpty(this.quiz.title);
    }

    isDescriptionEmpty(): boolean {
        return this.validationService.isStringEmpty(this.quiz.description);
    }

    submitQuizEvent() {
        this.quizHandler.disableAnimations = true;
        this.quizHandler.prepareQuizBeforeSubmit();
        console.log(this.quiz);
        this.submitQuiz.emit(this.quiz);
    }

    emptyQuizAndRedirect() {
        if (this.quizHandler.quizId)
            this.messageHandlerService.confirmationDialog(ConfirmationMessage.CancelModification, () => this.emptyQuizAndRedirectCallback());
        else this.messageHandlerService.confirmationDialog(ConfirmationMessage.CancelCreation, () => this.emptyQuizAndRedirectCallback());
    }

    trackByFn(_index: number, item: Question) {
        return item.id;
    }

    private emptyQuizAndRedirectCallback() {
        this.quizHandler.emptyQuiz();
        this.router.navigate([AppRoute.ADMIN]);
    }

    private emptyQuestion(questionType?: string) {
        this.currentQuestion =
            questionType === 'QRE' ? JSON.parse(JSON.stringify(EMPTY_QRE_QUESTION)) : JSON.parse(JSON.stringify(EMPTY_QCM_QUESTION));
    }
}
