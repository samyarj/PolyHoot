import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { INVALID_INDEX, MIN_CHOICES } from '@app/constants/constants';
import { ErrorMessage } from '@app/constants/enum-class';
import { EMPTY_POLL, EMPTY_POLL_QUESTION } from '@app/constants/mock-constants';
import { Poll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observable, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root',
})
export class CreatePollService {
    readonly baseUrl = `${environment.serverUrl}/polls`;
    poll: Poll = JSON.parse(JSON.stringify(EMPTY_POLL));
    question: Question = JSON.parse(JSON.stringify(EMPTY_POLL_QUESTION));
    constructor(
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
        private questionValidationService: QuestionValidationService,
    ) {}
    getPollById(id: string): Observable<Poll> {
        return this.http.get<Poll>(`${this.baseUrl}/${id}`).pipe(
            catchError((error) => {
                return this.messageHandler.handleHttpError(error);
            }),
        );
    }

    createPoll(poll: Poll): Observable<Poll[]> {
        return this.http.post<Poll[]>(`${this.baseUrl}/create`, poll).pipe(catchError(this.messageHandler.handleHttpError));
    }

    updatePoll(id: string, pollData: Poll): Observable<Poll[]> {
        return this.http.patch<Poll[]>(`${this.baseUrl}/update/${id}`, pollData).pipe(catchError(this.messageHandler.handleHttpError));
    }
    addQuestionToPoll(clickedQuestion: Question): void {
        if (this.questionValidationService.isQuestionTitleUnique(clickedQuestion, this.poll.questions, false)) {
            clickedQuestion.id = uuidv4();
            this.poll.questions.push(clickedQuestion);
            return;
        }
        this.messageHandler.popUpErrorDialog(ErrorMessage.QstTitleAlreadyInPoll);
    }
    modifyQuestionInPoll(newQuestion: Question): void {
        const index = this.poll.questions.findIndex((question) => question.id === newQuestion.id);
        const isQuestionTitleUnique = this.questionValidationService.isQuestionTitleUnique(newQuestion, this.poll.questions, true);
        if (index !== INVALID_INDEX && isQuestionTitleUnique) {
            this.poll.questions[index] = newQuestion;
        } else if (!isQuestionTitleUnique) {
            this.messageHandler.popUpErrorDialog(ErrorMessage.QstTitleAlreadyInPoll);
        } else {
            this.messageHandler.popUpErrorDialog(ErrorMessage.QstDoesNotExist);
        }
    }
    deleteQuestionFromPoll(index: number): void {
        this.poll.questions.splice(index, 1);
    }
    emptyPoll() {
        this.poll = JSON.parse(JSON.stringify(EMPTY_POLL));
    }
    editQuestion(index: number) {
        this.question = this.poll.questions[index];
    }
    emptyQuestion() {
        const id = this.question.id;
        this.question = JSON.parse(JSON.stringify(EMPTY_POLL_QUESTION));
        this.question.id = id;
    }
    deleteAnswer(index: number): void {
        if (this.question.choices && this.question.choices.length > MIN_CHOICES) {
            this.question.choices.splice(index, 1);
        }
    }
}
