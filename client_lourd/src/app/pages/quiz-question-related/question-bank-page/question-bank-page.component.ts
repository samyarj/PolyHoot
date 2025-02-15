import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY_QUESTION } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { QuestionService } from '@app/services/back-end-communication-services/question-service/question.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-banque-questions-page',
    templateUrl: './question-bank-page.component.html',
    styleUrls: ['./question-bank-page.component.scss'],
})
export class QuestionBankPageComponent {
    title: string = 'Banque de questions';
    showForm: boolean = false;

    emptyQuestion: Question;

    bankQuestions: Question[] = [];

    selectedQuestions: Question[] = this.bankQuestions;

    selectedType: string = 'ALL';

    private questionsObserver: Partial<Observer<Question[]>> = {
        next: (questions: Question[]) => {
            this.bankQuestions = this.sortingService.sortQuestionsByLastModified(questions);
            this.updateSelectedQuestions(this.selectedType, false);
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandler.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    // constructeur a 4 parametres permis selon les charges et le prof, etant donne la nature des attributs
    // eslint-disable-next-line max-params
    constructor(
        private questionService: QuestionService,
        private questionValidationService: QuestionValidationService,
        private router: Router,
        private messageHandler: MessageHandlerService,
        private sortingService: SortingService,
    ) {
        this.questionService.getAllQuestions().subscribe(this.questionsObserver);
    }

    addNewQuestion() {
        this.showForm = true;
        this.emptyQuestion = { lastModified: new Date().toString(), ...JSON.parse(JSON.stringify(EMPTY_QUESTION)) };
    }

    handleModifiedQuestion(modifiedQuestion: Question) {
        const uniqueQuestion = this.questionValidationService.isQuestionTitleUnique(modifiedQuestion, this.bankQuestions, true);
        if (modifiedQuestion.id) {
            if (uniqueQuestion) {
                modifiedQuestion.lastModified = new Date().toString();
            }
            this.questionService.updateQuestion(modifiedQuestion.id, modifiedQuestion).subscribe(this.questionsObserver);
        }
    }

    handleDeletedQuestion(deletedQuestion: Question) {
        if (deletedQuestion.id) {
            this.questionService.deleteQuestionById(deletedQuestion.id).subscribe(this.questionsObserver);
        }
    }

    handleAddedQuestion(addedQuestion: Question) {
        this.showForm = false;
        this.questionService.createQuestion(addedQuestion).subscribe(this.questionsObserver);
    }

    handleCancelAdd() {
        this.showForm = false;
    }

    redirectToPage(page: string) {
        this.router.navigate([page]);
    }

    updateSelectedQuestions(selectedType: string, typeChange: boolean) {
        this.selectedQuestions = this.sortingService.filterQuestionsBySelectedType(this.bankQuestions, selectedType);
        if (typeChange) this.selectedType = selectedType;
    }
}
