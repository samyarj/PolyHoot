import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { EMPTY_STRING, MAX_CHOICES, MIN_CHOICES } from '@app/constants/constants';
import { ButtonType } from '@app/constants/enum-class';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { QuestionType } from '@app/interfaces/question-type';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';

@Component({
    selector: 'app-question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.scss'],
})
export class QuestionFormComponent implements OnChanges {
    @Input() question: Question;
    @Output() questionSubmitted = new EventEmitter<Question>();
    @Output() emptyQuestion = new EventEmitter<string>();
    @Input() showButton: boolean = true;
    @Input() submitButton: string = ButtonType.ADD;
    questionType: string = QuestionType.QCM;
    isTypeLocked: boolean = false;

    constructor(
        private questionValidationService: QuestionValidationService,
        private commonValidationService: ValidationService,
    ) {}

    submitQuestion() {
        if (this.question.type === QuestionType.QRL) delete this.question['choices'];
        this.questionSubmitted.emit(this.question);
        this.resetAnswers();
    }

    toggleAnswer(choice: QuestionChoice): void {
        choice.isCorrect = !choice.isCorrect;
    }

    addAnswer(): void {
        if (this.question.choices && this.question.choices.length < MAX_CHOICES) this.question.choices.push({ text: EMPTY_STRING, isCorrect: false });
    }

    deleteAnswer(index: number): void {
        if (this.question.choices && this.question.choices.length > MIN_CHOICES) {
            this.question.choices.splice(index, 1);
        }
    }

    validateStep(value: number): boolean {
        return this.questionValidationService.validateStep(value);
    }

    validQuestion(): boolean {
        return this.questionValidationService.isQuestionValid(this.question);
    }

    resetAnswers(): void {
        this.emptyQuestion.emit(this.questionType);
    }

    hasAtLeastOneTrueAndFalseChoice(): boolean {
        return this.questionValidationService.atLeastOneFalseAndOneTrue(this.question.choices);
    }

    drop(event: CdkDragDrop<QuestionChoice[]>) {
        if (this.question.choices) {
            moveItemInArray(this.question.choices, event.previousIndex, event.currentIndex);
        }
    }

    validUniqueChoiceTexts() {
        return this.commonValidationService.areTextsUnique(this.question.choices);
    }

    areQuestionChoicesTextValid() {
        return this.questionValidationService.areQuestionChoicesTextValid(this.question.choices);
    }

    isQuestionTextValid() {
        return this.commonValidationService.isStringEmpty(this.question.text);
    }

    onQuestionTypeChange() {
        if (this.questionType === QuestionType.QRL) this.question.type = QuestionType.QRL;
        else if (this.questionType === QuestionType.QCM) this.question.type = QuestionType.QCM;
    }

    ngOnChanges() {
        if (this.question) {
            if (this.question.text) {
                this.questionType = this.question.type;
                this.isTypeLocked = true;
            } else {
                this.question.type = this.questionType;
                this.isTypeLocked = false;
            }
        }
    }
}
