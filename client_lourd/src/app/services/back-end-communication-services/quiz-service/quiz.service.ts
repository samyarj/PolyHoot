import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observable, catchError, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    readonly baseUrl = `${environment.serverUrl}/quizzes`;

    constructor(
        private http: HttpClient,
        private messageHandler: MessageHandlerService,
    ) {}

    getAllQuizzes(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(this.baseUrl).pipe(
            map((quizzes) => {
                this.filterQuizzes(quizzes);
                return quizzes;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    getQuizById(id: string): Observable<Quiz> {
        return this.http.get<Quiz>(`${this.baseUrl}/${id}`).pipe(
            map((quiz) => {
                this.filterQuizzes([quiz]);
                return quiz;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    createQuiz(quizData: unknown): Observable<Quiz[]> {
        return this.http.post<Quiz[]>(`${this.baseUrl}/create`, quizData).pipe(
            map((quizzes) => {
                this.filterQuizzes(quizzes);
                return quizzes;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    updateQuiz(id: string, quizData: unknown): Observable<Quiz[]> {
        return this.http.patch<Quiz[]>(`${this.baseUrl}/update/${id}`, quizData).pipe(
            map((quizzes) => {
                this.filterQuizzes(quizzes);
                return quizzes;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    toggleQuizVisibility(id: string): Observable<Quiz[]> {
        return this.http.patch<Quiz[]>(`${this.baseUrl}/toggle-visibility/${id}`, {}).pipe(
            map((quizzes) => {
                this.filterQuizzes(quizzes);
                return quizzes;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    deleteQuizById(id: string): Observable<Quiz[]> {
        return this.http.delete<Quiz[]>(`${this.baseUrl}/delete/${id}`).pipe(
            map((quizzes) => {
                this.filterQuizzes(quizzes);
                return quizzes;
            }),
            catchError(this.messageHandler.handleHttpError),
        );
    }

    private removeChoicesQrl(questions: Question[]) {
        questions.forEach((question) => {
            if (question.type === QuestionType.QRL) delete question['choices'];
        });
    }

    private filterQuizzes(quizzes: Quiz[]) {
        quizzes.forEach((quiz) => this.removeChoicesQrl(quiz.questions));
    }
}
