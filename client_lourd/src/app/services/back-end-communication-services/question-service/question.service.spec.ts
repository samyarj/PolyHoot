/* eslint-disable @typescript-eslint/no-explicit-any */ // Tester les methodes privees
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MOCK_QUESTION, MOCK_QUESTIONS } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { EMPTY } from 'rxjs';
import { QuestionService } from './question.service';
import SpyObj = jasmine.SpyObj;

describe('QuestionService', () => {
    let service: QuestionService;
    let httpTestingController: HttpTestingController;
    let mockQuestions: Question[] = JSON.parse(JSON.stringify(MOCK_QUESTIONS));
    let mockQuestion: Question = JSON.parse(JSON.stringify({ ...MOCK_QUESTION, id: '123' }));
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;

    beforeEach(() => {
        mockQuestions = JSON.parse(JSON.stringify(MOCK_QUESTIONS));
        mockQuestion = JSON.parse(JSON.stringify({ ...MOCK_QUESTION, id: '123' }));
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleHttpError']);
        messageHandlerServiceSpy.handleHttpError.and.returnValue(EMPTY);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuestionService, { provide: MessageHandlerService, useValue: messageHandlerServiceSpy }],
        });
        service = TestBed.inject(QuestionService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all questions from the API via GET', () => {
        service.getAllQuestions().subscribe((questions) => {
            expect(questions.length).toBe(mockQuestions.length);
            expect(questions).toEqual(mockQuestions);
        });
        const req = httpTestingController.expectOne(service.baseUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockQuestions);
    });

    it('should fetch a specific question by ID', () => {
        if (mockQuestion.id) {
            service.getQuestionById(mockQuestion.id).subscribe((question) => {
                expect(question).toEqual(mockQuestion);
            });

            const req = httpTestingController.expectOne(`${service.baseUrl}/${mockQuestion.id}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockQuestion);
        }
    });

    it('should create a new question and return the updated array of questions', () => {
        const updatedQuestions = [...mockQuestions, mockQuestion];
        service.createQuestion(mockQuestion).subscribe((questions) => {
            expect(questions.length).toBe(updatedQuestions.length);
            expect(questions).toEqual(updatedQuestions);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/create`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockQuestion);
        req.flush(updatedQuestions);
    });

    it('should update the question data and return the updated array of questions', () => {
        const updatedQuestion: Question = { ...mockQuestions[0], text: 'Updated text' };
        const updatedQuestions = mockQuestions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q));
        if (mockQuestions[0].id) {
            service.updateQuestion(mockQuestions[0].id, updatedQuestion).subscribe((questions) => {
                expect(questions).toEqual(updatedQuestions);
            });
            const req = httpTestingController.expectOne(`${service.baseUrl}/update/${mockQuestions[0].id}`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(updatedQuestion);
            req.flush(updatedQuestions);
        }
    });

    it('should delete the question by ID and return the updated array of questions', () => {
        const remainingQuestions = mockQuestions.filter((q) => q.id !== mockQuestion.id);
        if (mockQuestion.id) {
            service.deleteQuestionById(mockQuestion.id).subscribe((questions) => {
                expect(questions.length).toBe(remainingQuestions.length);
                expect(questions).toEqual(remainingQuestions);
            });

            const req = httpTestingController.expectOne(`${service.baseUrl}/delete/${mockQuestion.id}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(remainingQuestions);
        }
    });

    it('should send question and return a boolean', () => {
        const updatedQuestions = [...mockQuestions, mockQuestion];
        service.createQuestion(mockQuestion).subscribe((questions) => {
            expect(questions.length).toBe(updatedQuestions.length);
            expect(questions).toEqual(updatedQuestions);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/create`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockQuestion);
        req.flush(updatedQuestions);
    });

    it('should return true when the choices are correct', () => {
        service.verifyAnswers(MOCK_QUESTION).subscribe((value) => {
            expect(value).toBe(true);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/validate-answers`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(MOCK_QUESTION);
        req.flush(true);
    });

    it('should return false when the choices are incorrect', () => {
        service.verifyAnswers(MOCK_QUESTION).subscribe((value) => {
            expect(value).toBe(false);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/validate-answers`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(MOCK_QUESTION);
        req.flush(false);
    });

    it('should call handleError when an error occurs in getAllQuestions', () => {
        service.getAllQuestions().subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });
        const req = httpTestingController.expectOne(service.baseUrl);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should call handleError when an error occurs in getQuestionById', () => {
        const testId = 'testId';

        service.getQuestionById(testId).subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/${testId}`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should call handleError when an error occurs in createQuestion', () => {
        service.createQuestion(mockQuestion).subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/create`);
        expect(req.request.method).toBe('POST');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should call handleError when an error occurs in updateQuestion', () => {
        const testId = 'testId';
        const questionData = { text: 'Updated Title', description: 'Updated Description' };

        service.updateQuestion(testId, questionData).subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/update/${testId}`);
        expect(req.request.method).toBe('PATCH');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should call handleError when an error occurs in deleteQuestionById', () => {
        const testId = 'testId';

        service.deleteQuestionById(testId).subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/delete/${testId}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ProgressEvent('error'), { status: 0 });
    });
});
