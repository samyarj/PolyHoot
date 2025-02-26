/* eslint-disable @typescript-eslint/no-explicit-any */
// any utilisé pour les spy des méthodes privées
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PopUpCreationComponent } from '@app/components/general-elements/pop-up-creation/pop-up-creation.component';
import { HeaderGameComponent } from '@app/components/layout/filler/header-game/header-game.component';
import { QuestionFormComponent } from '@app/components/quiz-related/quiz-creation/question-form/question-form.component';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';
import { QuestionService } from '@app/services/back-end-communication-services/question-service/question.service';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let quiz2ServiceSpy: jasmine.SpyObj<QuizService>;
    let questionService: jasmine.SpyObj<QuestionService>;
    let messageHandlerServiceSpy: jasmine.SpyObj<MessageHandlerService>;

    const mockMatDialog = {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of({}) }),
    };

    const mockQuizzes: Quiz[] = [
        {
            id: '2c4k6a',
            title: 'Quiz on Angular',
            description: 'Test your knowledge of Angular',
            duration: 45,
            lastModification: '2020-08-25T15:30:00+00:00',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'Which of the following directives is used to loop on an array?',
                    points: 30,
                    choices: [
                        { text: 'div', isCorrect: false },
                        { text: '*ngFor', isCorrect: true },
                        { text: 'span', isCorrect: false },
                        { text: 'p', isCorrect: false },
                    ],
                },
                {
                    type: QuestionType.QCM,
                    text: 'What does HTML stand for?',
                    points: 25,
                    choices: [
                        { text: 'HyperText Markup Language', isCorrect: true },
                        { text: 'Highly Typed Modeling Language', isCorrect: false },
                        { text: 'Hyperlink and Text Management Language', isCorrect: false },
                    ],
                },
            ],
            visibility: true,
        },
        {
            id: '2c4k6a',
            title: 'Quiz on Angular invisible',
            description: 'Test your knowledge of Angular',
            duration: 45,
            lastModification: '2020-08-25T15:30:00+00:00',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'Which of the following directives is used to loop on an array?',
                    points: 30,
                    choices: [
                        { text: 'div', isCorrect: false },
                        { text: '*ngFor', isCorrect: true },
                        { text: 'span', isCorrect: false },
                        { text: 'p', isCorrect: false },
                    ],
                },
                {
                    type: QuestionType.QCM,
                    text: 'What does HTML stand for?',
                    points: 25,
                    choices: [
                        { text: 'HyperText Markup Language', isCorrect: true },
                        { text: 'Highly Typed Modeling Language', isCorrect: false },
                        { text: 'Hyperlink and Text Management Language', isCorrect: false },
                    ],
                },
            ],
            visibility: false,
        },
    ];

    const mockQuestions: Question[] = [
        { id: '1', type: 'QCM', text: 'Question 1', points: 10 },
        { id: '2', type: 'QCM', text: 'Question 2', points: 10 },
        { id: '3', type: 'QCM', text: 'Question 3', points: 10 },
        { id: '4', type: 'QCM', text: 'Question 4', points: 10 },
        { id: '5', type: 'QCM', text: 'Question 5', points: 10 },
    ];

    beforeEach(() => {
        quiz2ServiceSpy = jasmine.createSpyObj('Quiz2Service', ['getAllQuizzes', 'deleteQuizById', 'createQuiz']);
        quiz2ServiceSpy.getAllQuizzes.and.returnValue(of(mockQuizzes));
        quiz2ServiceSpy.createQuiz.and.returnValue(of(mockQuizzes));
        quiz2ServiceSpy.deleteQuizById = jasmine.createSpy().and.returnValue(of([]));

        questionService = jasmine.createSpyObj('QuestionService', ['getAllQuestions']);
        questionService.getAllQuestions.and.returnValue(of(mockQuestions));

        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['popUpErrorDialog']);

        TestBed.configureTestingModule({
            declarations: [CreatePageComponent, QuestionFormComponent, HeaderGameComponent, PopUpCreationComponent],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: QuizService, useValue: quiz2ServiceSpy },
                { provide: QuestionService, useValue: questionService },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
            imports: [MatTooltipModule],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('quiz pop-up should open when clicking on a game', () => {
        component['fetchAvailableQuizzes']();
        fixture.detectChanges();

        const quizElements = fixture.debugElement.nativeElement.querySelectorAll('.quizContainer');
        quizElements[0].click();

        expect(mockMatDialog.open).toHaveBeenCalledWith(PopUpCreationComponent, {
            width: component.quizPopUpWidth,
            data: mockQuizzes[0],
        });
    });

    it('User should receive an alert if quizService sends an httpErrorResponse', () => {
        const errorResponse = new HttpErrorResponse({
            error: { code: 500, message: 'Internal Error' },
            status: 500,
            statusText: 'Internal Server error ',
        });
        quiz2ServiceSpy.getAllQuizzes.and.returnValue(throwError(() => errorResponse));
        quiz2ServiceSpy.getAllQuizzes().subscribe(component['quizzesObserver']);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith(errorResponse.error.message);
    });

    it('should set the item in the localStorage', () => {
        component.randomModeQuizId = 'id';
        spyOn(localStorage, 'setItem').and.stub();
        component.handleBeforeUnload();
        expect(localStorage.setItem).toHaveBeenCalledWith('randomModeQuizId', component.randomModeQuizId);
    });

    describe('ngOnDestroy', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(CreatePageComponent);
            component = fixture.componentInstance;
            spyOn<any>(component, 'removeQuiz');
            fixture.detectChanges();
        });

        it("should not call removeQuiz when ngOnDestroy is called if randomModeQuiz.id doesn't exist", () => {
            component.randomModeQuiz.id = undefined;
            fixture.detectChanges();
            component.ngOnDestroy();
            expect(component['removeQuiz']).not.toHaveBeenCalled();
        });

        it('should call removeQuiz when ngOnDestroy is called if randomModeQuiz.id exists', () => {
            component.randomModeQuiz.id = 'id';
            fixture.detectChanges();
            component.ngOnDestroy();
            expect(component['removeQuiz']).toHaveBeenCalledWith('id');
        });
    });

    it('User should receive an alert if questionService sends an httpErrorResponse', () => {
        const errorResponse = new HttpErrorResponse({
            error: { code: 500, message: 'Internal Error' },
            status: 500,
            statusText: 'Internal Server error ',
        });
        questionService.getAllQuestions.and.returnValue(throwError(() => errorResponse));
        questionService.getAllQuestions().subscribe(component['qcmQuestionsObserver']);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith(errorResponse.error.message);
    });

    it('should open a pop-up if the are currently no games visible', () => {
        spyOn<any>(component, 'fetchAvailableQuizzes').and.callFake(() => {
            if (component['quizzesObserver'].next) component['quizzesObserver'].next([mockQuizzes[1]]);
        });
        component['fetchAvailableQuizzes']();

        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith("Aucun questionnaire n'est presentement disponible");
    });

    it('should open a dialog with the correct quiz data', () => {
        const quizData: Quiz = mockQuizzes[0];
        component.openDialog(quizData);
        expect(mockMatDialog.open).toHaveBeenCalledWith(PopUpCreationComponent, { width: component.quizPopUpWidth, data: quizData });
    });

    it('should call messageHandlerService with error message when openErrorPopUp is called', () => {
        component.openErrorPopUp();
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith("Aucun questionnaire n'est presentement disponible");
    });

    it('should call deleteQuizById with the correct id', () => {
        const quizId = 'testQuizId';
        quiz2ServiceSpy.deleteQuizById.and.returnValue(of([]));
        component['removeQuiz'](quizId);
        expect(quiz2ServiceSpy.deleteQuizById).toHaveBeenCalledWith(quizId);
    });

    it('should return a set of random 5 unique questions', () => {
        const RANDOM_QUESTIONS_NUMBER = 5;
        const indices = Array.from({ length: RANDOM_QUESTIONS_NUMBER }, (_, i) => i / RANDOM_QUESTIONS_NUMBER);
        let callCount = 0;
        spyOn(Math, 'random').and.callFake(() => {
            return indices[callCount++ % indices.length];
        });
        const componentInstance = fixture.componentInstance;
        const selectedQuestions = componentInstance['getRandomQuestions'](mockQuestions);
        expect(selectedQuestions.length).toBe(RANDOM_QUESTIONS_NUMBER);
        const uniqueQuestions = new Set(selectedQuestions.map((q) => q.id));
        expect(uniqueQuestions.size).toBe(RANDOM_QUESTIONS_NUMBER);
        selectedQuestions.forEach((question) => {
            expect(mockQuestions.some((questionMock) => questionMock.id === question.id)).toBeTrue();
        });
    });

    it('should return an empty array if there are not enough questions', () => {
        const insufficientQuestions: Question[] = [
            { id: '1', type: 'QCM', text: 'Question 1', points: 10 },
            { id: '2', type: 'QCM', text: 'Question 2', points: 10 },
        ];
        const result = component['getRandomQuestions'](insufficientQuestions);
        expect(result).toEqual([]);
    });

    it('should create a random mode quiz and call quizServerService to create it', () => {
        component['randomQuestions'] = mockQuestions;
        component['generateRandomModeQuiz']();
        expect(quiz2ServiceSpy.createQuiz).toHaveBeenCalled();
    });

    it('should remove quiz from local storage on reload', () => {
        localStorage.setItem('randomModeQuizId', 'testQuizId');
        spyOn<any>(component, 'removeQuiz');
        component['onReload']();
        expect(component['removeQuiz']).toHaveBeenCalledWith('testQuizId');
        expect(localStorage.getItem('randomModeQuizId')).toBeNull();
    });
});
