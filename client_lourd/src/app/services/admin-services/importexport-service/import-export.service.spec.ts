/* voir sources dans le fichier .ts */
import { TestBed } from '@angular/core/testing';
import {
    BAD_MOCKFILE,
    GOOD_MOCKFILE,
    MOCK_NORMAL_QUIZ,
    MOCK_QCM_WITHOUT_CHOICES,
    MOCK_QUIZ_EXTRA_ATTRIBUTES,
    MOCK_QUIZ_EXTRA_CORRECTED,
} from '@app/constants/mock-import-export';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { Quiz } from '@app/interfaces/quiz';
import { MockFile } from '@app/pages/admin-related/admin-page/admin-page.component.spec';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { QuizValidationService } from '@app/services/admin-services/validation-services/quiz-validation-service/quiz-validation.service';
import { ImportExportService } from './import-export.service';

describe('ImportExportService', () => {
    let service: ImportExportService;
    let quizValidationServiceSpy: jasmine.SpyObj<QuizValidationService>;
    let questionValidationServiceSpy: jasmine.SpyObj<QuestionValidationService>;
    let quiz: Quiz;
    let mockFile: MockFile;

    beforeEach(() => {
        quizValidationServiceSpy = jasmine.createSpyObj('QuizValidationService', ['verifyQuizAttribute']);
        questionValidationServiceSpy = jasmine.createSpyObj('QuestionValidationService', ['verifyQuestion', 'isQrlChoicesFalsyOrEmpty']);
        TestBed.configureTestingModule({
            providers: [
                { provide: QuizValidationService, useValue: quizValidationServiceSpy },
                { provide: QuestionValidationService, useValue: questionValidationServiceSpy },
            ],
        });
        service = TestBed.inject(ImportExportService);
        quiz = JSON.parse(JSON.stringify(MOCK_NORMAL_QUIZ));
        mockFile = GOOD_MOCKFILE;
    });

    const createFileFromMockFile = (mockfile: typeof mockFile): File => {
        const blob = new Blob([mockfile.body], { type: mockfile.mimeType });
        Object.defineProperties(blob, {
            lastModifiedDate: {
                value: new Date(),
            },
            name: {
                value: mockfile.name,
            },
        });
        return blob as File;
    };

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('exportToJSON method should call saveAsFunc from objSaveAs with adequate parameters', () => {
        spyOn(service['objSaveAs'], 'saveAsFunc');
        service.exportToJSON(quiz);
        expect(service['objSaveAs'].saveAsFunc).toHaveBeenCalledWith(createFileFromMockFile(mockFile) as Blob, 'Quiz on Angular.json', {
            autoBom: false,
        });
    });

    it('parseFile method should return a proper quiz object', async () => {
        const fileFromMockFile = createFileFromMockFile(mockFile);
        const result: Quiz = await service.parseFile(fileFromMockFile);
        expect(result).toEqual(quiz);
    });

    it('parseFile method should reject with an error if JSON.parse throws an error', async () => {
        const fileFromMockFile = createFileFromMockFile(BAD_MOCKFILE);
        await expectAsync(service.parseFile(fileFromMockFile)).toBeRejectedWithError();
    });

    it('parseFile method should reject with an error if fileReader throws an error', async () => {
        await expectAsync(service.parseFile(null as unknown as File)).toBeRejectedWithError();
    });

    it('verifyImport method should call verifyQuizAttribute for each expected attribute and call verifyQuestion for each question in quiz', () => {
        service.verifyImport(quiz);
        service['wantedAttributesInQuiz'].forEach((wantedAttribute) =>
            expect(quizValidationServiceSpy.verifyQuizAttribute).toHaveBeenCalledWith([], wantedAttribute, quiz),
        );
        quiz.questions.forEach((question, index) =>
            expect(questionValidationServiceSpy.verifyQuestion).toHaveBeenCalledWith(question, [], index + 1),
        );
    });

    it('deleteUnwantedQuizAttribute method should delete the date and id and any extra attribute present in quiz', () => {
        const myWeirdQuiz = MOCK_QUIZ_EXTRA_ATTRIBUTES;
        service.deleteUnwantedQuizAttributes(myWeirdQuiz);
        expect(myWeirdQuiz as unknown as Quiz).toEqual(MOCK_QUIZ_EXTRA_CORRECTED as unknown as Quiz);
    });

    it('deleteUnwantedQuizAttributes should call method deleteUnwantedQuestionAttributes for each question in the quiz', () => {
        // spy sur une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'deleteUnwantedQuestionAttributes');
        service.deleteUnwantedQuizAttributes(quiz);
        quiz.questions.forEach((question) => expect(service['deleteUnwantedQuestionAttributes']).toHaveBeenCalledWith(question));
    });

    it('deleteUnwantedQuestionAttributes should call method deleteUnwantedQuestionChoiceAttributes for each choice in the question', () => {
        // spy sur une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'deleteUnwantedQuestionChoiceAttributes');
        service['deleteUnwantedQuestionAttributes'](quiz.questions[0]);
        quiz.questions[0].choices?.forEach((choice) => expect(service['deleteUnwantedQuestionChoiceAttributes']).toHaveBeenCalledWith(choice));
    });

    it('deleteUnwantedQuestionAttributes should call deleteChoicesAttributeFromQRL if question type is QRL', () => {
        const mockQRL = JSON.parse(JSON.stringify(MOCK_QCM_WITHOUT_CHOICES));
        mockQRL.type = QuestionType.QRL;
        // spy sur une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'deleteChoicesAttributeFromQRL');
        service['deleteUnwantedQuestionAttributes'](mockQRL as unknown as Question);
        expect(service['deleteChoicesAttributeFromQRL']).toHaveBeenCalledOnceWith(mockQRL as unknown as Question);
    });

    it('addDate method should add lastModification attribute to quiz and add visibility as false', () => {
        // ceci est une deconstruction d'où l'erreur de lint
        // eslint-disable-next-line no-unused-vars
        const { lastModification, visibility, ...rest } = quiz;
        const quizToTest: Partial<Quiz> = rest;
        service.addDate(quizToTest as Quiz);
        expect(quizToTest.lastModification).toBeTruthy();
        expect(quizToTest.visibility).toBeFalse();
    });

    it('deleteChoicesAttributeFromQRL should call proper method from validationService and delete choices attribute if necessary', () => {
        questionValidationServiceSpy.isQrlChoicesFalsyOrEmpty.and.callFake(() => true);
        const qrlQuestion = { type: QuestionType.QRL, text: 'a?', points: 30, choices: [] };
        service['deleteChoicesAttributeFromQRL'](qrlQuestion);
        expect(questionValidationServiceSpy.isQrlChoicesFalsyOrEmpty).toHaveBeenCalledWith([]);
        expect('choices' in qrlQuestion).toBe(false);
    });
});
