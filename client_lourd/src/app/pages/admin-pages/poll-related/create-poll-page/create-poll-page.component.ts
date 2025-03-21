/* eslint-disable @typescript-eslint/no-magic-numbers*/
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { addQuestionAnimation, deleteQuestionAnimation, gameFormAnimation, questionFormAnimation } from '@app/animations/animation';
import { EMPTY_STRING, MAX_CHOICES, MIN_CHOICES } from '@app/constants/constants';
import { AppRoute, ButtonType, ConfirmationMessage } from '@app/constants/enum-class';
import { EMPTY_POLL_QUESTION } from '@app/constants/mock-constants';
import { Poll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { PollService } from '@app/services/poll.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-create-poll-page',
    templateUrl: './create-poll-page.component.html',
    styleUrls: ['./create-poll-page.component.scss'],
    animations: [addQuestionAnimation, deleteQuestionAnimation, questionFormAnimation, gameFormAnimation],
})
export class CreatePollPageComponent implements AfterViewInit {
    question: Question = JSON.parse(JSON.stringify(EMPTY_POLL_QUESTION));
    submitPollButton: string = ButtonType.CREATE;
    submitQuestionButton: string = ButtonType.ADD;
    showButton: boolean = true;
    private errorObserver: Partial<Observer<Poll[]>> = {
        next: () => {
            this.router.navigate([AppRoute.QUIZMANAGEMENT]);
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    constructor(
        private pollService: PollService,
        private validationService: ValidationService,
        private questionValidationService: QuestionValidationService,
        private router: Router,
        private messageHandlerService: MessageHandlerService,
    ) {}

    get poll(): Poll {
        return this.pollService.poll;
    }

    ngAfterViewInit(): void {
        this.setMinDate();
    }

    drop(event: CdkDragDrop<QuestionChoice[]>) {
        if (this.question.choices) {
            moveItemInArray(this.question.choices, event.previousIndex, event.currentIndex);
        }
    }
    trackByFn(_index: number, item: Question) {
        return item.id;
    }
    onDrop(event: CdkDragDrop<Question[]>): void {
        moveItemInArray(this.poll.questions, event.previousIndex, event.currentIndex);
    }

    editQuestion(index: number) {
        this.question = this.poll.questions[index];
        this.submitQuestionButton = ButtonType.MODIFY;
    }

    deleteQuestion(index: number) {
        if (this.submitQuestionButton === ButtonType.MODIFY && this.question.id === this.poll.questions[index].id) {
            this.submitQuestionButton = ButtonType.ADD;
            this.emptyQuestion();
        }
        this.pollService.deleteQuestionFromPoll(index);
    }

    addQuestion() {
        console.log('addQuestion');
        if (this.submitQuestionButton === ButtonType.MODIFY) {
            this.pollService.modifyQuestionInQuiz(this.question);
            this.submitQuestionButton = ButtonType.ADD;
            this.emptyQuestion();
            return;
        }
        this.pollService.addQuestionToPoll(this.question);
        this.emptyQuestion();
    }

    isPollTitleEmpty(): boolean {
        return this.validationService.isStringEmpty(this.poll.title);
    }
    areQuestionChoicesTextValid() {
        return this.questionValidationService.areQuestionChoicesTextValid(this.question.choices);
    }
    isDescriptionEmpty(): boolean {
        return this.validationService.isStringEmpty(this.poll.description);
    }
    isQuestionTextValid() {
        return this.validationService.isStringEmpty(this.question.text);
    }
    isDateValid(): boolean {
        if (!this.poll.endDate) {
            return false; // Aucune date sélectionnée
        }

        const selectedDate = new Date(this.poll.endDate);
        const now = new Date();
        now.setSeconds(0, 0); // Ignore les millisecondes et secondes pour éviter des problèmes de précision

        return selectedDate <= now;
    }

    deleteAnswer(index: number): void {
        if (this.question.choices && this.question.choices.length > MIN_CHOICES) {
            this.question.choices.splice(index, 1);
        }
    }
    addAnswer(): void {
        if (this.question.choices && this.question.choices.length < MAX_CHOICES) this.question.choices.push({ text: EMPTY_STRING, isCorrect: false });
    }
    validUniqueChoiceTexts() {
        return this.validationService.areTextsUnique(this.question.choices);
    }
    resetAnswers(): void {
        this.question = JSON.parse(JSON.stringify(EMPTY_POLL_QUESTION));
    }
    emptyPollAndRedirect() {
        console.log('emptyPollAndRedirect avec ', this.poll.id);
        if (this.poll.id)
            this.messageHandlerService.confirmationDialog(ConfirmationMessage.CancelPollModification, () => this.emptyPollAndRedirectCallback());
        else this.messageHandlerService.confirmationDialog(ConfirmationMessage.CancelPollCreation, () => this.emptyPollAndRedirectCallback());
    }

    validatePoll(): boolean {
        return (
            !this.validationService.isStringEmpty(this.poll.title) &&
            !this.validationService.isStringEmpty(this.poll.description) &&
            Array.isArray(this.poll.questions) &&
            this.poll.questions.length >= 1
        );
    }
    submitPollEvent() {
        /* this.pollService.disableAnimations = true; */
        if (this.poll.id) {
            this.pollService.updatePoll(this.poll.id, this.poll).subscribe(this.errorObserver);
            return;
        }
        this.pollService.createPoll(this.poll).subscribe(this.errorObserver);
        this.emptyPollAndRedirectCallback();
    }
    private emptyPollAndRedirectCallback() {
        this.resetAnswers();
        this.pollService.emptyPoll();
        this.router.navigate([AppRoute.POLLS]);
    }
    private emptyQuestion() {
        const id = this.question.id;
        this.question = JSON.parse(JSON.stringify(EMPTY_POLL_QUESTION));

        this.question.id = id;
    }
    private setMinDate(): void {
        const dateTimeInput = document.querySelector<HTMLInputElement>('#dateTimePicker');

        if (dateTimeInput) {
            const updateMinDateTime = () => {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Ajustement fuseau horaire

                const minDateTime = now.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM
                dateTimeInput.setAttribute('min', minDateTime);

                // Vérifier si la valeur sélectionnée est devenue invalide
                const selectedDateTime = new Date(dateTimeInput.value);
                if (selectedDateTime < now) {
                    dateTimeInput.value = minDateTime; // Réinitialiser si la valeur devient invalide
                }
            };

            // Mettre à jour immédiatement et ensuite toutes les secondes
            updateMinDateTime();
            setInterval(updateMinDateTime, 1000);
        }
    }
}
