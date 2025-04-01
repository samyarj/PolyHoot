import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { QuestionService } from '@app/services/back-end-communication-services/question-service/question.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { Observable, Observer } from 'rxjs';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent {
    @Output() questionToQuiz = new EventEmitter<Question>();
    bankQuestions: Question[] = [];
    selectedQuestions: Question[] = this.bankQuestions;
    selectedType: string = 'ALL';
    user$: Observable<User | null>;
    private username: string | null;
    private questionsObserver: Partial<Observer<Question[]>> = {
        next: (questions: Question[]) => {
            this.bankQuestions = this.sortingService.sortQuestionsByLastModified(questions);
            this.updateSelectedQuestions(this.selectedType, false);
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandler.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };

    constructor(
        private messageHandler: MessageHandlerService,
        private questionService: QuestionService,
        private sortingService: SortingService,
        private authService: AuthService,
    ) {
        this.questionService.getAllQuestions().subscribe(this.questionsObserver);
        this.user$ = this.authService.user$;
        this.user$.subscribe((user) => {
            this.username = user?.username ?? null;
        });
    }

    addQuestionToQuiz(clickedQuestion: Question): void {
        this.questionToQuiz.emit(clickedQuestion);
    }

    addQuestionToBank(clickedQuestion: Question): void {
        clickedQuestion.lastModified = new Date().toString();
        if (this.username) clickedQuestion.creator = this.username;
        this.questionService.createQuestion(clickedQuestion).subscribe(this.questionsObserver);
    }

    updateSelectedQuestions(selectedType: string, typeChange: boolean) {
        this.selectedQuestions = this.sortingService.filterQuestionsBySelectedType(this.bankQuestions, selectedType);
        if (typeChange) this.selectedType = selectedType;
    }
}
