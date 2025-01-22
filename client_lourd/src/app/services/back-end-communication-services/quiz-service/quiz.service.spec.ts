/* eslint-disable @typescript-eslint/no-explicit-any */ // Tester les methodes privees
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MOCK_QUIZ, MOCK_QUIZZES } from '@app/constants/mock-constants';
import { MOCK_MIXED_QUESTIONS, MOCK_MIXED_QUESTIONS_CHOICES_REMOVED } from '@app/constants/mock-validation-constants';
import { Quiz } from '@app/interfaces/quiz';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { EMPTY } from 'rxjs';
import { QuizService } from './quiz.service';
import SpyObj = jasmine.SpyObj;

describe('QuizService', () => {
    let service: QuizService;
    let httpTestingController: HttpTestingController;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;

    const mockQuiz: Quiz = JSON.parse(JSON.stringify(MOCK_QUIZ));
    const mockQuizzes: Quiz[] = JSON.parse(JSON.stringify(MOCK_QUIZZES));

    beforeEach(async () => {
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleHttpError']);
        messageHandlerServiceSpy.handleHttpError.and.returnValue(EMPTY);

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuizService, { provide: MessageHandlerService, useValue: messageHandlerServiceSpy }],
        });
        service = TestBed.inject(QuizService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all quizzes from the API via GET', () => {
        const testQuizzes: Quiz[] = mockQuizzes;
        service.getAllQuizzes().subscribe((quizzes) => {
            expect(quizzes.length).toBe(testQuizzes.length);
            expect(quizzes).toEqual(testQuizzes);
        });

        const req = httpTestingController.expectOne(service.baseUrl);
        expect(req.request.method).toEqual('GET');
        req.flush(testQuizzes);
    });

    it('should fetch a specific quiz by ID', () => {
        if (mockQuiz.id) {
            service.getQuizById(mockQuiz.id).subscribe((quiz) => {
                expect(quiz).toEqual(mockQuiz);
            });

            const req = httpTestingController.expectOne(`${service.baseUrl}/${mockQuiz.id}`);
            expect(req.request.method).toEqual('GET');
            req.flush(mockQuiz);
        }
    });

    it('should create a new quiz and return the updated array of quizzes', () => {
        const updatedQuizzes = [...mockQuizzes, mockQuiz];
        service.createQuiz(mockQuiz).subscribe((quizzes) => {
            expect(quizzes).toEqual(updatedQuizzes);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/create`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual(mockQuiz);
        req.flush(updatedQuizzes);
    });

    it('should update the quiz data and return the updated array of quizzes', () => {
        const testQuiz = { ...mockQuizzes[0], title: 'Updated Title' };
        const updatedQuizzes = mockQuizzes.map((quiz) => (quiz.id === mockQuizzes[0].id ? testQuiz : quiz));
        if (mockQuizzes[0].id) {
            service.updateQuiz(mockQuizzes[0].id, testQuiz).subscribe((quizzes) => {
                expect(quizzes).toEqual(updatedQuizzes);
            });

            const req = httpTestingController.expectOne(`${service.baseUrl}/update/${testQuiz.id}`);
            expect(req.request.method).toEqual('PATCH');
            expect(req.request.body).toEqual(testQuiz);
            req.flush(updatedQuizzes);
        }
    });

    it('should toggle the visibility of the quiz and return the updated array of quizzes', () => {
        const testQuiz = { ...mockQuizzes[0], visibility: !mockQuizzes[0].visibility };
        const updatedQuizzes = mockQuizzes.map((quiz) => (quiz.id === testQuiz.id ? testQuiz : quiz));
        if (testQuiz.id) {
            service.toggleQuizVisibility(testQuiz.id).subscribe((quizzes) => {
                expect(quizzes).toEqual(updatedQuizzes);
            });

            const req = httpTestingController.expectOne(`${service.baseUrl}/toggle-visibility/${testQuiz.id}`);
            expect(req.request.method).toEqual('PATCH');
            req.flush(updatedQuizzes);
        }
    });

    it('should delete the quiz by ID and return the updated array of quizzes', () => {
        const updatedQuizzes = mockQuizzes.filter((quiz) => quiz.id !== mockQuiz.id);
        if (mockQuiz.id) {
            service.deleteQuizById(mockQuiz.id).subscribe((quizzes) => {
                expect(quizzes).toEqual(updatedQuizzes);
            });

            const req = httpTestingController.expectOne(`${service.baseUrl}/delete/${mockQuiz.id}`);
            expect(req.request.method).toEqual('DELETE');
            req.flush(updatedQuizzes);
        }
    });

    it('should call handleError when an error occurs in getAllQuizzes', () => {
        service.getAllQuizzes().subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(service.baseUrl);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should call handleError when an error occurs in getQuizById', () => {
        const testId = 'testId';

        service.getQuizById(testId).subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/${testId}`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should call handleError when an error occurs in createQuiz', () => {
        service.createQuiz(mockQuiz).subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/create`);
        expect(req.request.method).toBe('POST');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should call handleError when an error occurs in updateQuiz', () => {
        const testId = 'testId';
        const quizData = { title: 'Updated Title', description: 'Updated Description' };

        service.updateQuiz(testId, quizData).subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/update/${testId}`);
        expect(req.request.method).toBe('PATCH');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should call handleError when an error occurs in toggleQuizVisibility', () => {
        const testId = 'testId';

        service.toggleQuizVisibility(testId).subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/toggle-visibility/${testId}`);
        expect(req.request.method).toBe('PATCH');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should call handleError when an error occurs in deleteQuizById', () => {
        const testId = 'testId';

        service.deleteQuizById(testId).subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/delete/${testId}`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('removeChoicesQrl should remove choices attribute from QRL', () => {
        const mockMixedQuestions = JSON.parse(JSON.stringify(MOCK_MIXED_QUESTIONS));
        service['removeChoicesQrl'](mockMixedQuestions);
        expect(mockMixedQuestions).toEqual(MOCK_MIXED_QUESTIONS_CHOICES_REMOVED);
    });

    it('filterQuizzes should call removeChoicesQrl for each quiz in quizzes', () => {
        const removeChoicesSpy = spyOn<any>(service, 'removeChoicesQrl');
        service['filterQuizzes'](mockQuizzes);
        mockQuizzes.forEach((quiz) => expect(removeChoicesSpy).toHaveBeenCalledWith(quiz.questions));
    });
});
