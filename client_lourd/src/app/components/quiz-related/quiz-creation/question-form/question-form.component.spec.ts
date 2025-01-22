import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { STEP } from '@app/constants/constants';
import { EMPTY_QUESTION, EMPTY_QUESTION_WITHOUT_CHOICES, MOCK_QUESTION } from '@app/constants/mock-constants';
import { MOCK_QUESTION_CHOICES, MOCK_QUESTION_CHOICES_AFTER } from '@app/constants/mock-import-export';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { QuestionType } from '@app/interfaces/question-type';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { QuestionFormComponent } from './question-form.component';
import SpyObj = jasmine.SpyObj;

describe('QuestionFormComponent', () => {
    let component: QuestionFormComponent;
    let fixture: ComponentFixture<QuestionFormComponent>;
    let commonValidationServiceSpy: SpyObj<ValidationService>;
    let questionValidationServiceSpy: SpyObj<QuestionValidationService>;

    beforeEach(async () => {
        commonValidationServiceSpy = jasmine.createSpyObj('ValidationService', ['areTextsUnique', 'isStringEmpty']);
        questionValidationServiceSpy = jasmine.createSpyObj('QuestionValidationService', [
            'validateStep',
            'isQuestionValid',
            'atLeastOneFalseAndOneTrue',
            'areQuestionChoicesTextValid',
        ]);
        await TestBed.configureTestingModule({
            imports: [FormsModule, DragDropModule, MatTooltipModule],
            declarations: [QuestionFormComponent],
            providers: [
                { provide: ValidationService, useValue: commonValidationServiceSpy },
                { provide: QuestionValidationService, useValue: questionValidationServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionFormComponent);
        component = fixture.componentInstance;
        component.question = deepCloneQuestion(MOCK_QUESTION);
        fixture.detectChanges();
    });

    const deepCloneQuestion = (question: Question) => JSON.parse(JSON.stringify(question));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit the current question and reset answers when submitQuestion is called', () => {
        spyOn(component.questionSubmitted, 'emit');
        spyOn(component, 'resetAnswers').and.callThrough();

        component.submitQuestion();

        expect(component.questionSubmitted.emit).toHaveBeenCalledWith(component.question);
        expect(component.resetAnswers).toHaveBeenCalled();
    });

    it('should toggle the isCorrect property of a choice', () => {
        const choiceIndex = 0;
        const initialIsCorrect = component.question.choices?.[choiceIndex].isCorrect;
        if (component.question.choices) component.toggleAnswer(component.question.choices[choiceIndex]);

        expect(component.question.choices?.[choiceIndex].isCorrect).toBe(!initialIsCorrect);
    });

    it('should add a new answer if below MAX_CHOICES', () => {
        const oldLength = component.question.choices?.length || 0;
        component.addAnswer();

        expect(component.question.choices?.length).toBe(oldLength + 1);
        expect(component.question.choices?.[oldLength]).toEqual({ text: '', isCorrect: false });
    });

    it('should not add a new answer if at MAX_CHOICES', () => {
        for (let i = 0; i < 3; i++) {
            component.addAnswer();
        }
        const oldLength = component.question.choices?.length || 0;
        component.addAnswer();

        expect(component.question.choices?.length).toBe(oldLength);
    });

    it('should delete an answer if above MIN_CHOICES', () => {
        component.addAnswer();
        const initialLength = component.question.choices?.length || 0;

        component.deleteAnswer(0);
        expect(component.question.choices?.length).toBe(initialLength - 1);
    });

    it('should call validateStep of Validation Service when validateStep Is called', () => {
        questionValidationServiceSpy.validateStep.and.returnValue(true);
        const value = STEP;
        const result = component.validateStep(value);
        expect(questionValidationServiceSpy.validateStep).toHaveBeenCalledWith(value);
        expect(result).toBeTruthy();
    });

    it('should call isQuestionValid of Validation Service when validQuestion is called', () => {
        questionValidationServiceSpy.isQuestionValid.and.returnValue(true);
        const result = component.validQuestion();
        expect(questionValidationServiceSpy.isQuestionValid).toHaveBeenCalled();
        expect(result).toBeTruthy();
    });

    it('should emit an event when resetAnswers is called', () => {
        spyOn(component.emptyQuestion, 'emit');

        component.resetAnswers();

        expect(component.emptyQuestion.emit).toHaveBeenCalled();
    });

    it('should reorder question choices when onDrop is called', () => {
        const choice1: QuestionChoice = { text: 'Choice 1', isCorrect: true };
        const choice2: QuestionChoice = { text: 'Choice 2', isCorrect: false };
        component.question.choices = [choice1, choice2];
        component.drop({
            previousIndex: 0,
            currentIndex: 1,
            item: {} as CdkDrag<QuestionChoice>,
            container: {} as CdkDropList<QuestionChoice[]>,
            previousContainer: {} as CdkDropList<QuestionChoice[]>,
            isPointerOverContainer: true,
            distance: { x: 0, y: 0 },
        } as CdkDragDrop<QuestionChoice[]>);
        expect(component.question.choices[0]).toEqual(choice2);
        expect(component.question.choices[1]).toEqual(choice1);
    });

    it('hasAtLeastOneTrueAndFalseChoice should call atLeastOneFalseAndOneTrue from validationService', () => {
        questionValidationServiceSpy.atLeastOneFalseAndOneTrue.and.returnValue(false);
        component.question.choices = MOCK_QUESTION_CHOICES;
        const result = component.hasAtLeastOneTrueAndFalseChoice();
        expect(result).toBeFalse();
        expect(questionValidationServiceSpy.atLeastOneFalseAndOneTrue).toHaveBeenCalledWith(MOCK_QUESTION_CHOICES);
    });

    it('validUniqueChoiceTexts should call areTextsUnique from validationService', () => {
        component.question.choices = MOCK_QUESTION_CHOICES_AFTER;
        commonValidationServiceSpy.areTextsUnique.and.returnValue(true);
        const result = component.validUniqueChoiceTexts();
        expect(result).toBeTrue();
        expect(commonValidationServiceSpy.areTextsUnique).toHaveBeenCalledWith(MOCK_QUESTION_CHOICES_AFTER);
    });

    it('areQuestionChoicesTextValid should call areQuestionChoicesTextValid from validationService', () => {
        component.question.choices = MOCK_QUESTION_CHOICES_AFTER;
        questionValidationServiceSpy.areQuestionChoicesTextValid.and.returnValue(true);
        const result = component.areQuestionChoicesTextValid();
        expect(result).toBeTrue();
        expect(questionValidationServiceSpy.areQuestionChoicesTextValid).toHaveBeenCalledWith(MOCK_QUESTION_CHOICES_AFTER);
    });

    it('OnQuestionTypeChange should modify question.type according to the current value of questionType such as QRL', () => {
        component.questionType = QuestionType.QRL;
        component.onQuestionTypeChange();
        expect(component.question.type).toEqual(QuestionType.QRL);
    });

    it('OnQuestionTypeChange should modify question.type according to the current value of questionType such as QCM', () => {
        component.questionType = QuestionType.QCM;
        component.onQuestionTypeChange();
        expect(component.question.type).toEqual(QuestionType.QCM);
    });

    it('when a non-empty question is received as input, ngOnChanges() should update questionType and should put isTypeLocked to true', () => {
        const mockQuestion = JSON.parse(JSON.stringify(EMPTY_QUESTION));
        mockQuestion.text = 'Qui est le chargé de laboratoire le plus gentil ?';
        component.question = mockQuestion;
        component.ngOnChanges();
        expect(component.questionType).toEqual(QuestionType.QCM);
        expect(component.isTypeLocked).toBeTrue();
    });

    it('when an empty question is received as input, ngOnChanges should put typeLocked to false and put the same question type as before', () => {
        component.questionType = QuestionType.QRL;
        component.question = deepCloneQuestion(EMPTY_QUESTION);
        component.ngOnChanges();
        expect(component.isTypeLocked).toBeFalse();
        expect(component.question.type).toEqual(QuestionType.QRL);
    });

    it('submitQuestion should delete question.choices if question is of type QRL before calling emit', () => {
        const mockQuestion = JSON.parse(JSON.stringify(EMPTY_QUESTION));
        mockQuestion.type = QuestionType.QRL;
        component.question = mockQuestion;
        const emitSpy = spyOn(component.questionSubmitted, 'emit');
        component.submitQuestion();
        expect(emitSpy).toHaveBeenCalledWith(EMPTY_QUESTION_WITHOUT_CHOICES);
    });
});
