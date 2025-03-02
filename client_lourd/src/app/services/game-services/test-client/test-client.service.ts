import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BONUS_MULTIPLIER, QRL_TIME, QUESTION_DELAY } from '@app/constants/constants';
import { ChoiceFeedback } from '@app/constants/enum-class';
import type { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';
import { QuestionService } from '@app/services/back-end-communication-services/question-service/question.service';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { TimeService } from '@app/services/general-services/time-service/time.service';
import { Subject, Subscription } from 'rxjs';
import { PartialObserver } from 'rxjs/internal/types';

@Injectable({
    providedIn: 'root',
})
export class TestClientService {
    submitted: boolean;
    quiz: Quiz;
    questions: Question[];
    quizReady: boolean = false;
    showAnswers: boolean = false;
    choiceSelected: boolean[] = [false, false, false, false];
    answersCorrect: boolean;
    abandonSource = new Subject<void>();
    abandonSourceObservable = this.abandonSource.asObservable();
    currentQuestion: Question;
    currentQuestionIndex: number;
    playerPoints: number;
    choiceFeedback: ChoiceFeedback;
    isButtonDisabled: boolean;
    private finalAnswer: boolean;
    private timerSubscription: Subscription = new Subscription();
    private timeoutId: ReturnType<typeof setTimeout> | null = null;

    private quizObserver: PartialObserver<Quiz> = {
        next: (quiz: Quiz) => {
            this.quiz = quiz;
            this.questions = quiz.questions;
            this.initializeQuiz();
            this.quizReady = true;
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };

    // constructeur a 4 parametres permis selon les charges et le prof, etant donne la nature des attributs
    // eslint-disable-next-line max-params
    constructor(
        readonly timeService: TimeService,
        public quizService: QuizService,
        private questionService: QuestionService,
        private messageHandlerService: MessageHandlerService,
    ) {}

    get time(): number {
        return this.timeService.time;
    }
    get baseUrl(): string {
        return this.questionService.baseUrl;
    }

    leavingPage(): void {
        this.resetAttributes();
        this.timeService.stopTimer();
        this.quizReady = false;
        this.stopTimerSubscription();
        this.cancelTimeout();
    }

    initializeSubscription(): void {
        this.timerSubscription = this.timeService.timeSourceObservable.subscribe((time: number) => {
            if (time === 0) {
                this.finalizeAnswer();
            }
        });
    }

    fetchQuiz(id: string) {
        this.quizService.getQuizById(id).subscribe(this.quizObserver);
    }

    selectChoice(indexChoice: number): boolean {
        if (this.time > 0 && !this.finalAnswer) {
            if (this.currentQuestion.choices && this.currentQuestion.choices[indexChoice]) {
                this.choiceSelected[indexChoice] = !this.choiceSelected[indexChoice];
                this.currentQuestion.choices[indexChoice].isSelected = !this.currentQuestion.choices[indexChoice].isSelected;
                return true;
            }
        }
        return false;
    }

    finalizeAnswer() {
        if (!this.finalAnswer) {
            this.submitted = true;
            this.stopTimerSubscription();
            this.finalAnswer = true;
            this.addPoints();
            this.showAnswers = true;
            this.choiceSelected = [false, false, false, false];
            this.timeoutId = setTimeout(() => {
                this.initializeNewQuestion();
                this.submitted = false;
            }, QUESTION_DELAY);
        }
    }
    resetAttributes() {
        this.answersCorrect = false;
        this.finalAnswer = false;
        this.submitted = false;
        this.choiceSelected = [false, false, false, false];
        this.showAnswers = false;
        this.choiceFeedback = ChoiceFeedback.Idle;
        if (this.currentQuestion && this.currentQuestion.choices) {
            for (const choice of this.currentQuestion.choices) {
                choice.isSelected = false;
            }
        }
    }

    abandonGame() {
        this.resetAttributes();
        this.quizReady = false;
        this.abandonSource.next();
    }
    private stopTimerSubscription(): void {
        this.timerSubscription.unsubscribe();
    }
    private addPoints() {
        this.questionService.verifyAnswers(this.currentQuestion).subscribe({
            next: (allAnswersCorrect: boolean) => {
                this.answersCorrect = allAnswersCorrect;
                if (this.currentQuestion.type === QuestionType.QCM) {
                    if (allAnswersCorrect) {
                        this.playerPoints += this.currentQuestion.points * BONUS_MULTIPLIER;
                        this.choiceFeedback = ChoiceFeedback.First;
                    } else {
                        this.choiceFeedback = ChoiceFeedback.Incorrect;
                    }
                } else {
                    // gérer cas QRL, on ajoute les points par défaut;
                    this.playerPoints += this.currentQuestion.points;
                    this.choiceFeedback = ChoiceFeedback.Correct;
                }
            },
            error: (httpErrorResponse: HttpErrorResponse) => {
                this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
            },
        });
    }

    private initializeQuiz() {
        this.questions = this.quiz.questions;
        this.currentQuestion = this.questions[0];
        this.playerPoints = 0;
        this.currentQuestionIndex = 0;
        this.resetAttributes();
        this.initializeQuestionTimer();
    }

    private initializeNewQuestion() {
        this.initializeSubscription();
        this.resetAttributes();
        if (this.currentQuestionIndex + 1 < this.questions.length) {
            this.currentQuestion = this.questions[++this.currentQuestionIndex];
            this.initializeQuestionTimer();
        } else {
            this.finalAnswer = true;
            this.abandonGame();
        }
    }

    private initializeQuestionTimer() {
        if (this.currentQuestion.type === QuestionType.QCM || this.currentQuestion.type === QuestionType.QRE) {
            this.timeService.resetTimer(this.quiz.duration);
        } else if (this.currentQuestion.type === QuestionType.QRL) {
            this.timeService.resetTimer(QRL_TIME);
        }
    }

    private cancelTimeout(): void {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}
