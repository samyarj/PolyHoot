import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { QuestionTypeFilterComponent } from '@app/components/quiz-related/bank-related/question-type-filter/question-type-filter.component';
import { MOCK_QUESTION, MOCK_QUESTIONS, MOCK_QUIZZES } from '@app/constants/mock-constants';
import { MOCK_QRL } from '@app/constants/mock-validation-constants';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { QuestionService } from '@app/services/back-end-communication-services/question-service/question.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { of, throwError } from 'rxjs';
import { QuestionBankComponent } from './question-bank.component';
import SpyObj = jasmine.SpyObj;

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let questionServiceSpy: SpyObj<QuestionService>;
    let sortingServiceSpy: SpyObj<SortingService>;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;
    const mockQuestionsGet: Question[] = JSON.parse(JSON.stringify(MOCK_QUIZZES[0].questions));
    const mockQuestionsCreate: Question[] = JSON.parse(JSON.stringify([...MOCK_QUIZZES[0].questions, MOCK_QUESTION]));

    beforeEach(async () => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', ['getAllQuestions', 'createQuestion']);
        questionServiceSpy.getAllQuestions.and.returnValue(of(mockQuestionsGet));
        questionServiceSpy.createQuestion.and.returnValue(of(mockQuestionsCreate));

        sortingServiceSpy = jasmine.createSpyObj('SortingService', ['sortQuestionsByLastModified', 'filterQuestionsBySelectedType']);
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['popUpErrorDialog']);
        await TestBed.configureTestingModule({
            declarations: [QuestionBankComponent, QuestionTypeFilterComponent],
            imports: [MatIconModule],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: SortingService, useValue: sortingServiceSpy },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        component.bankQuestions = JSON.parse(JSON.stringify(MOCK_QUESTIONS));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch all questions from the API and sort them by lastModified', () => {
        questionServiceSpy.getAllQuestions().subscribe(component['questionsObserver']);
        expect(sortingServiceSpy.sortQuestionsByLastModified).toHaveBeenCalledWith(mockQuestionsGet);
    });

    it('should pop up an error message if there is a problem fetching questions', () => {
        questionServiceSpy.getAllQuestions.and.returnValue(
            throwError(() => new HttpErrorResponse({ error: { message: 'Error fetching questions' } })),
        );

        questionServiceSpy.getAllQuestions().subscribe(component['questionsObserver']);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('Error fetching questions');
    });

    it('should emit a question to the game when addQuestionToQuiz is called', () => {
        spyOn(component.questionToQuiz, 'emit');

        component.addQuestionToQuiz(MOCK_QUESTION);

        expect(component.questionToQuiz.emit).toHaveBeenCalledWith(MOCK_QUESTION);
    });

    it('should add a question to the bank and should call updateSelectedQuestions when addQuestionToBank is called', () => {
        const updateSpy = spyOn(component, 'updateSelectedQuestions');
        component.addQuestionToBank(MOCK_QUESTION);
        expect(questionServiceSpy.createQuestion).toHaveBeenCalledWith(MOCK_QUESTION);
        expect(updateSpy).toHaveBeenCalledWith(component.selectedType, false);
    });

    it('updateSelectedQuestions should call filterQuestionsBySelectedType from sortingService and update selectedType if typeChange is true', () => {
        sortingServiceSpy.filterQuestionsBySelectedType.and.returnValue([MOCK_QRL]);
        component.updateSelectedQuestions(QuestionType.QRL, true);
        expect(sortingServiceSpy.filterQuestionsBySelectedType).toHaveBeenCalledWith(component.bankQuestions, QuestionType.QRL);
        expect(component.selectedType).toEqual(QuestionType.QRL);
        expect(component.selectedQuestions).toEqual([MOCK_QRL]);
    });
});
