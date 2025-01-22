// pour spy sur méthodes privées
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { QUIZ_EXAMPLE } from '@app/constants/mock-constants';
import * as MockImportExport from '@app/constants/mock-import-export';
import * as MockValidationConstants from '@app/constants/mock-validation-constants';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuestionValidationService } from './question-validation.service';

describe('QuestionValidationService', () => {
    let service: QuestionValidationService;
    let commonValidationService: ValidationService;
    let MOCK_QUESTION = MockValidationConstants.MOCK_QUESTION_HAMLET;
    let quiz: Quiz;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ValidationService],
            // pour faire des tests sur les vrais messages d'erreurs obtenus je ne peux pas mock le commonValidationService
        });
        service = TestBed.inject(QuestionValidationService);
        commonValidationService = TestBed.inject(ValidationService);
        MOCK_QUESTION = JSON.parse(JSON.stringify(MockValidationConstants.MOCK_QUESTION_HAMLET));
        quiz = JSON.parse(JSON.stringify(MockImportExport.MOCK_NORMAL_QUIZ));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validateStep method should return false if value isnt a multiple of 10 and vice versa', () => {
        expect(service.validateStep(MockValidationConstants.MOCK_NUMBER)).toBeFalse();
        expect(service.validateStep(MockValidationConstants.MOCK_VALID_POINTS)).toBeTrue();
    });

    it('arePointsInRange method should return true if points are between 10 and 100 inclusively and vice-versa', () => {
        expect(service.arePointsInRange(MockValidationConstants.MOCK_VALID_POINTS)).toBeTrue();
        expect(service.arePointsInRange(MockValidationConstants.MOCK_OUTSIDE_RANGE_POINTS)).toBeFalse();
    });

    it('arePointsValid method should call validateStep and arePointsInRange methods and should use and operator to return result', () => {
        spyOn(service, 'validateStep').and.callFake(() => true);
        spyOn(service, 'arePointsInRange').and.callFake(() => false);
        const shouldBeFalse = service.arePointsValid(MockValidationConstants.MOCK_VALID_POINTS);
        expect(service.validateStep).toHaveBeenCalledWith(MockValidationConstants.MOCK_VALID_POINTS);
        expect(service.arePointsInRange).toHaveBeenCalledWith(MockValidationConstants.MOCK_VALID_POINTS);
        expect(shouldBeFalse).toBeFalse();
    });

    it('isQuestionChoicesInRange should return true if questionchoices length is in range and vice-versa', () => {
        expect(service.isQuestionChoicesInRange(QUIZ_EXAMPLE.questions[0].choices)).toBeTrue();
        expect(service.isQuestionChoicesInRange(MockValidationConstants.MOCK_QUIZ_ONE_QUESTION_CHOICES.questions[0].choices)).toBeFalse();
    });

    it('isQuestionChoicesInRange should return false if questionChoices is undefined', () => {
        expect(service.isQuestionChoicesInRange(undefined)).toBeFalse();
    });

    it('atLeastOneFalseAndOneTrue should return true if there is at least one true and one false questionChoice and vice-versa', () => {
        expect(service.atLeastOneFalseAndOneTrue(MockValidationConstants.MOCK_QUIZ_ONE_QUESTION_CHOICES.questions[0].choices)).toBeFalse();
        expect(service.atLeastOneFalseAndOneTrue(QUIZ_EXAMPLE.questions[0].choices)).toBeTrue();
    });

    it('atLeastOneFalseAndOneTrue should return false if questionChoices is undefined', () => {
        expect(service.atLeastOneFalseAndOneTrue(undefined)).toBeFalse();
    });

    it('areQuestionChoicesTextValid should return false if there is at least one empty questionChoice.text and should return true otherwise', () => {
        expect(service.areQuestionChoicesTextValid(MockValidationConstants.MOCK_WHITESPACE_QUESTION_CHOICES.choices)).toBeFalse();
        expect(service.areQuestionChoicesTextValid(QUIZ_EXAMPLE.questions[0].choices)).toBeTrue();
    });

    it('areQuestionChoicesTextValid should return false if questionChoices is undefined', () => {
        expect(service.areQuestionChoicesTextValid(undefined)).toBeFalse();
    });

    it('isQuestionTitleUnique should return false if question title is not unique and true otherwise (not on questionModification mode)', () => {
        MOCK_QUESTION.text = 'A Very Unique Title';
        expect(
            service.isQuestionTitleUnique(MockValidationConstants.MOCK_QUESTION_HAMLET, MockValidationConstants.MOCK_QUESTIONS_ARRAY, false),
        ).toBeFalse();
        expect(service.isQuestionTitleUnique(MOCK_QUESTION, MockValidationConstants.MOCK_QUESTIONS_ARRAY, false)).toBeTrue();
    });

    it('isQuestionTitleUnique should return false if question title is not unique and true otherwise (on questionModification mode)', () => {
        MOCK_QUESTION.id = 'q2';
        expect(service.isQuestionTitleUnique(MOCK_QUESTION, MockValidationConstants.MOCK_QUESTIONS_ARRAY, true)).toBeTrue();
        MOCK_QUESTION.id = 'q3';
        expect(service.isQuestionTitleUnique(MOCK_QUESTION, MockValidationConstants.MOCK_QUESTIONS_ARRAY, true)).toBeFalse();
    });

    it('isQuestionValid should call proper methods', () => {
        spyOn(commonValidationService, 'isStringEmpty').and.callFake(() => false);
        spyOn(service, 'arePointsValid').and.callFake(() => true);
        spyOn(service, 'areQuestionChoicesTextValid').and.callFake(() => true);
        spyOn(service, 'atLeastOneFalseAndOneTrue').and.callFake(() => true);
        spyOn(commonValidationService, 'areTextsUnique').and.callFake(() => true);
        const shouldBeTrue = service.isQuestionValid(MOCK_QUESTION);
        expect(commonValidationService.isStringEmpty).toHaveBeenCalledWith(MOCK_QUESTION.text);
        expect(service.arePointsValid).toHaveBeenCalledWith(MOCK_QUESTION.points);
        expect(service.areQuestionChoicesTextValid).toHaveBeenCalledWith(MOCK_QUESTION.choices);
        expect(service.atLeastOneFalseAndOneTrue).toHaveBeenCalledWith(MOCK_QUESTION.choices);
        expect(commonValidationService.areTextsUnique).toHaveBeenCalledWith(MOCK_QUESTION.choices);
        expect(shouldBeTrue).toBeTrue();
    });

    it('isQrlChoicesFalsyOrEmpty should return true if qrl.choices is falsy or is an empty array', () => {
        expect(service.isQrlChoicesFalsyOrEmpty([])).toBeTrue();
        expect(service.isQrlChoicesFalsyOrEmpty(null)).toBeTrue();
    });

    it('isQrlChoicesFalsyOrEmpty should return false if qrl.choices is an array with at least 1 element', () => {
        expect(service.isQrlChoicesFalsyOrEmpty([{}])).toBeFalse();
    });

    it('isQuestionTypeValid should return true is question type is QCM or QRL and should return false otherwise', () => {
        expect(service.isQuestionTypeValid(QuestionType.QCM)).toBeTrue();
        expect(service.isQuestionTypeValid(QuestionType.QRL)).toBeTrue();
        expect(service.isQuestionTypeValid('ICM')).toBeFalse();
    });

    it('isQuestionValid should call isQcmValid if question type is QCM', () => {
        spyOn(service, 'isQcmValid');
        spyOn(service, 'isQrlValid');
        service.isQuestionValid(MockValidationConstants.MOCK_QUESTION_HAMLET);
        expect(service.isQcmValid).toHaveBeenCalledWith(MockValidationConstants.MOCK_QUESTION_HAMLET);
        expect(service.isQrlValid).not.toHaveBeenCalled();
    });

    it('isQuestionValid should call isQrlValid if question type is QRL', () => {
        spyOn(service, 'isQcmValid');
        spyOn(service, 'isQrlValid');
        service.isQuestionValid(MockValidationConstants.MOCK_QRL);
        expect(service.isQcmValid).not.toHaveBeenCalled();
        expect(service.isQrlValid).toHaveBeenCalledWith(MockValidationConstants.MOCK_QRL);
    });

    it('isQrlValid should call arePointsValid and isStringEmpty and should return proper boolean result', () => {
        spyOn(service, 'arePointsValid').and.returnValue(true);
        spyOn(commonValidationService, 'isStringEmpty').and.returnValue(false);
        expect(service.isQrlValid(MockValidationConstants.MOCK_QRL)).toBeTrue();
        expect(service.arePointsValid).toHaveBeenCalledWith(MockValidationConstants.MOCK_QRL.points);
        expect(commonValidationService.isStringEmpty).toHaveBeenCalledWith(MockValidationConstants.MOCK_QRL.text);
    });

    it('verifyQuestion should add proper error messages upon incorrect question text, type and points', () => {
        const errorMessages: string[] = [];
        quiz.questions[1].text = '    ';
        quiz.questions[0].type = 3 as unknown as string;
        quiz.questions[0].points = 23;
        quiz.questions.forEach((question, index) => service['verifyQuestion'](question, errorMessages, index + 1));
        expect(errorMessages).toEqual(MockImportExport.EXPECTED_ERRORS_3);
    });

    it('verifyQuestion should add proper error messages upon absent attributes in question', () => {
        const errorMessages: string[] = [];
        MockImportExport.MOCK_QUIZ_BAD_QUESTIONS.questions.forEach((question, index) =>
            service['verifyQuestion'](question as unknown as Question, errorMessages, index + 1),
        );
        expect(errorMessages).toEqual(MockImportExport.EXPECTED_ERRORS_4);
    });

    it('verifyQuestion should call arePointsValid and verifyQuestionChoices', () => {
        const spyVerifyQuestionChoices = spyOn<any>(service, 'verifyQuestionChoices');
        spyVerifyQuestionChoices.and.returnValue(undefined);
        const spyArePointsValid = spyOn(service, 'arePointsValid').and.callThrough();
        service['verifyQuestion'](quiz.questions[0], [], 1);
        expect(service['verifyQuestionChoices']).toHaveBeenCalledWith(quiz.questions[0].choices as QuestionChoice[], [], 1);
        expect(spyArePointsValid).toHaveBeenCalledWith(quiz.questions[0].points);
    });

    it('verifyQuestion should call verifyQuestionAccordingToType', () => {
        spyOn<any>(service, 'verifyQuestionAccordingToType');
        service['verifyQuestion'](quiz.questions[0], [], 1);
        expect(service['verifyQuestionAccordingToType']).toHaveBeenCalledWith(quiz.questions[0], [], 1);
    });

    it('verifyQuestion should add proper error message in array if question type is invalid', () => {
        const errorMessages: string[] = [];
        service['verifyQuestion'](MockImportExport.MOCK_QUESTION_INVALID_TYPE, errorMessages, 1);
        expect(errorMessages).toEqual(['La question #1 doit avoir un champ type valide qui doit être QCM ou QRL']);
    });

    it('verifyQuestionChoices should add proper error messages if choices are in insufficient quantity', () => {
        const errorMessages: string[] = [];
        quiz.questions[1].choices?.pop();
        service['verifyQuestionChoices'](quiz.questions[1].choices as unknown as QuestionChoice[], errorMessages, 2);
        expect(errorMessages).toEqual(MockImportExport.EXPECTED_ERRORS_5);
    });

    it('verifyQuestionChoices should call verifyQuestionChoiceText and isAttributeTypeOf for each questionChoices', () => {
        const spyVerifyQuestionChoiceText = spyOn<any>(service, 'verifyQuestionChoiceText');
        spyVerifyQuestionChoiceText.and.returnValue(undefined);
        const spyIsAttributeTypeOf = spyOn(commonValidationService, 'isAttributeTypeOf').and.callThrough();
        service['verifyQuestionChoices'](quiz.questions[0].choices as QuestionChoice[], [], 1);
        quiz.questions[0].choices?.forEach((choice, indexC) => {
            expect(service['verifyQuestionChoiceText']).toHaveBeenCalledWith(choice, [], { indexQ: 1, indexR: indexC + 1 });
            expect(spyIsAttributeTypeOf).toHaveBeenCalledWith(choice.isCorrect, 'boolean');
        });
    });

    it('verifyQuestionChoices should put isCorrect value to false if it is not true', () => {
        const questionChoices = MockImportExport.MOCK_QUESTION_CHOICES;
        service['verifyQuestionChoices'](questionChoices, [], 1);
        expect(questionChoices).toEqual(MockImportExport.MOCK_QUESTION_CHOICES_AFTER);
    });

    it('verifyQuestionChoices should add proper error message if areTextsUnique returns false', () => {
        const errorMessages: string[] = [];
        spyOn(commonValidationService, 'areTextsUnique').and.returnValue(false);
        const mockQuestionsChoices = JSON.parse(JSON.stringify(MockImportExport.MOCK_QUESTION_CHOICES));
        mockQuestionsChoices[0].isCorrect = true;
        service['verifyQuestionChoices'](mockQuestionsChoices, errorMessages, 1);
        expect(commonValidationService.areTextsUnique).toHaveBeenCalledWith(mockQuestionsChoices);
        expect(errorMessages).toEqual(['La question #1 a des choix de réponses qui ont le même champ "text"']);
    });

    it('verifyQuestionChoiceText should add proper error messages if questionChoice text is incorrect', () => {
        const errorMessages: string[] = [];
        MockImportExport.MOCK_QUIZ_BAD_CHOICES.questions[0].choices.forEach((choice, indexC) => {
            service['verifyQuestionChoiceText'](choice, errorMessages, { indexQ: 1, indexR: indexC + 1 });
        });
        expect(errorMessages).toEqual(MockImportExport.EXPECTED_ERRORS_6);
    });

    it('verifyQuestionAccordingToType should add proper error message if QRL has choices', () => {
        const errorMessages: string[] = [];
        service['verifyQuestionAccordingToType'](MockImportExport.MOCK_QRL_WITH_CHOICES, errorMessages, 1);
        expect(errorMessages).toEqual([
            'La question #1 est de type QRL et elle possède un champ choices invalide. Il faut soit le retirer soit mettre [ ], null, false ou 0',
        ]);
    });

    it('verifyQuestionAccordingToType should add proper error message if QCM has no choices', () => {
        const errorMessages: string[] = [];
        service['verifyQuestionAccordingToType'](MockImportExport.MOCK_QCM_WITHOUT_CHOICES as unknown as Question, errorMessages, 1);
        expect(errorMessages).toEqual(['La question #1 doit avoir un champ choices qui contient les choix de réponse car elle est de type QCM']);
    });
});
