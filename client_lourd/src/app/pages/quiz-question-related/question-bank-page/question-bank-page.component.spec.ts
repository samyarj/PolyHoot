import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { HeaderGameComponent } from '@app/components/layout/filler/header-game/header-game.component';
import { BankPanelComponent } from '@app/components/quiz-related/bank-related/bank-panel/bank-panel.component';
import { QuestionTypeFilterComponent } from '@app/components/quiz-related/bank-related/question-type-filter/question-type-filter.component';
import { AppRoute } from '@app/constants/enum-class';
import { MOCK_QRL } from '@app/constants/mock-validation-constants';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { QuestionService } from '@app/services/back-end-communication-services/question-service/question.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { of, throwError } from 'rxjs';
import { QuestionBankPageComponent } from './question-bank-page.component';
import SpyObj = jasmine.SpyObj;

describe('QuestionBankPageComponent', () => {
    let component: QuestionBankPageComponent;
    let fixture: ComponentFixture<QuestionBankPageComponent>;
    let questionServiceSpy: SpyObj<QuestionService>;
    let sortingServiceSpy: SpyObj<SortingService>;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;
    let questions: Question[];

    const mockRouter = {
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(() => {
        sortingServiceSpy = jasmine.createSpyObj('SortingService', ['sortQuestionsByLastModified', 'filterQuestionsBySelectedType']);
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['popUpErrorDialog']);
        questions = [
            {
                id: '1',
                type: QuestionType.QCM,
                text: 'Question 1?',
                points: 10,
                choices: [
                    { text: 'Answer 1', isCorrect: true },
                    { text: 'Answer 2', isCorrect: false },
                ],
                lastModified: '2023-11-15T11:30:20',
            },
            {
                id: '2',
                type: QuestionType.QCM,
                text: 'Question 2?',
                points: 10,
                choices: [
                    { text: 'Answer 1', isCorrect: false },
                    { text: 'Answer 2', isCorrect: true },
                ],
                lastModified: '2023-11-15T18:40:10',
            },
        ];
        questionServiceSpy = jasmine.createSpyObj('QuestionService', ['getAllQuestions', 'createQuestion', 'updateQuestion', 'deleteQuestionById']);
        sortingServiceSpy.sortQuestionsByLastModified.and.returnValue(questions);
        questionServiceSpy.getAllQuestions.and.returnValue(of(questions));
        questionServiceSpy.createQuestion.and.returnValue(of(questions));
        questionServiceSpy.updateQuestion.and.returnValue(of(questions));
        questionServiceSpy.deleteQuestionById.and.returnValue(of(questions));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionBankPageComponent, HeaderGameComponent, BankPanelComponent, QuestionTypeFilterComponent],
            imports: [MatExpansionModule, BrowserAnimationsModule, MatIconModule, HttpClientModule],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: Router, useValue: mockRouter },
                { provide: SortingService, useValue: sortingServiceSpy },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(QuestionBankPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize bankQuestions from QuestionService', () => {
        expect(component.bankQuestions).toEqual(questions);
    });

    it('should set showForm to true and initialize emptyQuestion', () => {
        component.addNewQuestion();
        expect(component.showForm).toBeTrue();
        expect(component.emptyQuestion).toEqual({
            type: QuestionType.QCM,
            text: '',
            points: 10,
            choices: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ],
            lastModified: new Date().toString(),
        });
    });

    it('should call updateQuestion in QuestionService when handleModifiedQuestion is called', () => {
        const modifiedQuestionIndex = 0;
        const modifiedQuestion: Question = { ...component.bankQuestions[modifiedQuestionIndex], text: 'Modified question' };
        component.handleModifiedQuestion(modifiedQuestion);
        if (modifiedQuestion.id) {
            expect(questionServiceSpy.updateQuestion).toHaveBeenCalledWith(modifiedQuestion.id, modifiedQuestion);
        }
    });

    it('should call deleteQuestion in QuestionService when handleDeletedQuestion is called', () => {
        const deletedQuestionIndex = 0;
        const deletedQuestion: Question = component.bankQuestions[deletedQuestionIndex];
        component.handleDeletedQuestion(deletedQuestion);
        if (deletedQuestion.id) {
            expect(questionServiceSpy.deleteQuestionById).toHaveBeenCalledWith(deletedQuestion.id);
        }
    });

    it('should call addQuestion in QuestionService when handleAddedQuestion is called and should call updateSelectedQuestions', () => {
        const updateSpy = spyOn(component, 'updateSelectedQuestions');
        const addedQuestion: Question = {
            type: QuestionType.QCM,
            text: 'Question 3?',
            points: 10,
            choices: [
                { text: 'Answer 1', isCorrect: false },
                { text: 'Answer 2', isCorrect: true },
            ],
            lastModified: '2023-11-15T18:30:20',
        };
        component.handleAddedQuestion(addedQuestion);
        expect(questionServiceSpy.createQuestion).toHaveBeenCalledWith(addedQuestion);
        expect(updateSpy).toHaveBeenCalledWith(component.selectedType, false);
    });

    it('should pop up an error message if there is a problem fetching questions', () => {
        questionServiceSpy.getAllQuestions.and.returnValue(
            throwError(() => new HttpErrorResponse({ error: { message: 'Error fetching questions' } })),
        );

        questionServiceSpy.getAllQuestions().subscribe(component['questionsObserver']);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('Error fetching questions');
    });

    it('should set showForm to false when handleCancelAdd is called', () => {
        component.handleCancelAdd();
        expect(component.showForm).toBeFalse();
    });

    it('should call navigate in Router service when redirectToPage is called', () => {
        const page = AppRoute.LOGIN;
        component.redirectToPage(page);
        expect(mockRouter.navigate).toHaveBeenCalledWith([AppRoute.LOGIN]);
    });

    it('should call sortQuestionsByLastModified in sortingService when handleModifiedQuestion is called', () => {
        const modifiedQuestionIndex = 0;
        const modifiedQuestion: Question = { ...component.bankQuestions[modifiedQuestionIndex], text: 'Modified question' };
        component.handleModifiedQuestion(modifiedQuestion);
        expect(sortingServiceSpy.sortQuestionsByLastModified).toHaveBeenCalledWith(questions);
    });

    it('should call sortQuestionsByLastModified in sortingService when handleDeletedQuestion is called', () => {
        const deletedQuestionIndex = 0;
        const deletedQuestion: Question = component.bankQuestions[deletedQuestionIndex];
        component.handleDeletedQuestion(deletedQuestion);
        expect(sortingServiceSpy.sortQuestionsByLastModified).toHaveBeenCalledWith(questions);
    });

    it('should call sortQuestionsByLastModified in sortingService when handleAddedQuestion is called', () => {
        const addedQuestion: Question = {
            type: QuestionType.QCM,
            text: 'Question 3?',
            points: 10,
            choices: [
                { text: 'Answer 1', isCorrect: false },
                { text: 'Answer 2', isCorrect: true },
            ],
            lastModified: '2023-11-15T18:30:20',
        };
        component.handleAddedQuestion(addedQuestion);
        expect(sortingServiceSpy.sortQuestionsByLastModified).toHaveBeenCalledWith(questions);
    });

    it('updateSelectedQuestions should call filterQuestionsBySelectedType from sortingService and update selectedType if typeChange is true', () => {
        sortingServiceSpy.filterQuestionsBySelectedType.and.returnValue([MOCK_QRL]);
        component.updateSelectedQuestions(QuestionType.QRL, true);
        expect(sortingServiceSpy.filterQuestionsBySelectedType).toHaveBeenCalledWith(component.bankQuestions, QuestionType.QRL);
        expect(component.selectedType).toEqual(QuestionType.QRL);
        expect(component.selectedQuestions).toEqual([MOCK_QRL]);
    });
});
