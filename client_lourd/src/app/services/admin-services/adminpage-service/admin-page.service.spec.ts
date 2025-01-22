import { TestBed } from '@angular/core/testing';
import { MOCK_QUIZZES_ADMIN } from '@app/constants/mock-constants';
import { Quiz } from '@app/interfaces/quiz';
import { ImportExportService } from '@app/services/admin-services/importexport-service/import-export.service';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuizValidationService } from '@app/services/admin-services/validation-services/quiz-validation-service/quiz-validation.service';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { of } from 'rxjs';
import { AdminPageService } from './admin-page.service';

describe('AdminPageService', () => {
    let service: AdminPageService;
    let importExportServiceSpy: jasmine.SpyObj<ImportExportService>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;
    let commonValidationServiceSpy: jasmine.SpyObj<ValidationService>;
    let quizValidationServiceSpy: jasmine.SpyObj<QuizValidationService>;
    let sortingServiceSpy: jasmine.SpyObj<SortingService>;
    let quizzes: Quiz[] = MOCK_QUIZZES_ADMIN;
    const deepCloneQuizzes = (quizzesToClone: Quiz[]) => JSON.parse(JSON.stringify(quizzesToClone));

    beforeEach(() => {
        sortingServiceSpy = jasmine.createSpyObj('sortingService', ['sortQuizByLastModified']);
        quizValidationServiceSpy = jasmine.createSpyObj('QuizValidationService', ['isQuizTitleUnique']);

        commonValidationServiceSpy = jasmine.createSpyObj('validationService', ['isStringEmpty']);
        importExportServiceSpy = jasmine.createSpyObj('importExportService', [
            'exportToJSON',
            'parseFile',
            'verifyImport',
            'deleteUnwantedQuizAttributes',
            'addDate',
        ]);
        quizServiceSpy = jasmine.createSpyObj('quiz2Service', ['getAllQuizzes', 'toggleQuizVisibility', 'createQuiz', 'deleteQuizById']);
        quizServiceSpy.getAllQuizzes.and.returnValue(of(quizzes));
        quizServiceSpy.deleteQuizById.and.returnValue(of(quizzes));
        quizServiceSpy.toggleQuizVisibility.and.returnValue(of(quizzes));
        quizServiceSpy.createQuiz.and.returnValue(of(quizzes));
        const returnPromise: Promise<Quiz> = new Promise((resolve) => resolve(quizzes[1]));
        importExportServiceSpy.parseFile.and.returnValue(returnPromise);

        TestBed.configureTestingModule({
            providers: [
                { provide: ImportExportService, useValue: importExportServiceSpy },
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: ValidationService, useValue: commonValidationServiceSpy },
                { provide: QuizValidationService, useValue: quizValidationServiceSpy },
                { provide: SortingService, useValue: sortingServiceSpy },
            ],
        });
        service = TestBed.inject(AdminPageService);

        commonValidationServiceSpy = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;
        importExportServiceSpy = TestBed.inject(ImportExportService) as jasmine.SpyObj<ImportExportService>;
        quizServiceSpy = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        sortingServiceSpy = TestBed.inject(SortingService) as jasmine.SpyObj<SortingService>;

        quizzes = deepCloneQuizzes(MOCK_QUIZZES_ADMIN);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('exportToJSON should call exportToJSON from importExportService', () => {
        service.exportToJSON(quizzes[0]);
        expect(importExportServiceSpy.exportToJSON).toHaveBeenCalledWith(quizzes[0]);
    });

    it('parseFile should call parseFile from importExportService', async () => {
        const mockFile = {
            name: 'example.txt',
            size: 1000,
            type: 'text/plain',
            lastModified: Date.now(),
        };
        const result = await service.parseFile(mockFile as File);
        expect(importExportServiceSpy.parseFile).toHaveBeenCalledWith(mockFile as File);
        expect(result).toEqual(quizzes[1]);
    });

    it('verifyImport should call verifyImport from importExportService', () => {
        importExportServiceSpy.verifyImport.and.returnValue(['mockValue']);
        const result = service.verifyImport(quizzes[0]);
        expect(importExportServiceSpy.verifyImport).toHaveBeenCalledWith(quizzes[0]);
        expect(result).toEqual(['mockValue']);
    });

    it('isQuizTitleUnique should call isQuizTitleUnique from validationService', () => {
        const mockTitle = 'OVNI';
        quizValidationServiceSpy.isQuizTitleUnique.and.returnValue(true);
        const result = service.isQuizTitleUnique(mockTitle, quizzes);
        expect(quizValidationServiceSpy.isQuizTitleUnique).toHaveBeenCalledWith(mockTitle, quizzes);
        expect(result).toBeTrue();
    });

    it('isStringEmpty should call isStringEmpty from validationService', () => {
        const mockString = '  ';
        commonValidationServiceSpy.isStringEmpty.and.returnValue(true);
        const result = service.isStringEmpty(mockString);
        expect(commonValidationServiceSpy.isStringEmpty).toHaveBeenCalledWith(mockString);
        expect(result).toBeTrue();
    });

    it('makeErrorsPretty method should add a <br> string in front of every sentence in the error array', () => {
        const errors: string[] = [
            'Le champ obligatoire title doit être de type string et être non vide',
            'Le champ obligatoire description doit être de type string et être non vide',
            'Le champ obligatoire duration doit être de type number',
        ];
        service.makeErrorsPretty(errors);
        expect(errors).toEqual([
            '<br>Le champ obligatoire title doit être de type string et être non vide',
            '<br>Le champ obligatoire description doit être de type string et être non vide',
            '<br>Le champ obligatoire duration doit être de type number',
        ]);
    });

    it('processQuiz should call proper methods from importExportService', () => {
        service.processQuiz(quizzes[0]);
        expect(importExportServiceSpy.deleteUnwantedQuizAttributes).toHaveBeenCalledWith(quizzes[0]);
        expect(importExportServiceSpy.addDate).toHaveBeenCalledWith(quizzes[0]);
    });

    it('getAllQuizzes should call getAllQuizzes from quizService', () => {
        service.getAllQuizzes();
        expect(quizServiceSpy.getAllQuizzes).toHaveBeenCalled();
    });

    it('deleteQuizById should call deleteQuizById from quizService', () => {
        const mockId = 'a23n';
        service.deleteQuizById(mockId);
        expect(quizServiceSpy.deleteQuizById).toHaveBeenCalledWith(mockId);
    });

    it('toggleQuizVisibility should call toggleQuizVisibility from quizService', () => {
        const mockId = 'b32k';
        service.toggleQuizVisibility(mockId);
        expect(quizServiceSpy.toggleQuizVisibility).toHaveBeenCalledWith(mockId);
    });

    it('createQuiz should call createQuiz from quizService', () => {
        service.createQuiz(quizzes[0]);
        expect(quizServiceSpy.createQuiz).toHaveBeenCalledWith(quizzes[0]);
    });

    it('sortQuizByLastModified should call sortQuizByLastModified from sortingService', () => {
        service.sortQuizByLastModified(quizzes);
        expect(sortingServiceSpy.sortQuizByLastModified).toHaveBeenCalledWith(quizzes);
    });
});
