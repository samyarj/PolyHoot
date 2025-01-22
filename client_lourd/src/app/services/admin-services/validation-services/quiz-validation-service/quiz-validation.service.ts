import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
@Injectable({
    providedIn: 'root',
})
export class QuizValidationService {
    constructor(private commonValidationService: ValidationService) {}

    isQuestionsArrayValid(questions: Question[] | unknown): boolean {
        return Array.isArray(questions) && questions.length >= 1;
    }

    isQuizValid(quiz: Quiz): boolean {
        return (
            !this.commonValidationService.isStringEmpty(quiz.title) &&
            !this.commonValidationService.isStringEmpty(quiz.description) &&
            this.isQuestionsArrayValid(quiz.questions)
        );
    }

    isQuizTitleUnique(titleToEvaluate: string, quizzes: Quiz[]): boolean {
        titleToEvaluate = this.commonValidationService.normalizeTitle(titleToEvaluate);
        return quizzes.find((otherQuiz) => this.commonValidationService.normalizeTitle(otherQuiz.title) === titleToEvaluate) ? false : true;
    }

    verifyQuizAttribute(errorMessages: string[], attribute: string, quiz: Quiz) {
        const attributeOfQuiz = attribute as keyof Quiz;
        if (attribute in quiz) {
            const value = quiz[attributeOfQuiz];
            switch (attribute) {
                case 'title':
                case 'description': {
                    if (!this.commonValidationService.isValidStringValue(value)) {
                        errorMessages.push('Le champ obligatoire ' + attribute + ' doit être de type string et être non vide');
                    }
                    break;
                }
                case 'duration': {
                    if (!this.commonValidationService.isAttributeTypeOf(value, 'number')) {
                        errorMessages.push('Le champ obligatoire duration doit être de type number');
                    }
                    break;
                }
                case 'questions': {
                    if (!this.isQuestionsArrayValid(value)) {
                        errorMessages.push('Le jeu questionnaire doit contenir au minimum 1 question');
                    } else if (!this.commonValidationService.areTextsUnique(quiz.questions)) {
                        errorMessages.push('Certaines questions ont le même champ "text"');
                    }
                }
            }
        } else {
            errorMessages.push('Le champ obligatoire ' + attribute + ' doit être présent');
        }
    }
}
