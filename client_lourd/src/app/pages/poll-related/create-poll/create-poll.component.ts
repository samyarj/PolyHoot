/* eslint-disable @typescript-eslint/no-magic-numbers*/
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY_STRING, MAX_CHOICES, MIN_CHOICES } from '@app/constants/constants';
import { AppRoute, ButtonType, ConfirmationMessage } from '@app/constants/enum-class';
import { EMPTY_POLL } from '@app/constants/mock-constants';
import { Poll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { PollService } from '@app/services/poll.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-create-poll',
    templateUrl: './create-poll.component.html',
    styleUrls: ['./create-poll.component.scss'],
})
export class CreatePollComponent {
    poll: Poll = {
        title: '',
        description: '',
        questions: [],
        expired: false,
        expireDate: new Date(9999, 1, 1),
    };
    question: Question = {
        type: 'QCM',
        points: 0,
        text: '',
        choices: [],
        image: '',
    };
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

    addQuestion() {
        this.poll.questions.push({
            type: 'QCM',
            points: 0,
            text: this.question.text,
            choices: this.question.choices,
            image: this.question.image,
        });
        this.question = this.poll.questions[this.poll.questions.length - 1];
    }

    editQuestion(index: number) {
        this.question = this.poll.questions[index];
    }

    deleteQuestion(index: number) {
        this.poll.questions.splice(index, 1);
        this.question = {
            type: 'QCM',
            points: 0,
            text: '',
            choices: [],
            image: '',
        };
    }

    submitQuestion() {
        // Logique pour soumettre la question
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
        this.question = JSON.parse(JSON.stringify(EMPTY_POLL));
    }
    emptyPollAndRedirect() {
        if (this.poll.id)
            this.messageHandlerService.confirmationDialog(ConfirmationMessage.CancelModification, () => this.emptyPollAndRedirectCallback());
        else this.messageHandlerService.confirmationDialog(ConfirmationMessage.CancelCreation, () => this.emptyPollAndRedirectCallback());
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
        // this.pollHandler.disableAnimations = true;
        if (this.poll.id) {
            this.pollService.updatePoll(this.poll.id, this.poll).subscribe(this.errorObserver);
            return;
        }
        this.pollService.createPoll(this.poll).subscribe(this.errorObserver);
    }
    private emptyPollAndRedirectCallback() {
        this.resetAnswers();
        this.router.navigate([AppRoute.QUIZMANAGEMENT]);
    }
}
