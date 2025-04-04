import { Injectable } from '@angular/core';
import { ID, INVALID_INDEX } from '@app/constants/constants';
import { ErrorMessage } from '@app/constants/enum-class';
import { EMPTY_QUIZ } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { QuizValidationService } from '@app/services/admin-services/validation-services/quiz-validation-service/quiz-validation.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root',
})
export class QuizHandlerService {
    quizId: string | undefined;
    quiz: Quiz;
    disableAnimations = false;

    constructor(
        private quizValidationService: QuizValidationService,
        private questionValidationService: QuestionValidationService,
        private messageHandler: MessageHandlerService,
    ) {
        this.quiz = this.deepCloneQuiz(EMPTY_QUIZ);
    }

    emptyQuiz() {
        this.quiz = this.deepCloneQuiz(EMPTY_QUIZ);
    }

    validateQuiz(): boolean {
        return this.quizValidationService.isQuizValid(this.quiz);
    }

    prepareQuizBeforeSubmit(): void {
        this.quiz.lastModification = new Date().toString();
        this.quiz.questions.forEach((question) => delete question[ID]);
        delete this.quiz[ID];
    }

    addQuestionToQuiz(clickedQuestion: Question): void {
        if (this.questionValidationService.isQuestionTitleUnique(clickedQuestion, this.quiz.questions, false)) {
            clickedQuestion.id = uuidv4();
            this.quiz.questions.push(clickedQuestion);
            return;
        }
        this.messageHandler.popUpErrorDialog(ErrorMessage.QstTitleAlreadyInQuiz);
    }

    modifyQuestionInQuiz(newQuestion: Question): void {
        const index = this.quiz.questions.findIndex((question) => question.id === newQuestion.id);
        const isQuestionTitleUnique = this.questionValidationService.isQuestionTitleUnique(newQuestion, this.quiz.questions, true);
        if (index !== INVALID_INDEX && isQuestionTitleUnique) {
            this.quiz.questions[index] = newQuestion;
        } else if (!isQuestionTitleUnique) {
            this.messageHandler.popUpErrorDialog(ErrorMessage.QstTitleAlreadyInQuiz);
        } else {
            this.messageHandler.popUpErrorDialog(ErrorMessage.QstDoesNotExist);
        }
    }

    deleteQuestionFromQuiz(index: number): void {
        this.quiz.questions.splice(index, 1);
    }

    private deepCloneQuiz(quiz: Quiz): Quiz {
        return JSON.parse(JSON.stringify(quiz));
    }
}
