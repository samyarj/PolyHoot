import { Injectable } from '@angular/core';
import { MAX_CHOICES, MAX_POINTS, MIN_CHOICES, MIN_POINTS, STEP } from '@app/constants/constants';
import { QreAttributes } from '@app/interfaces/qre-attributes';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { QuestionType } from '@app/interfaces/question-type';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionValidationService {
    constructor(private commonValidationService: ValidationService) {}

    isQrlChoicesFalsyOrEmpty(choices: unknown[] | unknown): boolean {
        return !choices || (Array.isArray(choices) && choices.length === 0);
    }

    isQuestionTypeValid(type: string): boolean {
        return type === QuestionType.QCM || type === QuestionType.QRL;
    }

    validateStep(points: number): boolean {
        return points % STEP === 0;
    }

    arePointsInRange(points: number): boolean {
        return points <= MAX_POINTS && points >= MIN_POINTS;
    }

    arePointsValid(points: number): boolean {
        return this.validateStep(points) && this.arePointsInRange(points);
    }

    isQuestionChoicesInRange(questionChoices: QuestionChoice[] | undefined): boolean {
        if (questionChoices) return questionChoices.length >= MIN_CHOICES && questionChoices.length <= MAX_CHOICES;
        return false;
    }

    atLeastOneFalseAndOneTrue(questionChoices: QuestionChoice[] | undefined): boolean {
        if (questionChoices) return questionChoices.some((choice) => choice.isCorrect) && questionChoices.some((choice) => !choice.isCorrect);
        return false;
    }

    areQuestionChoicesTextValid(questionChoices: QuestionChoice[] | undefined) {
        if (questionChoices) return !questionChoices.some((choice) => this.commonValidationService.isStringEmpty(choice.text));
        return false;
    }

    isQuestionTitleUnique(questionToEvaluate: Question, questions: Question[], questionModification: boolean): boolean {
        const isDuplicate = questions.find(
            (question) =>
                question.text.toLowerCase() === questionToEvaluate.text.toLowerCase() &&
                (questionModification ? question.id !== questionToEvaluate.id : true),
        );
        return !isDuplicate;
    }
    toleranceValid(qreAttributes: QreAttributes | undefined): boolean {
        if (qreAttributes) {
            if (qreAttributes.tolerance < 0) return false;
            const interval = qreAttributes.maxBound - qreAttributes.minBound;
            if (interval > 0) {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                const maxTolerance = interval / 4;
                return qreAttributes.tolerance <= maxTolerance;
            }
        }
        return false;
    }
    minBoundValid(qreAttributes: QreAttributes | undefined): boolean {
        if (qreAttributes) {
            return qreAttributes.minBound < qreAttributes.goodAnswer && qreAttributes.minBound < qreAttributes.maxBound;
        }
        return false;
    }
    maxBoundValid(qreAttributes: QreAttributes | undefined): boolean {
        if (qreAttributes) {
            return qreAttributes.maxBound > qreAttributes.minBound && qreAttributes.maxBound > qreAttributes.goodAnswer;
        }
        return false;
    }
    goodAnswerValid(qreAttributes: QreAttributes | undefined): boolean {
        if (qreAttributes) {
            return qreAttributes.goodAnswer > qreAttributes.minBound && qreAttributes.goodAnswer < qreAttributes.maxBound;
        }
        return false;
    }

    isQuestionValid(question: Question): boolean {
        switch (question.type) {
            case QuestionType.QCM:
                return this.isQcmValid(question);
            case QuestionType.QRL:
                return this.isQrlValid(question);
            case QuestionType.QRE:
                return this.isQreValid(question);
            default:
                return false;
        }
    }

    isQrlValid(qrl: Question) {
        return this.arePointsValid(qrl.points) && !this.commonValidationService.isStringEmpty(qrl.text);
    }

    isQcmValid(question: Question): boolean {
        return (
            !this.commonValidationService.isStringEmpty(question.text) &&
            this.arePointsValid(question.points) &&
            this.areQuestionChoicesTextValid(question.choices) &&
            this.atLeastOneFalseAndOneTrue(question.choices) &&
            this.commonValidationService.areTextsUnique(question.choices)
        );
    }

    isQreValid(question: Question): boolean {
        return (
            !this.commonValidationService.isStringEmpty(question.text) &&
            this.arePointsValid(question.points) &&
            this.toleranceValid(question.qreAttributes) &&
            this.minBoundValid(question.qreAttributes) &&
            this.maxBoundValid(question.qreAttributes) &&
            this.goodAnswerValid(question.qreAttributes)
        );
    }
    verifyQuestion(question: Question, errorMessages: string[], index: number) {
        if (!this.commonValidationService.isValidStringValue(question.text))
            errorMessages.push('La question #' + index + ' doit avoir un champ "text" valide');

        if (!this.commonValidationService.isValidStringValue(question.type) || !this.isQuestionTypeValid(question.type))
            errorMessages.push('La question #' + index + ' doit avoir un champ type valide qui doit être QCM ou QRL');

        if (!this.commonValidationService.isAttributeTypeOf(question.points, 'number'))
            errorMessages.push('La question #' + index + ' doit avoir un champ points pour le nombre de point qui est un number');

        if (this.commonValidationService.isAttributeTypeOf(question.points, 'number')) {
            if (!this.arePointsValid(question.points)) {
                errorMessages.push(
                    'La question #' + index + ' doit avoir un nombre de points entre 10 et 100 inclusivement qui est un multiple de 10',
                );
            }
        }

        this.verifyQuestionAccordingToType(question, errorMessages, index);
    }

    private verifyQuestionAccordingToType(question: Question, errorMessages: string[], index: number) {
        switch (question.type) {
            case QuestionType.QRL:
                if (!this.isQrlChoicesFalsyOrEmpty(question.choices)) {
                    errorMessages.push(
                        'La question #' +
                            index +
                            ' est de type QRL et elle possède un champ choices invalide. Il faut soit le retirer soit mettre [ ], null, false ou 0',
                    );
                }
                break;

            case QuestionType.QCM:
                if (Array.isArray(question.choices)) {
                    this.verifyQuestionChoices(question.choices as QuestionChoice[], errorMessages, index);
                } else {
                    errorMessages.push(
                        'La question #' + index + ' doit avoir un champ choices qui contient les choix de réponse car elle est de type QCM',
                    );
                }
                break;

            default:
                break;
        }
    }

    private verifyQuestionChoices(questionChoices: QuestionChoice[], errorMessages: string[], index: number) {
        if (!this.isQuestionChoicesInRange(questionChoices)) {
            errorMessages.push('La question #' + index + ' doit avoir entre 2 à 4 choix de réponses inclusivement');
        }

        if (!this.atLeastOneFalseAndOneTrue(questionChoices)) {
            errorMessages.push('La question #' + index + ' doit avoir au moins 1 choix de réponse true et 1 choix de réponse false');
        }

        if (!this.commonValidationService.areTextsUnique(questionChoices)) {
            errorMessages.push('La question #' + index + ' a des choix de réponses qui ont le même champ "text"');
        }

        questionChoices.forEach((choice, indexC) => {
            this.verifyQuestionChoiceText(choice, errorMessages, { indexQ: index, indexR: indexC + 1 });
            if (!this.commonValidationService.isAttributeTypeOf(choice.isCorrect, 'boolean')) {
                choice.isCorrect = false;
            }
        });
    }

    private verifyQuestionChoiceText(choice: QuestionChoice, errorMessages: string[], num: { indexQ: number; indexR: number }) {
        if (!this.commonValidationService.isValidStringValue(choice.text)) {
            errorMessages.push('Le choix de réponse #' + num.indexR + ' de la question #' + num.indexQ + ' doit avoir un champ "text" valide');
        }
    }
}
