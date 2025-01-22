import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationMessage } from '@app/constants/enum-class';
import { EMPTY_QUESTION, EMPTY_QUESTION_WITHOUT_CHOICES } from '@app/constants/mock-constants';
import { QuestionType } from '@app/interfaces/question-type';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { BankPanelComponent } from './bank-panel.component';
import SpyObj = jasmine.SpyObj;

describe('BankPanelComponent', () => {
    let component: BankPanelComponent;
    let fixture: ComponentFixture<BankPanelComponent>;
    let questionValidationServiceSpy: SpyObj<QuestionValidationService>;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;

    beforeEach(() => {
        questionValidationServiceSpy = jasmine.createSpyObj('QuestionValidationService', ['isQuestionValid']);
        messageHandlerServiceSpy = jasmine.createSpyObj('MessageHandlerService', ['confirmationDialog']);
        messageHandlerServiceSpy.confirmationDialog.and.callFake((message: string, callback: () => void) => {
            callback();
        });
        TestBed.configureTestingModule({
            declarations: [BankPanelComponent, MatExpansionPanelTitle, MatExpansionPanelDescription, MatExpansionPanelHeader],
            imports: [MatExpansionModule, BrowserAnimationsModule, MatIconModule],
            providers: [
                { provide: QuestionValidationService, useValue: questionValidationServiceSpy },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BankPanelComponent);
        component = fixture.componentInstance;
        component.question = {
            type: QuestionType.QCM,
            text: 'Example Question',
            points: 10,
            choices: [
                { text: 'Answer 1', isCorrect: false },
                { text: 'Answer 2', isCorrect: true },
            ],
            lastModified: '2023-02-18T18:40:10',
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should save the original question and set isEditMode to true', () => {
        const originalQuestion = JSON.parse(JSON.stringify(component.question));
        component.saveQuestionOnEdit();
        expect(component.originalQuestion).toEqual(originalQuestion);
        expect(component.isEditMode).toBeTrue();
    });

    it('should cancel the edit mode and restore the original question when cancelEdit is called', () => {
        component.saveQuestionOnEdit();
        component.question.type = 'ModifiedType';
        component.question.text = 'ModifiedText';
        component.question.points = 20;
        if (component.question.choices) {
            component.question.choices.push({ text: 'NewChoice', isCorrect: true });
        }
        component.cancelEdit();
        expect(component.isEditMode).toBeFalse();
        expect(component.question).toEqual(component.originalQuestion);
    });

    it('should call isQuestionValid of validation service when validQuestion is called', () => {
        component.validQuestion();
        expect(questionValidationServiceSpy.isQuestionValid).toHaveBeenCalled();
    });

    it('should emit questionModified event with the current question and cancel the edit mode when modifyQuestion is called', () => {
        spyOn(component.questionModified, 'emit');
        component.modifyQuestion();
        expect(component.questionModified.emit).toHaveBeenCalledWith(component.question);
        expect(component.isEditMode).toBeFalse();
    });

    it('should emit questionDeleted event with the current question when deleteQuestionCallback is called', () => {
        spyOn(component.questionDeleted, 'emit');
        component['deleteQuestionCallback'](component.question);
        expect(component.questionDeleted.emit).toHaveBeenCalledWith(component.question);
    });

    it('should call confirmationDialog from messageHandlerService if deleteQuestion is called', () => {
        // spy sur une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deleteQuestionCallbackSpy = spyOn<any>(component, 'deleteQuestionCallback');
        component.deleteQuestion();
        expect(messageHandlerServiceSpy.confirmationDialog).toHaveBeenCalledWith(ConfirmationMessage.DeleteQuestion, jasmine.any(Function));
        expect(deleteQuestionCallbackSpy).toHaveBeenCalled();
    });

    it('should emit questionAdded event with the current question when addQuestion is called', () => {
        spyOn(component.questionAdded, 'emit');
        component.addQuestion();
        expect(component.questionAdded.emit).toHaveBeenCalledWith(component.question);
    });

    it('addQuestion should delete question.choices if question is of QRL type before emitting', () => {
        const mockQuestion = JSON.parse(JSON.stringify(EMPTY_QUESTION));
        mockQuestion.type = QuestionType.QRL;
        component.question = mockQuestion;
        const emitSpy = spyOn(component.questionAdded, 'emit');
        component.addQuestion();
        expect(emitSpy).toHaveBeenCalledWith(EMPTY_QUESTION_WITHOUT_CHOICES);
    });

    it('addQuestion should not delete question.choices if question added is of type QCM', () => {
        component.question = EMPTY_QUESTION; // question type is QCM
        const emitSpy = spyOn(component.questionAdded, 'emit');
        component.addQuestion();
        expect(emitSpy).toHaveBeenCalledWith(EMPTY_QUESTION);
    });

    it('should emit cancelQuestionAdd event with the current question when cancelAdd is called', () => {
        spyOn(component.cancelQuestionAdd, 'emit');
        component.cancelAdd();
        expect(component.cancelQuestionAdd.emit).toHaveBeenCalled();
    });

    it('should create an empty question', () => {
        component.emptyQuestion('QCM');
        expect(component.question).toEqual(EMPTY_QUESTION);
    });
});
