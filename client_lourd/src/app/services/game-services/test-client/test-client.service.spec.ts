/* eslint-disable @typescript-eslint/no-explicit-any */
// utilise pour les attributs prives
/* voir les références dans la page test-client.service.ts */
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BONUS_MULTIPLIER, INVALID_INDEX, QUESTION_DELAY } from '@app/constants/constants';
import { EMPTY_QUIZ_GAME_CLIENT, MOCK_QUESTION, MOCK_QUIZ } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';
import { QuestionService } from '@app/services/back-end-communication-services/question-service/question.service';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { TimeService } from '@app/services/general-services/time-service/time.service';
import { BehaviorSubject, Observable, Subject, Subscription, of, throwError } from 'rxjs';
import { TestClientService } from './test-client.service';

describe('TestClientService', () => {
    let service: TestClientService;
    let mockTimeService: jasmine.SpyObj<TimeService>;
    let timeSourceSubjectMock: Subject<number>;
    let mockQuizService: jasmine.SpyObj<QuizService>;
    let mockQuestionService: jasmine.SpyObj<QuestionService>;
    let messageHandlerServiceSpy: jasmine.SpyObj<MessageHandlerService>;
    let emptyQuiz: Quiz;
    const timeQRL = 60;

    const questionExample: Question = {
        type: 'QRL',
        text: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
        points: 60,
        lastModified: '123',
    };

    beforeEach(() => {
        emptyQuiz = EMPTY_QUIZ_GAME_CLIENT;
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['popUpErrorDialog']);
    });

    beforeEach(async () => {
        const mockTime = 10;
        timeSourceSubjectMock = new BehaviorSubject<number>(mockTime);
        mockTimeService = jasmine.createSpyObj('TimeService', ['startTimer', 'resetTimer', 'stopTimer'], {
            timeSource: timeSourceSubjectMock,
            timeSourceObservable: timeSourceSubjectMock.asObservable(),
        });
        mockQuizService = jasmine.createSpyObj('QuizService', ['getQuizById']);
        mockQuestionService = jasmine.createSpyObj('QuestionService', ['verifyAnswers'], {
            baseUrl: 'http://localhost:3000/questions',
        });

        TestBed.configureTestingModule({
            providers: [
                TestClientService,
                { provide: TimeService, useValue: mockTimeService },
                { provide: QuizService, useValue: mockQuizService },
                { provide: QuestionService, useValue: mockQuestionService },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
        });
        service = TestBed.inject(TestClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('time getter should return TimeService time', () => {
        const timerValue = 100;
        mockTimeService.startTimer.and.callThrough();
        mockTimeService.startTimer(timerValue);
        expect(service.time).toEqual(mockTimeService.time);
    });

    it('baseUrl getter should return QuestionService baseUrl', () => {
        expect(service.baseUrl).toEqual(mockQuestionService.baseUrl);
    });

    it('quizObserver should call popUpErrorDialog on error with given error', fakeAsync(() => {
        const errorResponse = new HttpErrorResponse({
            error: { code: 500, message: 'Internal Error' },
            status: 500,
            statusText: 'Internal Server error ',
        });
        const fakeId = '123';
        mockQuizService.getQuizById.and.returnValue(throwError(() => errorResponse));
        service.fetchQuiz(fakeId);
        tick();
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith(errorResponse.error.message);
    }));

    it('quizObserver should call initialize question when next is called', fakeAsync(() => {
        mockQuizService.getQuizById.and.returnValue(of(MOCK_QUIZ));
        const fakeId = '123';
        spyOn<any>(service, 'initializeQuiz');
        service.fetchQuiz(fakeId);
        expect(service.quiz).toEqual(MOCK_QUIZ);
        expect(service['initializeQuiz']).toHaveBeenCalled();
    }));

    it('leavingPage should call stopTimer, reset attributes and stopTimerSubscription', () => {
        spyOn<any>(service, 'resetAttributes').and.stub();
        spyOn<any>(service, 'stopTimerSubscription').and.stub();
        spyOn<any>(service, 'cancelTimeout').and.stub();
        service.leavingPage();
        expect(service['resetAttributes']).toHaveBeenCalled();
        expect(mockTimeService.stopTimer).toHaveBeenCalled();
        expect(service['stopTimerSubscription']).toHaveBeenCalled();
        expect(service['cancelTimeout']).toHaveBeenCalled();
    });

    it('initializeSubscription should subscribe to timeService.timeSourceObservable and call finalizeAnswer when time becomes 0', fakeAsync(() => {
        const finalizeAnswer = spyOn(service, 'finalizeAnswer');
        service.initializeSubscription();
        mockTimeService.timeSource.next(0);
        tick();
        expect(finalizeAnswer).toHaveBeenCalled();
    }));

    it('fetchQuiz should call getQuizById from quizService', fakeAsync(() => {
        mockQuizService.getQuizById.and.returnValue(new Observable<Quiz>());
        const fakeId = '123';
        service.fetchQuiz(fakeId);
        tick();
        expect(mockQuizService.getQuizById).toHaveBeenCalledWith(fakeId);
    }));

    it('QCM - selectChoice() should select its respective choice in the question', () => {
        service.currentQuestion = JSON.parse(JSON.stringify(MOCK_QUESTION));
        service['finalAnswer'] = false;
        const exampleTime = 10;
        spyOnProperty(service, 'time', 'get').and.returnValue(exampleTime);
        service.selectChoice(0);
        if (service.currentQuestion.choices) {
            expect(service.choiceSelected[0]).toBeTrue();
            expect(service.currentQuestion.choices[0].isSelected).toBeTrue();
        }
    });

    it('QCM - selectChoice() should not do anything if called with an out of bounds index', () => {
        service.currentQuestion = JSON.parse(JSON.stringify(MOCK_QUESTION));
        const outOfBoundSuperiorIndex = 5;
        service.selectChoice(outOfBoundSuperiorIndex);
        expect(service.currentQuestion).toEqual(MOCK_QUESTION);
        service.selectChoice(INVALID_INDEX);
        expect(service.currentQuestion).toEqual(MOCK_QUESTION);
    });

    it('QCM - addPoints should add points with bonus if answers are correct and user is first', fakeAsync(() => {
        mockQuestionService.verifyAnswers.and.returnValue(of(true));
        const addPtsQuestionExample: Question = {
            type: QuestionType.QCM,
            text: 'text',
            points: 40,
            lastModified: '123',
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                    isSelected: true,
                },
                {
                    text: 'self',
                    isCorrect: false,
                    isSelected: false,
                },
            ],
        };
        service.currentQuestion = addPtsQuestionExample;
        service.playerPoints = 0;
        service['addPoints']();
        tick();
        const expectedPoints = addPtsQuestionExample.points * BONUS_MULTIPLIER;
        expect(service.playerPoints).toEqual(expectedPoints);
    }));

    it('QCM - addPoints should not add points if answers are not correct', fakeAsync(() => {
        mockQuestionService.verifyAnswers.and.returnValue(of(false));
        const addPtsQuestionExample: Question = {
            type: QuestionType.QCM,
            text: 'text',
            points: 40,
            lastModified: '123',
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                    isSelected: false,
                },
                {
                    text: 'self',
                    isCorrect: false,
                    isSelected: true,
                },
            ],
        }; //
        service.currentQuestion = addPtsQuestionExample;
        service.playerPoints = 0;
        service['addPoints']();
        tick();
        expect(service.playerPoints).toEqual(0);
        //
    }));

    it('QRL should add points by default (for now)', fakeAsync(() => {
        mockQuestionService.verifyAnswers.and.returnValue(of(true));
        service.currentQuestion = questionExample;
        service.playerPoints = 0;
        service['addPoints']();
        tick();
        expect(service.playerPoints).toEqual(questionExample.points);
    }));

    it('finalizeAnswer should call initializeNewQuestion and resetAttributes at the end of timeout', fakeAsync(() => {
        service['finalAnswer'] = false;
        spyOn<any>(service, 'addPoints').and.stub();
        spyOn<any>(service, 'initializeNewQuestion').and.stub();
        spyOn<any>(service, 'stopTimerSubscription').and.stub();
        service.finalizeAnswer();
        expect(service['stopTimerSubscription']).toHaveBeenCalled();
        expect(service['addPoints']).toHaveBeenCalled();
        tick(QUESTION_DELAY + 1);
        expect(service['initializeNewQuestion']).toHaveBeenCalled();
    }));

    it('addPoints observer should call popUpErrorDialog on error with given error', fakeAsync(() => {
        const errorResponse = new HttpErrorResponse({
            error: { code: 500, message: 'Internal Error' },
            status: 500,
            statusText: 'Internal Server error ',
        });
        mockQuestionService.verifyAnswers.and.returnValue(throwError(() => errorResponse));
        service['addPoints']();
        tick();
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith(errorResponse.error.message);
    }));

    it('initializeQuestionTimer should call resetTimer with quiz duration for QCM', () => {
        service.quiz = emptyQuiz;
        service.currentQuestion = emptyQuiz.questions[0];
        service.currentQuestion.type = QuestionType.QCM;
        service['initializeQuestionTimer']();
        expect(mockTimeService.resetTimer).toHaveBeenCalledOnceWith(service.quiz.duration);
    });

    it('initializeQuestionTimer should call resetTimer with value 60 by default for QRL', () => {
        service.quiz = emptyQuiz;
        service.currentQuestion = emptyQuiz.questions[0];
        service.currentQuestion.type = 'QRL';
        service['initializeQuestionTimer']();
        expect(mockTimeService.resetTimer).toHaveBeenCalledOnceWith(timeQRL);
    });

    it('initializeQuiz should set all attributes to default and initialize the timer', () => {
        service.quiz = emptyQuiz;
        spyOn<any>(service, 'initializeQuestionTimer');
        spyOn<any>(service, 'resetAttributes').and.stub();
        service['initializeQuiz']();
        expect(service.questions).toEqual(emptyQuiz.questions);
        expect(service.currentQuestion).toEqual(service.questions[0]);
        expect(service.currentQuestionIndex).toEqual(0);
        expect(service.playerPoints).toEqual(0);
        expect(service['resetAttributes']).toHaveBeenCalled();
        expect(service['initializeQuestionTimer']).toHaveBeenCalled();
    });

    it('initializeNewQuestion should change the currentQuestion and call initializeQuestionTimer assuming there is a next question', () => {
        service.quiz = emptyQuiz;
        spyOn<any>(service, 'initializeQuestionTimer').and.stub();
        service['initializeQuiz']();
        const initialIndex: number = service.currentQuestionIndex;
        const initialQuestion: Question = JSON.parse(JSON.stringify(service.currentQuestion));
        service['initializeNewQuestion']();
        expect(service.currentQuestionIndex).toEqual(initialIndex + 1);
        expect(service.currentQuestion).not.toEqual(initialQuestion);
        expect(service['initializeQuestionTimer']).toHaveBeenCalled();
    });

    it("initializeNewQuestion should set the final answer to true and call abandonGame if we're at the end of the quiz", () => {
        spyOn<any>(service, 'abandonGame').and.stub();
        service.quiz = emptyQuiz;
        service.questions = service.quiz.questions;
        const endIndex: number = emptyQuiz.questions.length - 1;
        service.currentQuestionIndex = endIndex;
        service['finalAnswer'] = false;
        service['initializeNewQuestion']();
        expect(service['finalAnswer']).toBeTrue();
        expect(service['abandonGame']).toHaveBeenCalled();
    });

    it('resetAttributes should reset attributes', () => {
        service.currentQuestion = MOCK_QUESTION;
        if (MOCK_QUESTION.choices) {
            service.answersCorrect = true;
            service['finalAnswer'] = true;
            service.choiceSelected = [true, false, false, false];
            service.showAnswers = true;
            MOCK_QUESTION.choices[0].isSelected = true;
            service['resetAttributes']();
            expect(service['finalAnswer']).toBeFalse();
            expect(service.answersCorrect).toBeFalse();
            expect(service.showAnswers).toBeFalse();
            expect(MOCK_QUESTION.choices[0].isSelected).toBeFalse();
            expect(service.choiceSelected).toEqual([false, false, false, false]);
        }
    });
    it('popUpErrorDialog method should call matdialog with proper message to show', () => {
        messageHandlerServiceSpy.popUpErrorDialog('The message the user sees');
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('The message the user sees');
    });

    it('abandonGame should call resetAttributes', fakeAsync(() => {
        spyOn<any>(service, 'resetAttributes').and.stub();
        service.abandonGame();
        expect(service['resetAttributes']).toHaveBeenCalled();
    }));

    it('should cancel timeout if timeoutId is not null', () => {
        const timeoutTime = 3000;
        service['timeoutId'] = setTimeout(() => {
            'rien';
        }, timeoutTime);
        service['cancelTimeout']();
        expect(service['timeoutId']).toBeNull();
    });
    it('should not cancel timeout if timeoutId is null', () => {
        service['cancelTimeout']();
        expect(service['timeoutId']).toBeNull();
    });
    it('should unsubscribe from timer subscription', () => {
        const fakeSubscription = jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']);
        service['timerSubscription'] = fakeSubscription;
        service['stopTimerSubscription']();
        expect(fakeSubscription.unsubscribe).toHaveBeenCalled();
    });
});
