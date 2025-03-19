import { Component } from '@angular/core';
import { Poll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';

@Component({
    selector: 'app-create-poll',
    templateUrl: './create-poll.component.html',
    styleUrls: ['./create-poll.component.scss'],
})
export class CreatePollComponent {
    poll: Poll = {
        title: '',
        questions: [],
        choices: [],
        expired: false,
        expireDate: new Date(),
    };
    currentQuestion: Question = {
        type: 'QCM',
        points: 0,
        text: '',
        choices: [],
        image: '',
    };
    constructor(
        private validationService: ValidationService,
        private questionValidationService: QuestionValidationService,
    ) {}

    addQuestion() {
        this.poll.questions.push({
            type: 'QCM',
            points: 0,
            text: this.currentQuestion.text,
            choices: this.currentQuestion.choices,
            image: this.currentQuestion.image,
        });
        this.currentQuestion = this.poll.questions[this.poll.questions.length - 1];
    }

    editQuestion(index: number) {
        this.currentQuestion = this.poll.questions[index];
    }

    deleteQuestion(index: number) {
        this.poll.questions.splice(index, 1);
        this.currentQuestion = {
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
}
