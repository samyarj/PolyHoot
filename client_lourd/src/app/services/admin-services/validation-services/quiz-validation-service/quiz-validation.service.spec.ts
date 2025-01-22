import { TestBed } from '@angular/core/testing';
import { EMPTY_QUIZ, MOCK_QUIZ, MOCK_QUIZZES_ADMIN } from '@app/constants/mock-constants';
import * as MockImportExport from '@app/constants/mock-import-export';
import { Quiz } from '@app/interfaces/quiz';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuizValidationService } from './quiz-validation.service';

describe('QuizValidationService', () => {
    let service: QuizValidationService;
    const wantedAttributesInQuiz: string[] = ['title', 'description', 'duration', 'questions'];
    let commonValidationService: ValidationService;
    let quiz: Quiz;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ValidationService],
            // pour faire des tests sur les vrais messages d'erreurs obtenus je ne peux pas mock le commonValidationService
        });
        service = TestBed.inject(QuizValidationService);
        commonValidationService = TestBed.inject(ValidationService);
        quiz = JSON.parse(JSON.stringify(MockImportExport.MOCK_NORMAL_QUIZ));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isQuestionsArrayValid should return false if question array is empty', () => {
        const result = service.isQuestionsArrayValid(EMPTY_QUIZ.questions);
        expect(result).toBeFalse();
    });

    it('isQuestionsArrayValid should return false if the questions attribute of the Quiz is not an array', () => {
        const result = service.isQuestionsArrayValid('not an array');
        expect(result).toBeFalse();
    });

    it('isQuestionsArrayValid should return true if questions array has at least 1 question', () => {
        const result = service.isQuestionsArrayValid(MOCK_QUIZ.questions);
        expect(result).toBeTrue();
    });

    it('method isQuizTitleUnique should return false if title is not unique and true otherwise', () => {
        expect(service.isQuizTitleUnique('NestJS Framework Challenge', MOCK_QUIZZES_ADMIN)).toBeFalse();
        expect(service.isQuizTitleUnique('My very unique quiz', MOCK_QUIZZES_ADMIN)).toBeTrue();
    });

    it('method isQuizTitleUnique should return false if title is not unique even if user tries to make it look "unique" ', () => {
        expect(service.isQuizTitleUnique('  NestJS   FraMewOrk ChAllenge  ', MOCK_QUIZZES_ADMIN)).toBeFalse();
    });

    it('isQuizValid shoud call proper methods', () => {
        spyOn(commonValidationService, 'isStringEmpty').and.callFake(() => false);
        spyOn(service, 'isQuestionsArrayValid').and.callFake(() => true);
        const shouldBeTrue = service.isQuizValid(MOCK_QUIZ);
        expect(commonValidationService.isStringEmpty).toHaveBeenCalledTimes(2);
        expect(commonValidationService.isStringEmpty).toHaveBeenCalledWith(MOCK_QUIZ.title);
        expect(commonValidationService.isStringEmpty).toHaveBeenCalledWith(MOCK_QUIZ.description);
        expect(service.isQuestionsArrayValid).toHaveBeenCalledWith(MOCK_QUIZ.questions);
        expect(shouldBeTrue).toBeTrue();
    });

    it('verifyQuizAttribute should add proper error messages if title, description, duration or questions are incorrect', () => {
        const errorMessages: string[] = [];
        quiz.title = '   ';
        quiz.description = '';
        quiz.duration = '0' as unknown as number;
        quiz.questions = [];
        wantedAttributesInQuiz.forEach((attribute) => service['verifyQuizAttribute'](errorMessages, attribute, quiz));
        expect(errorMessages).toEqual(MockImportExport.EXPECTED_ERRORS_1);
    });

    it('verifyQuizAttribute should add proper error messages if mandatory quiz attribute are missing', () => {
        const errorMessages: string[] = [];
        wantedAttributesInQuiz.forEach((attribute) =>
            service['verifyQuizAttribute'](errorMessages, attribute, MockImportExport.MOCK_INCOMPLETE_QUIZ as Quiz),
        );
        expect(errorMessages).toEqual(MockImportExport.EXPECTED_ERRORS_2);
    });

    it('verifyQuizAttribute should add proper error messages if some questions have identical text attributes', () => {
        const errorMessages: string[] = [];
        spyOn(commonValidationService, 'areTextsUnique');
        const quizDuplicateQuestions = JSON.parse(JSON.stringify(MockImportExport.MOCK_NORMAL_QUIZ));
        quizDuplicateQuestions.questions[0].text = quizDuplicateQuestions.questions[1].text;
        service['verifyQuizAttribute'](errorMessages, 'questions', quizDuplicateQuestions);
        expect(errorMessages).toEqual(['Certaines questions ont le même champ "text"']);
        expect(commonValidationService.areTextsUnique).toHaveBeenCalledWith(quizDuplicateQuestions.questions);
    });

    it('verifyQuizAttribute should not call areTextUnique if the array of questions is not valid', () => {
        const errorMessages: string[] = [];
        spyOn(commonValidationService, 'areTextsUnique');
        service['verifyQuizAttribute'](errorMessages, 'questions', MockImportExport.MOCK_INCOMPLETE_QUIZ as unknown as Quiz);
        expect(commonValidationService.areTextsUnique).not.toHaveBeenCalled();
    });
});
