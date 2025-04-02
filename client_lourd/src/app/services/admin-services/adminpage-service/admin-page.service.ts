import { Injectable } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz';
import { ImportExportService } from '@app/services/admin-services/importexport-service/import-export.service';
import { QuizValidationService } from '@app/services/admin-services/validation-services/quiz-validation-service/quiz-validation.service';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { Observable } from 'rxjs';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
@Injectable({
    providedIn: 'root',
})
export class AdminPageService {
    // constructeur a 5 parametres permis selon les charges et le prof, etant donne la nature des attributs
    // eslint-disable-next-line max-params
    constructor(
        private importExportService: ImportExportService,
        private quizValidationService: QuizValidationService,
        private commonValidationService: ValidationService,
        private quizService: QuizService,
        private sortingService: SortingService,
    ) {}

    exportToJSON(quiz: Quiz): void {
        this.importExportService.exportToJSON(quiz);
    }

    async parseFile(file: File): Promise<Quiz> {
        return this.importExportService.parseFile(file);
    }

    verifyImport(quiz: Quiz): string[] {
        return this.importExportService.verifyImport(quiz);
    }

    isQuizTitleUnique(quizTitle: string, quizzes: Quiz[]): boolean {
        return this.quizValidationService.isQuizTitleUnique(quizTitle, quizzes);
    }

    isStringEmpty(stringToCheck: string): boolean {
        return this.commonValidationService.isStringEmpty(stringToCheck);
    }

    makeErrorsPretty(errors: string[]) {
        errors.forEach((message, index, array) => (array[index] = '<br>' + message));
    }

    processQuiz(quiz: Quiz): void {
        this.importExportService.deleteUnwantedQuizAttributes(quiz);
        this.importExportService.addDate(quiz);
    }

    getAllQuizzes(): Observable<Quiz[]> {
        return this.quizService.getAllQuizzes();
    }

    deleteQuizById(id: string): Observable<Quiz[]> {
        return this.quizService.deleteQuizById(id);
    }

    createQuiz(quiz: Quiz): Observable<Quiz[]> {
        return this.quizService.createQuiz(quiz);
    }

    sortQuizByLastModified(quizzes: Quiz[]): Quiz[] {
        return this.sortingService.sortQuizByLastModified(quizzes);
    }
}
