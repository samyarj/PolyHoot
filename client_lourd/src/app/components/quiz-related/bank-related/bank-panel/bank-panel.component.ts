import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfirmationMessage } from '@app/constants/enum-class';
import { EMPTY_QCM_QUESTION, EMPTY_QRE_QUESTION } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';

@Component({
    selector: 'app-bank-panel',
    templateUrl: './bank-panel.component.html',
    styleUrls: ['./bank-panel.component.scss'],
})
export class BankPanelComponent {
    @Input() question: Question;

    @Input() expanded: boolean = false;
    @Input() expansionPanelDisabled: boolean = false;
    @Input() isEditMode: boolean = false;

    @Output() questionModified = new EventEmitter<Question>();
    @Output() questionDeleted = new EventEmitter<Question>();
    @Output() questionAdded = new EventEmitter<Question>();
    @Output() cancelQuestionAdd = new EventEmitter<Question>();

    originalQuestion: Question;
    panelOpenState: boolean;

    constructor(
        private questionValidationService: QuestionValidationService,
        private messageHandlerService: MessageHandlerService,
    ) {}

    saveQuestionOnEdit() {
        this.originalQuestion = JSON.parse(JSON.stringify(this.question));
        this.isEditMode = true;
    }
    onQuestionSubmitted(newQuestion: Question): void {
        this.question = newQuestion;
    }
    cancelEdit() {
        this.question.type = this.originalQuestion.type;
        this.question.text = this.originalQuestion.text;
        this.question.points = this.originalQuestion.points;
        this.question.choices = this.originalQuestion.choices;
        this.question.qreAttributes = this.originalQuestion.qreAttributes;
        this.question.image = this.originalQuestion.image;
        this.question.lastModified = this.originalQuestion.lastModified;
        this.isEditMode = false;
    }

    validQuestion(): boolean {
        console.log(this.question);
        return this.questionValidationService.isQuestionValid(this.question);
    }

    modifyQuestion() {
        this.questionModified.emit(this.question);
    }

    addQuestion() {
        if (this.question.type === 'QRL' || this.question.type === 'QRE') delete this.question['choices'];
        this.questionAdded.emit(this.question);
    }

    cancelAdd() {
        this.cancelQuestionAdd.emit();
    }

    emptyQuestion(questionType: string): void {
        this.question = questionType === 'QRE' ? this.deepCloneQuestion(EMPTY_QRE_QUESTION) : this.deepCloneQuestion(EMPTY_QCM_QUESTION);
        this.question.type = questionType;
    }

    deleteQuestion() {
        this.messageHandlerService.confirmationDialog(ConfirmationMessage.DeleteQuestion, () => this.deleteQuestionCallback(this.question));
    }

    private deleteQuestionCallback(questionToDelete: Question) {
        this.questionDeleted.emit(questionToDelete);
    }

    private deepCloneQuestion(question: Question): Question {
        return JSON.parse(JSON.stringify(question));
    }
}
