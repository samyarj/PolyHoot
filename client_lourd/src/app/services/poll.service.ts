import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { INVALID_INDEX } from '@app/constants/constants';
import { ErrorMessage } from '@app/constants/enum-class';
import { EMPTY_POLL } from '@app/constants/mock-constants';
import { Poll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observable, catchError, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { QuestionValidationService } from './admin-services/validation-services/question-validation-service/question-validation.service';

@Injectable({
    providedIn: 'root',
})
export class PollService {
    readonly baseUrl = `${environment.serverUrl}/polls`;
    poll: Poll = JSON.parse(JSON.stringify(EMPTY_POLL));
    constructor(
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
        private questionValidationService: QuestionValidationService,
    ) {}

    getAllPolls(): Observable<Poll[]> {
        return this.http.get<Poll[]>(this.baseUrl).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    getPollById(id: string): Observable<Poll> {
        return this.http.get<Poll>(`${this.baseUrl}/${id}`).pipe(
            map((poll) => {
                return poll;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    createPoll(poll: Poll): Observable<Poll[]> {
        console.log('Envoyé au serveur: ', poll);
        return this.http.post<Poll[]>(`${this.baseUrl}/create`, poll).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    updatePoll(id: string, pollData: unknown): Observable<Poll[]> {
        return this.http.patch<Poll[]>(`${this.baseUrl}/update/${id}`, pollData).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    deletePollById(id: string): Observable<Poll[]> {
        return this.http.delete<Poll[]>(`${this.baseUrl}/delete/${id}`).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }
    addQuestionToPoll(clickedQuestion: Question): void {
        if (this.questionValidationService.isQuestionTitleUnique(clickedQuestion, this.poll.questions, false)) {
            clickedQuestion.id = uuidv4();
            this.poll.questions.push(clickedQuestion);
            return;
        }
        this.messageHandler.popUpErrorDialog(ErrorMessage.QstTitleAlreadyInPoll);
    }
    modifyQuestionInQuiz(newQuestion: Question): void {
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
    sortPollBySomething(polls: Poll[]): Poll[] {
        return polls.sort();
        //
    }
    publishPoll(id: string) {
        return this.http.patch<Poll[]>(`${this.baseUrl}/publish/${id}`, {}).pipe(
            map((polls) => {
                return polls;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }
}
