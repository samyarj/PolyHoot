/* eslint-disable @typescript-eslint/no-magic-numbers*/
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { addQuestionAnimation, deleteQuestionAnimation, pollFormAnimation, questionFormAnimation } from '@app/animations/animation';
import { EMPTY_STRING, MAX_CHOICES, MIN_CHOICES } from '@app/constants/constants';
import { AppRoute, ButtonType, ConfirmationMessage } from '@app/constants/enum-class';
import { EMPTY_POLL_QUESTION } from '@app/constants/mock-constants';
import { Poll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { CreatePollService } from '@app/services/poll-services/create-poll.service';
import { Observer, tap } from 'rxjs';

@Component({
    selector: 'app-create-poll-page',
    templateUrl: './create-poll-page.component.html',
    styleUrls: ['./create-poll-page.component.scss'],
    animations: [addQuestionAnimation, deleteQuestionAnimation, questionFormAnimation, pollFormAnimation],
})
export class CreatePollPageComponent implements AfterViewInit {
    question: Question = JSON.parse(JSON.stringify(EMPTY_POLL_QUESTION));
    submitPollButton: string = ButtonType.CREATE;
    submitQuestionButton: string = ButtonType.ADD;
    showButton: boolean = true;
    private errorObserver: Partial<Observer<Poll[]>> = {
        next: () => {
            this.router.navigate([AppRoute.POLLS]);
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    constructor(
        private createPollService: CreatePollService,
        private validationService: ValidationService,
        private questionValidationService: QuestionValidationService,
        private router: Router,
        private messageHandlerService: MessageHandlerService,
    ) {}

    get poll(): Poll {
        return this.createPollService.poll;
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
        this.createPollService.deleteQuestionFromPoll(index);
    }

    addQuestion() {
        if (this.submitQuestionButton === ButtonType.MODIFY) {
            this.createPollService.modifyQuestionInPoll(this.question);
            this.submitQuestionButton = ButtonType.ADD;
            this.emptyQuestion();
            return;
        }
        this.createPollService.addQuestionToPoll(this.question);
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
    isQuestionTextEmpty() {
        return this.validationService.isStringEmpty(this.question.text);
    }
    isDateValid(): boolean {
        if (!this.poll.endDate) {
            return false; // Aucune date sélectionnée
        }

        const selectedDate = new Date(this.poll.endDate);
        const now = new Date();
        now.setSeconds(0, 0); // Ignore les millisecondes et secondes pour éviter des problèmes de précision

        return selectedDate >= now;
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
            this.isDateValid() &&
            !this.isPollTitleEmpty() &&
            !this.isDescriptionEmpty() &&
            Array.isArray(this.poll.questions) &&
            this.poll.questions.length >= 1
        );
    }
    validQuestion(): boolean {
        console.log('1: ', this.areQuestionChoicesTextValid());
        console.log('2: ', this.validUniqueChoiceTexts());
        console.log('3: ', this.isQuestionTextEmpty());
        return this.areQuestionChoicesTextValid() && this.validUniqueChoiceTexts() && !this.isQuestionTextEmpty();
    }
    submitPollEvent() {
        /* this.createPollService.disableAnimations = true; */
        if (this.poll.id) {
            this.createPollService.updatePoll(this.poll.id, this.poll).subscribe(this.errorObserver);
            this.createPollService.updatePoll(this.poll.id, this.poll).subscribe(() => {
                console.log('✅ Sondage modifié, maintenant on redirige...');
                this.emptyPollAndRedirectCallback();
            });
            return;
        }
        this.createPollService
            .createPoll(this.poll)
            .pipe(
                tap(() => {
                    console.log('✅ Sondage créé, maintenant on redirige...');
                    this.emptyPollAndRedirectCallback();
                }),
            )
            .subscribe(this.errorObserver);
    }
    private emptyPollAndRedirectCallback() {
        this.resetAnswers();
        this.createPollService.emptyPoll();
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
