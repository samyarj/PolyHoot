/* eslint-disable @typescript-eslint/no-explicit-any */
// utilise pour les attributs prives
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionFormComponent } from '@app/components/quiz-related/quiz-creation/question-form/question-form.component';
import { AppRoute, ConfirmationMessage } from '@app/constants/enum-class';
import { EMPTY_QUESTION, MOCK_QUESTION, MOCK_QUESTIONS, MOCK_QUIZ } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { AdminPageComponent } from '@app/pages/admin-related/admin-page/admin-page.component';
import { QuizHandlerService } from '@app/services/admin-services/quiz-handler-service/quiz-handler.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { CreateQuizComponent } from './create-quiz.component';
import SpyObj = jasmine.SpyObj;

describe('CreateQuizComponent', () => {
    let component: CreateQuizComponent;
    let fixture: ComponentFixture<CreateQuizComponent>;
    let routerSpy: SpyObj<Router>;
    let quizHandlerSpy: SpyObj<QuizHandlerService>;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;

    beforeEach(waitForAsync(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        quizHandlerSpy = jasmine.createSpyObj('QuizHandlerService', [
            'addQuestionToQuiz',
            'emptyQuiz',
            'validateQuiz',
            'prepareQuizBeforeSubmit',
            'modifyQuestionInQuiz',
            'deleteQuestionFromQuiz',
        ]);
        messageHandlerServiceSpy = jasmine.createSpyObj('MessageHandlerService', ['confirmationDialog']);
        messageHandlerServiceSpy.confirmationDialog.and.callFake((message: string, callback: () => void) => {
            callback();
        });

        Object.assign(quizHandlerSpy, {
            quizId: 'test-quiz-id',
            quiz: MOCK_QUIZ,
        });
        TestBed.configureTestingModule({
            declarations: [CreateQuizComponent, QuestionFormComponent],
            imports: [
                RouterTestingModule.withRoutes([{ path: 'admin', component: AdminPageComponent }]),
                FormsModule,
                DragDropModule,
                BrowserAnimationsModule,
                MatTooltipModule,
            ],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: QuizHandlerService, useValue: quizHandlerSpy },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateQuizComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    const deepCloneQuestion = (quiz: Question) => JSON.parse(JSON.stringify(quiz));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reset currentQuestion but preserve its id when emptyCurrentQuestion is called', () => {
        component.currentQuestion = deepCloneQuestion(MOCK_QUESTION);
        component.currentQuestion.id = 'test-id';
        const originalId = component.currentQuestion.id;
        component.emptyCurrentQuestion();
        expect(component.currentQuestion.id).toEqual(originalId);
        expect(component.currentQuestion).toEqual({ ...deepCloneQuestion(EMPTY_QUESTION), id: originalId });
    });

    it('should set a new empty currentQuestion and reset submitQuestionButton when addNewQuestion is called', () => {
        component.currentQuestion = deepCloneQuestion(MOCK_QUESTION);
        component.submitQuestionButton = 'Modifier';

        component.addEmptyQuestion();

        expect(component.currentQuestion).toEqual(jasmine.objectContaining(EMPTY_QUESTION));
        expect(component.submitQuestionButton).toBe('Ajouter');
    });

    it('should call addQuestionToQuiz when submitQuestionButton is not Modifier', () => {
        const emptyQuestionSpy = spyOn<any>(component, 'emptyQuestion');

        component.submitQuestionButton = 'Ajouter';
        component.onQuestionSubmitted(deepCloneQuestion(MOCK_QUESTION));
        expect(quizHandlerSpy.addQuestionToQuiz).toHaveBeenCalledWith(MOCK_QUESTION);
        expect(emptyQuestionSpy).toHaveBeenCalled();
    });

    it('should call modifyQuestion when submitQuestionButton is Modifier', () => {
        const emptyQuestionSpy = spyOn<any>(component, 'emptyQuestion');
        quizHandlerSpy.modifyQuestionInQuiz.and.returnValue();
        component.submitQuestionButton = 'Modifier';
        component.onQuestionSubmitted(deepCloneQuestion(MOCK_QUESTION));
        expect(quizHandlerSpy.modifyQuestionInQuiz).toHaveBeenCalledWith(MOCK_QUESTION);
        expect(emptyQuestionSpy).toHaveBeenCalled();
    });

    it('should emit the clicked question to bank', () => {
        const clickedQuestion: Question = { ...deepCloneQuestion(MOCK_QUESTION), id: 'test-id' };

        spyOn(component.questionToBank, 'emit');
        component.addQuestionToBank(clickedQuestion);

        expect(component.questionToBank.emit).toHaveBeenCalledWith(clickedQuestion);
    });

    it('should set submitQuestionButton to Modifier and currentQuestion to the clicked question', () => {
        const clickedQuestion: Question = { ...deepCloneQuestion(MOCK_QUESTION), id: 'test-id' };

        component.modifyQuestionAction(clickedQuestion);

        expect(component.submitQuestionButton).toBe('Modifier');
        expect(component.currentQuestion).toEqual(clickedQuestion);
    });

    it('should call deleteQuestionFromQuiz when deleteQuestion is called', () => {
        const indexToDelete = 1;
        component.deleteQuestion(indexToDelete);
        expect(quizHandlerSpy.deleteQuestionFromQuiz).toHaveBeenCalledWith(indexToDelete);
    });

    it('should reorder questions when onDrop is called', () => {
        const question1: Question = { ...deepCloneQuestion(MOCK_QUESTION), id: 'id-1', text: 'Question 1' };
        const question2: Question = { ...deepCloneQuestion(MOCK_QUESTION), id: 'id-2', text: 'Question 2' };
        component.quiz.questions = [question1, question2];

        component.onDrop({
            previousIndex: 0,
            currentIndex: 1,
            item: {} as CdkDrag<Question>,
            container: {} as CdkDropList<Question[]>,
            previousContainer: {} as CdkDropList<Question[]>,
            isPointerOverContainer: true,
            distance: { x: 0, y: 0 },
        } as CdkDragDrop<Question[]>);

        expect(component.quiz.questions[0]).toEqual(question2);
        expect(component.quiz.questions[1]).toEqual(question1);
    });

    it('should empty the quiz when emptyQuizAndRedirectCallback is called', () => {
        component['emptyQuizAndRedirectCallback']();
        expect(quizHandlerSpy.emptyQuiz).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoute.ADMIN]);
    });

    it('should call confirmationDialog with proper message from messageHandlerService when emptyQuizAndRedirect is called', () => {
        quizHandlerSpy.quizId = 'id';
        const callbackSpy = spyOn<any>(component, 'emptyQuizAndRedirectCallback');
        component.emptyQuizAndRedirect();
        expect(messageHandlerServiceSpy.confirmationDialog).toHaveBeenCalledWith(ConfirmationMessage.CancelModification, jasmine.any(Function));
        expect(callbackSpy).toHaveBeenCalled();
    });

    it('should call confirmationDialog with proper message from messageHandlerService when emptyQuizAndRedirect is called', () => {
        quizHandlerSpy.quizId = undefined;
        const callbackSpy = spyOn<any>(component, 'emptyQuizAndRedirectCallback');
        component.emptyQuizAndRedirect();
        expect(messageHandlerServiceSpy.confirmationDialog).toHaveBeenCalledWith(ConfirmationMessage.CancelCreation, jasmine.any(Function));
        expect(callbackSpy).toHaveBeenCalled();
    });

    it('should call validateQuiz of quizHandler when validQuiz is called', () => {
        expect(quizHandlerSpy.validateQuiz).toHaveBeenCalled();
    });

    it('should call prepareQuizBeforeSubmit when submitQuizEvent is called', () => {
        spyOn(component.submitQuiz, 'emit');
        component.submitQuizEvent();

        expect(component.submitQuiz.emit).toHaveBeenCalledWith(MOCK_QUIZ);

        component.submitQuizEvent();
        expect(quizHandlerSpy.prepareQuizBeforeSubmit).toHaveBeenCalled();
    });

    it('should return the unique identifier of the question', () => {
        const index = 0;
        expect(component.trackByFn(index, MOCK_QUESTIONS[0])).toBe(MOCK_QUESTIONS[0].id);
    });

    it('should return different identifiers for different questions', () => {
        const index1 = 0;
        const index2 = 1;
        expect(component.trackByFn(index1, MOCK_QUESTIONS[0])).not.toBe(component.trackByFn(index2, MOCK_QUESTIONS[1]));
    });
});
