/**
 * https://stackoverflow.com/questions/71366482/exporting-array-object-to-file-in-json-format
 * https://www.npmjs.com/package/file-saver
 * https://stackoverflow.com/questions/54971238/upload-json-file-using-angular-6
 * https://blog.shovonhasan.com/using-promises-with-filereader/
 * https://blog.stackademic.com/check-if-a-object-property-exists-in-javascript-f7369a594aa3
 * https://stackoverflow.com/questions/56568423/typescript-no-index-signature-with-a-parameter-of-type-string-was-found-on-ty
 * https://www.npmjs.com/package/@types/file-saver-es
 * https://stackoverflow.com/questions/62817554/import-saveas-from-file-saver-commonjs-or-amd-dependencies-can-cause-optimi
 * https://www.w3schools.com/jsref/jsref_includes_array.asp
 * Sources pour le fichier test:
 * https://gist.github.com/amabes/88324d68690e0e7b8e313cd0cafaa219
 * https://stackoverflow.com/questions/27164404/test-if-a-promise-is-resolved-or-rejected-with-jasmine-in-nodejs
 **/
import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { QuizValidationService } from '@app/services/admin-services/validation-services/quiz-validation-service/quiz-validation.service';
import { saveAs } from 'file-saver-es';
import { ObjSaveAs } from './obj-save-as';

@Injectable({
    providedIn: 'root',
})
export class ImportExportService {
    private objSaveAs: ObjSaveAs = {
        // L'erreur de lint est 'saveAs' is deprecated. use `{ autoBom: false }` as the third argument eslint deprecation/deprecation
        // Or, si vous regardez le code à la ligne 48 vous voyez bien que saveAs a été appelé avec { autoBom: false } comme 3ieme argument
        // mais le linter ne semble pas capter cela. De plus, ce troisième argument est spécifié dans le type de saveAs à la ligne 34
        // et aussi dans l'interface ObjSaveAs
        // eslint-disable-next-line deprecation/deprecation
        saveAsFunc: saveAs as (data: Blob | string, filename: string, options: { autoBom: false }) => void,
    };

    private wantedAttributesInQuiz: string[] = ['title', 'description', 'duration', 'questions'];
    private wantedAttributesInQuestion: string[] = ['type', 'text', 'points', 'choices'];
    private wantedAttributesInQuestionChoice: string[] = ['text', 'isCorrect'];

    constructor(
        private quizValidationService: QuizValidationService,
        private questionValidationService: QuestionValidationService,
    ) {}

    exportToJSON(quiz: Quiz) {
        const title: string = quiz.title;
        // On veut tout sauvegarder sauf la visibilité du quiz donc deconstruction nécessaire (ce qui cause l'erreur de lint)
        // eslint-disable-next-line no-unused-vars
        const { visibility, ...rest } = quiz;
        return this.objSaveAs.saveAsFunc(new Blob([JSON.stringify(rest, null, 2)], { type: 'JSON' }), title + '.json', { autoBom: false });
    }

    async parseFile(file: File): Promise<Quiz> {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                try {
                    const result = JSON.parse(fileReader.result as string);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            fileReader.readAsText(file, 'UTF-8');
        });
    }

    verifyImport(quiz: Quiz): string[] {
        const errorMessages: string[] = [];

        this.wantedAttributesInQuiz.forEach((attribute) => this.quizValidationService.verifyQuizAttribute(errorMessages, attribute, quiz));

        if (quiz.questions)
            quiz.questions.forEach((question, index) => this.questionValidationService.verifyQuestion(question, errorMessages, index + 1));

        return errorMessages;
    }

    addDate(quiz: Quiz) {
        quiz.lastModification = new Date().toString();

        quiz.visibility = false;
    }

    deleteUnwantedQuizAttributes(quiz: Quiz) {
        const quizAttributes: string[] = Object.keys(quiz);

        quizAttributes.forEach((attribute) => {
            const isAttributeWanted: boolean = this.wantedAttributesInQuiz.includes(attribute);

            if (!isAttributeWanted) {
                delete quiz[attribute as keyof Quiz];
            }
        });

        quiz.questions.forEach((question) => this.deleteUnwantedQuestionAttributes(question));
    }

    private deleteUnwantedQuestionAttributes(question: Question) {
        const questionAttributes: string[] = Object.keys(question);

        questionAttributes.forEach((attribute) => {
            const isAttributeWanted: boolean = this.wantedAttributesInQuestion.includes(attribute);

            if (!isAttributeWanted) {
                delete question[attribute as keyof Question];
            }
        });

        if (question.type === QuestionType.QRL) this.deleteChoicesAttributeFromQRL(question);

        question.choices?.forEach((choice) => {
            this.deleteUnwantedQuestionChoiceAttributes(choice);
        });
    }

    private deleteChoicesAttributeFromQRL(question: Question) {
        if (this.questionValidationService.isQrlChoicesFalsyOrEmpty(question.choices)) {
            delete question['choices'];
        }
    }

    private deleteUnwantedQuestionChoiceAttributes(questionChoice: QuestionChoice) {
        const choiceAttributes: string[] = Object.keys(questionChoice);

        choiceAttributes.forEach((attribute) => {
            const isAttributeWanted: boolean = this.wantedAttributesInQuestionChoice.includes(attribute);

            if (!isAttributeWanted) {
                delete questionChoice[attribute as keyof QuestionChoice];
            }
        });
    }
}
