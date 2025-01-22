import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observable, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    readonly baseUrl = `${environment.serverUrl}/questions`;

    constructor(
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
    ) {}

    getAllQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(this.baseUrl).pipe(catchError(this.messageHandler.handleHttpError));
    }

    getQuestionById(id: string): Observable<Question> {
        return this.http.get<Question>(`${this.baseUrl}/${id}`).pipe(catchError(this.messageHandler.handleHttpError));
    }

    createQuestion(questionData: Question): Observable<Question[]> {
        return this.http.post<Question[]>(`${this.baseUrl}/create`, questionData).pipe(catchError(this.messageHandler.handleHttpError));
    }

    updateQuestion(id: string, questionData: Partial<Question>): Observable<Question[]> {
        return this.http.patch<Question[]>(`${this.baseUrl}/update/${id}`, questionData).pipe(catchError(this.messageHandler.handleHttpError));
    }

    deleteQuestionById(id: string): Observable<Question[]> {
        return this.http.delete<Question[]>(`${this.baseUrl}/delete/${id}`).pipe(catchError(this.messageHandler.handleHttpError));
    }

    verifyAnswers(currentQuestion: Question): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/validate-answers`, currentQuestion).pipe(catchError(this.messageHandler.handleHttpError));
    }
}
