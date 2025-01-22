import { TestBed } from '@angular/core/testing';
import { EMPTY_QUIZ, MOCK_QUESTION, MOCK_QUIZ } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { QuizValidationService } from '@app/services/admin-services/validation-services/quiz-validation-service/quiz-validation.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { QuizHandlerService } from './quiz-handler.service';

describe('QuizHandlerService', () => {
    let service: QuizHandlerService;
    let quizValidationServiceSpy: jasmine.SpyObj<QuizValidationService>;
    let questionValidationServiceSpy: jasmine.SpyObj<QuestionValidationService>;

    let messageHandlerServiceSpy: jasmine.SpyObj<MessageHandlerService>;
    const deepCloneQuestion = (quiz: Question) => JSON.parse(JSON.stringify(quiz));

    beforeEach(() => {
        quizValidationServiceSpy = jasmine.createSpyObj('QuizValidationService', ['isQuizValid']);
        questionValidationServiceSpy = jasmine.createSpyObj('QuestionValidationService', ['isQuestionTitleUnique']);

        messageHandlerServiceSpy = jasmine.createSpyObj('MessageHandlerService', ['popUpErrorDialog']);

        TestBed.configureTestingModule({
            providers: [
                { provide: QuizValidationService, useValue: quizValidationServiceSpy },
                { provide: QuestionValidationService, useValue: questionValidationServiceSpy },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
        });
        service = TestBed.inject(QuizHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should empty the quiz', () => {
        service.quiz = MOCK_QUIZ;
        service.emptyQuiz();
        expect(service.quiz).toEqual(EMPTY_QUIZ);
    });

    it('should validate the quiz', () => {
        quizValidationServiceSpy.isQuizValid.and.returnValue(true);
        expect(service.validateQuiz()).toBeTrue();
    });

    it('should prepare the quiz before submit', () => {
        service.quiz = MOCK_QUIZ;
        service.prepareQuizBeforeSubmit();
        expect(service.quiz.visibility).toBeFalse();
        expect(service.quiz.lastModification).toBeDefined();
        service.quiz.questions.forEach((question) => expect(question.id).toBeUndefined());
        expect(service.quiz.id).toBeUndefined();
    });

    it('should generate an id for a new question before adding it to the quiz', () => {
        questionValidationServiceSpy.isQuestionTitleUnique.and.returnValue(true);
        service.addQuestionToQuiz(MOCK_QUESTION);
        const addedQuestion = service.quiz.questions.find((q) => q.text === MOCK_QUESTION.text);

        expect(addedQuestion).toBeDefined();
        expect(addedQuestion?.id).toBeDefined();
    });

    it('should add a question to the quiz', () => {
        const clickedQuestion = MOCK_QUIZ.questions[0];
        questionValidationServiceSpy.isQuestionTitleUnique.and.returnValue(true);
        service.addQuestionToQuiz(clickedQuestion);
        expect(service.quiz.questions).toContain(clickedQuestion);
    });

    it('should not add a question to the quiz if the title is not unique', () => {
        const clickedQuestion = MOCK_QUIZ.questions[0];
        questionValidationServiceSpy.isQuestionTitleUnique.and.returnValue(false);
        service.addQuestionToQuiz(clickedQuestion);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalled();
    });

    it('should modify a question in the quiz', () => {
        const existingQuestion = deepCloneQuestion(MOCK_QUIZ.questions[0]);
        const updatedQuestion = { ...existingQuestion, text: 'Updated Question' };
        service.quiz.questions.push(existingQuestion);
        questionValidationServiceSpy.isQuestionTitleUnique.and.returnValue(true);
        service.modifyQuestionInQuiz(updatedQuestion);
        expect(service.quiz.questions).toContain(jasmine.objectContaining({ text: 'Updated Question' }));
    });

    it('should not modify a question in the quiz if the title is not unique', () => {
        const newQuestion = MOCK_QUIZ.questions[0];
        questionValidationServiceSpy.isQuestionTitleUnique.and.returnValue(false);
        service.modifyQuestionInQuiz(newQuestion);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalled();
    });

    it('should not modify a question in the quiz if the question does not exist', () => {
        const newQuestion = MOCK_QUIZ.questions[0];
        questionValidationServiceSpy.isQuestionTitleUnique.and.returnValue(true);
        service.modifyQuestionInQuiz(newQuestion);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalled();
    });

    it('should delete a question from the quiz', () => {
        service.quiz.questions = [
            { ...deepCloneQuestion(MOCK_QUESTION), id: 'id-1', text: 'Question 1' },
            { ...deepCloneQuestion(MOCK_QUESTION), id: 'id-2', text: 'Question 2' },
            { ...deepCloneQuestion(MOCK_QUESTION), id: 'id-3', text: 'Question 3' },
        ];
        const indexToDelete = 1;
        service.deleteQuestionFromQuiz(indexToDelete);
        expect(service.quiz.questions.length).toBe(2);
        expect(service.quiz.questions[indexToDelete].id).toBe('id-3');
    });

    it('should deep clone a quiz', () => {
        const clonedQuiz = service['deepCloneQuiz'](MOCK_QUIZ);
        expect(clonedQuiz).toEqual(MOCK_QUIZ);
        expect(clonedQuiz).not.toBe(MOCK_QUIZ);
    });
});
