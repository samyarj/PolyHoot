/* eslint-disable @typescript-eslint/no-explicit-any */
// utilise pour les attributs prives
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm, NgModel } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderGameComponent } from '@app/components/general-elements/header-game/header-game.component';
import { QuestionBankComponent } from '@app/components/quiz-related/bank-related/question-bank/question-bank.component';
import { QuestionTypeFilterComponent } from '@app/components/quiz-related/bank-related/question-type-filter/question-type-filter.component';
import { CreateQuizComponent } from '@app/components/quiz-related/quiz-creation/create-quiz/create-quiz.component';
import { QuestionFormComponent } from '@app/components/quiz-related/quiz-creation/question-form/question-form.component';
import { AdminQuizPageMode, AppRoute, ButtonType } from '@app/constants/enum-class';
import { MOCK_QUESTION, MOCK_QUIZ, MOCK_QUIZZES } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { AdminPageComponent } from '@app/pages/admin-related/admin-page/admin-page.component';
import { LoginPageComponent } from '@app/pages/auth/login-page/login-page.component';
import { QuizHandlerService } from '@app/services/admin-services/quiz-handler-service/quiz-handler.service';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { of, throwError } from 'rxjs';
import { AdminQuizCreateComponent } from './admin-create-quiz';
import SpyObj = jasmine.SpyObj;

describe('AdminQuizCreateComponent', () => {
    let component: AdminQuizCreateComponent;
    let fixture: ComponentFixture<AdminQuizCreateComponent>;
    let quizServiceSpy: SpyObj<QuizService>;
    let quizHandlerSpy: SpyObj<QuizHandlerService>;
    let router: Router;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;
    let questionBankComponentSpy: SpyObj<QuestionBankComponent>;
    beforeEach(() => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['getQuizById', 'createQuiz', 'updateQuiz']);
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['popUpErrorDialog']);
        questionBankComponentSpy = jasmine.createSpyObj('QuestionBankComponent', ['addQuestionToBank']);
        quizHandlerSpy = jasmine.createSpyObj('QuizHandlerService', [
            'addQuestionToQuiz',
            'emptyQuiz',
            'validateQuiz',
            'prepareQuizBeforeSubmit',
            'modifyQuestionInQuiz',
        ]);
        Object.assign(quizHandlerSpy, {
            quizId: 'test-quiz-id',
            quiz: MOCK_QUIZ,
        });

        quizServiceSpy.getQuizById.and.returnValue(of(MOCK_QUIZ));
        quizServiceSpy.createQuiz.and.returnValue(of([...MOCK_QUIZZES, MOCK_QUIZ]));
        quizServiceSpy.updateQuiz.and.returnValue(of(MOCK_QUIZZES));
        questionBankComponentSpy.addQuestionToBank.and.callThrough();
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                AdminQuizCreateComponent,
                CreateQuizComponent,
                QuestionBankComponent,
                NgModel,
                HeaderGameComponent,
                NgForm,
                QuestionFormComponent,
                QuestionTypeFilterComponent,
            ],
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                MatIconModule,
                MatTooltipModule,
                RouterTestingModule.withRoutes([
                    { path: 'admin', component: AdminPageComponent },
                    { path: 'login', component: LoginPageComponent },
                ]),
            ],
            providers: [
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
                { provide: QuizHandlerService, useValue: quizHandlerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { params: { id: 'test-quiz-id' } },
                        paramMap: of(convertToParamMap({ id: 'test-quiz-id' })),
                    },
                },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminQuizCreateComponent);
        router = TestBed.inject(Router);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.questionBankComponent = questionBankComponentSpy;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch quiz data for editing if quizId is provided', () => {
        expect(quizServiceSpy.getQuizById).toHaveBeenCalledWith('test-quiz-id');
        expect(quizHandlerSpy.quiz).toEqual(MOCK_QUIZ);
        expect(quizHandlerSpy.quizId).toEqual('test-quiz-id');
    });

    it('should call addQuestionToQuiz of quizHandler when adding a new question to the quiz', () => {
        const newQuestion: Question = JSON.parse(JSON.stringify(MOCK_QUESTION));
        component.addQuestionToQuiz(newQuestion);
        expect(quizHandlerSpy.addQuestionToQuiz).toHaveBeenCalledWith(newQuestion);
    });
    it('should call addQuestionToBank of QuestionBankComponent when adding a question to the question bank', () => {
        const newQuestion: Question = JSON.parse(JSON.stringify(MOCK_QUESTION));
        component.addQuestionToBank(newQuestion);
        expect(questionBankComponentSpy.addQuestionToBank).toHaveBeenCalledWith(newQuestion);
    });

    it('should call updateQuiz and navigate to admin page if quizId is set', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.submitQuiz(MOCK_QUIZ);
        expect(quizServiceSpy.updateQuiz).toHaveBeenCalledWith('test-quiz-id', MOCK_QUIZ);
        expect(navigateSpy).toHaveBeenCalledWith([AppRoute.ADMIN]);
    });

    it('should call createQuiz, set quiz visibility to false, and navigate to admin page if quizId is not set', () => {
        Object.assign(quizHandlerSpy, {
            quizId: undefined,
        });
        const navigateSpy = spyOn(router, 'navigate');
        const quizWithVisibilitySet = { ...MOCK_QUIZ, visibility: false };
        component.submitQuiz(MOCK_QUIZ);
        expect(quizServiceSpy.createQuiz).toHaveBeenCalledWith(quizWithVisibilitySet);
        expect(navigateSpy).toHaveBeenCalledWith([AppRoute.ADMIN]);
    });

    it('should pop up an error when there is an error updating or creating quiz', () => {
        const errorResponse = new HttpErrorResponse({ error: { message: 'Error creating quiz' } });
        quizServiceSpy.createQuiz.and.returnValue(throwError(() => errorResponse));
        fixture.detectChanges();
        quizServiceSpy.createQuiz(MOCK_QUIZ).subscribe(component['errorObserver']);

        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('Error creating quiz');
    });

    it('should pop up an error when there is an error fetching a quiz', () => {
        const errorResponse = new HttpErrorResponse({ error: { message: 'Error fetching quiz' } });
        quizServiceSpy.getQuizById.and.returnValue(throwError(() => errorResponse));
        fixture.detectChanges();
        quizServiceSpy.getQuizById('test').subscribe(component['quizObserver']);

        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('Error fetching quiz');
    });

    it('should navigate to admin page after successful quiz creation or editing', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.submitQuiz(MOCK_QUIZ);
        expect(navigateSpy).toHaveBeenCalledWith([AppRoute.ADMIN]);
    });

    it('should handle navigation to login', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.navigateTologin();
        expect(navigateSpy).toHaveBeenCalledWith([AppRoute.LOGIN]);
    });

    it('should set mode to MODIFY and getQuizById if quizId is present in route parameters', () => {
        quizServiceSpy.getQuizById.and.returnValue(of(MOCK_QUIZ));

        expect(component.title).toEqual(AdminQuizPageMode.MODIFY);
        expect(component.submitButton).toEqual(ButtonType.MODIFY);
        expect(quizServiceSpy.getQuizById).toHaveBeenCalledWith('test-quiz-id');
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });
});
