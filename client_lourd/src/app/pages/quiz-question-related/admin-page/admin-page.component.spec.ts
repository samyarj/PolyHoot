/* voir les références dans la page admin.ts */
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderGameComponent } from '@app/components/layout/filler/header-game/header-game.component';
import { AppRoute, ConfirmationMessage } from '@app/constants/enum-class';
import { MOCK_QUIZZES_ADMIN } from '@app/constants/mock-constants';
import { Quiz } from '@app/interfaces/quiz';
import { AdminPageService } from '@app/services/admin-services/adminpage-service/admin-page.service';
import { AuthentificationService } from '@app/services/admin-services/authentification-service/authentification.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
import SpyObj = jasmine.SpyObj;

export interface MockFile {
    name: string;
    body: string;
    mimeType: string;
}

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let authentificationServiceSpy: SpyObj<AuthentificationService>;
    let adminPageServiceSpy: SpyObj<AdminPageService>;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;
    let router: Router;
    let quizzes: Quiz[] = MOCK_QUIZZES_ADMIN;
    const dialogNativeElementSpy = jasmine.createSpyObj('nativeElement', ['showModal', 'close']);
    const deepCloneQuizzes = (quizzesToClone: Quiz[]) => JSON.parse(JSON.stringify(quizzesToClone));

    const createFileFromMockFile = (mockfile: MockFile): File => {
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

    beforeEach(() => {
        authentificationServiceSpy = jasmine.createSpyObj('authentification', ['unauthorize']);
        messageHandlerServiceSpy = jasmine.createSpyObj('errorHandlerService', ['popUpErrorDialog', 'confirmationDialog']);
        messageHandlerServiceSpy.confirmationDialog.and.callFake((message: string, callback: () => void) => {
            callback();
        });

        adminPageServiceSpy = jasmine.createSpyObj('adminPageService', [
            'sortQuizByLastModified',
            'getAllQuizzes',
            'deleteQuizById',
            'toggleQuizVisibility',
            'isQuizTitleUnique',
            'isStringEmpty',
            'createQuiz',
            'parseFile',
            'verifyImport',
            'makeErrorsPretty',
            'processQuiz',
            'isQuizTitleUnique',
            'createQuiz',
            'exportToJSON',
        ]);
        adminPageServiceSpy.getAllQuizzes.and.returnValue(of(quizzes));
        adminPageServiceSpy.deleteQuizById.and.returnValue(of(quizzes));
        adminPageServiceSpy.toggleQuizVisibility.and.returnValue(of(quizzes));
        adminPageServiceSpy.createQuiz.and.returnValue(of(quizzes));
        const returnPromise: Promise<Quiz> = new Promise((resolve) => resolve(quizzes[1]));
        adminPageServiceSpy.parseFile.and.returnValue(returnPromise);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminPageComponent, HeaderGameComponent],
            imports: [RouterTestingModule, MatIconModule, ReactiveFormsModule, BrowserAnimationsModule],
            providers: [
                { provide: AuthentificationService, useValue: authentificationServiceSpy },
                { provide: AdminPageService, useValue: adminPageServiceSpy },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
        });
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        component.dialog = { nativeElement: dialogNativeElementSpy };
        quizzes = deepCloneQuizzes(MOCK_QUIZZES_ADMIN);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to /admin/questionBank if logged in when question bank button is pressed', () => {
        spyOn(component, 'navigate');
        fixture.detectChanges();
        const questionBankButton = fixture.debugElement.nativeElement.querySelector('#questionBankButton');
        questionBankButton.click();
        expect(component.navigate).toHaveBeenCalledWith('/admin/questionBank');
    });

    it('should navigate to /admin/createQuiz if logged in when create quiz button is pressed', () => {
        spyOn(component, 'navigate');
        fixture.detectChanges();
        const createQuizButton = fixture.debugElement.nativeElement.querySelector('#createQuizButton');
        createQuizButton.click();
        expect(component.navigate).toHaveBeenCalledWith('/admin/createQuiz');
    });

    it('function navigate should redirect to the string passed in', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.navigate(AppRoute.LOGIN);
        expect(navigateSpy).toHaveBeenCalledWith([AppRoute.LOGIN]);
    });

    it('should navigate to /admin/modifierQuiz/:id where id is the id of the quiz when call to goToEdit is triggered', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const mockQuizId = '123abc';
        component.goToEdit(mockQuizId);
        expect(navigateSpy).toHaveBeenCalledWith(['/admin/modifierQuiz/' + mockQuizId]);
    });

    it('should redirect user to home page if logout button is clicked and should call unauthorize', () => {
        fixture.detectChanges();
        const navigateSpy = spyOn(router, 'navigate');
        const logoutButton = fixture.debugElement.nativeElement.querySelector('#logout');
        logoutButton.click();
        expect(navigateSpy).toHaveBeenCalledWith([AppRoute.HOME]);
        expect(authentificationServiceSpy.unauthorize).toHaveBeenCalled();
    });

    it('should call proper method from adminPageService if deleteCallback method is called', () => {
        const mockQuizId = 'quizId123';
        component['deleteCallback'](mockQuizId);
        expect(adminPageServiceSpy.deleteQuizById).toHaveBeenCalledWith(mockQuizId);
        expect(adminPageServiceSpy.sortQuizByLastModified).toHaveBeenCalledWith(quizzes);
    });

    it('should call confirmationDialog from messageHandlerService if delete is called and quizId is defined', () => {
        const mockQuizId = 'quizId123';
        // spy sur une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deleteCallbackSpy = spyOn<any>(component, 'deleteCallback');
        component.delete(mockQuizId);
        expect(messageHandlerServiceSpy.confirmationDialog).toHaveBeenCalledWith(ConfirmationMessage.DeleteGame, jasmine.any(Function));
        expect(deleteCallbackSpy).toHaveBeenCalled();
    });

    it('should not call confirmationDialog from messageHandlerService if quizId is undefined', () => {
        component.delete(undefined);
        expect(messageHandlerServiceSpy.confirmationDialog).not.toHaveBeenCalled();
    });
    it('should call proper method from adminPageService if delete method is triggered by delete button click', () => {
        spyOn(component, 'delete').and.callThrough();

        component.delete(quizzes[0].id);
        expect(component.delete).toHaveBeenCalledWith(quizzes[0].id);
        expect(adminPageServiceSpy.deleteQuizById).toHaveBeenCalled();
        expect(adminPageServiceSpy.sortQuizByLastModified).toHaveBeenCalled();
    });

    it('should call proper method from adminPageService if toggleVisibility method is triggered by toggle button click', () => {
        const mockQuizId = 'id123';
        component.toggleVisibility(mockQuizId);
        expect(adminPageServiceSpy.toggleQuizVisibility).toHaveBeenCalledWith(mockQuizId);
        expect(adminPageServiceSpy.sortQuizByLastModified).toHaveBeenCalledWith(quizzes);
    });

    it('should call proper method from adminPageService if export method is triggered by export button click', () => {
        component.export(quizzes[0]);
        expect(adminPageServiceSpy.exportToJSON).toHaveBeenCalledWith(quizzes[0]);
    });

    it('Should call proper methods if handleFileImport method is triggered by a file upload event with no errors', async () => {
        const fakeChangeEvent = new Event('change');
        const mockFile = {
            name: 'Quiz on Angular 2',
            body: JSON.stringify(quizzes[1]),
            mimeType: 'application/json',
        };
        const fileFromMockFile = createFileFromMockFile(mockFile);
        Object.defineProperties(fakeChangeEvent, { target: { writable: false, value: { files: [fileFromMockFile] } } });
        // handleErrors est une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'handleErrors');
        await component.handleFileImport(fakeChangeEvent);
        expect(adminPageServiceSpy.parseFile).toHaveBeenCalledWith(fileFromMockFile);
        expect(component['handleErrors']).toHaveBeenCalledWith(quizzes[1]);
    });

    it('handleFileImport method should not call parseFile and handleErrors if no file has been selected', async () => {
        const fakeChangeEvent = new Event('change');
        Object.defineProperties(fakeChangeEvent, { target: { writable: false, value: { files: '' } } });
        // handleErrors est une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'handleErrors');
        await component.handleFileImport(fakeChangeEvent);
        expect(adminPageServiceSpy.parseFile).not.toHaveBeenCalled();
        expect(component['handleErrors']).not.toHaveBeenCalled();
    });

    it('handleFileImport should not call handleErrors if parseFile method throws an error and user should receive a pop up', async () => {
        const fakeChangeEvent = new Event('change');
        const mockFile = {
            name: 'Quiz on Angular 2',
            body: JSON.stringify(quizzes[1]),
            mimeType: 'application/json',
        };
        const fileFromMockFile = createFileFromMockFile(mockFile);
        Object.defineProperties(fakeChangeEvent, { target: { writable: false, value: { files: [fileFromMockFile] } } });
        // handleErrors est une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'handleErrors');
        const returnPromise = Promise.reject(new Error('cannot parse file'));
        adminPageServiceSpy.parseFile.and.returnValue(returnPromise);
        await component.handleFileImport(fakeChangeEvent);
        expect(component['handleErrors']).not.toHaveBeenCalled();
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith(
            'Une erreur a eu lieu : <br>Error: cannot parse file<br>Assurez-vous de sélectionner un fichier de type JSON valide.',
        );
    });

    it('handleErrors method should not call supplementary methods from adminPageService if errors are detected and should notify user', () => {
        adminPageServiceSpy.verifyImport.and.returnValue(['titre inadequat']);
        // handleTitle est une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'handleTitle');
        component['handleErrors'](quizzes[0]);
        expect(adminPageServiceSpy.verifyImport).toHaveBeenCalledWith(quizzes[0]);
        expect(adminPageServiceSpy.processQuiz).not.toHaveBeenCalled();
        expect(component['handleTitle']).not.toHaveBeenCalled();
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('Il y a eu 1 erreur(s) détectée(s) titre inadequat');
    });

    it('method handleErrors should call supplementary methods if no error on the quiz is detected', () => {
        adminPageServiceSpy.verifyImport.and.returnValue([]);
        // handleTitle est une methode privee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'handleTitle');
        component['handleErrors'](quizzes[0]);
        expect(adminPageServiceSpy.verifyImport).toHaveBeenCalledWith(quizzes[0]);
        expect(adminPageServiceSpy.processQuiz).toHaveBeenCalledWith(quizzes[0]);
        expect(component['handleTitle']).toHaveBeenCalledWith(quizzes[0]);
    });

    it('User should receive a pop up message if quizService sends an httpErrorResponse', () => {
        const errorResponse = new HttpErrorResponse({
            error: { code: 500, message: 'Internal Error' },
            status: 500,
            statusText: 'Internal Server error ',
        });
        adminPageServiceSpy.getAllQuizzes.and.returnValue(throwError(() => errorResponse));
        adminPageServiceSpy.getAllQuizzes().subscribe(component['quizzesObserver']);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith(errorResponse.error.message);
    });

    it('method handleTitle should call create quiz from service if title of quiz is unique', () => {
        component.quizzes = [quizzes[1]];
        adminPageServiceSpy.isQuizTitleUnique.and.returnValue(true);
        component['handleTitle'](quizzes[0]);
        expect(adminPageServiceSpy.createQuiz).toHaveBeenCalledWith(quizzes[0]);
        expect(adminPageServiceSpy.sortQuizByLastModified).toHaveBeenCalledWith(quizzes);
    });

    it('method handleTitle should not call create quiz from service if title of quiz isnt unique and should open modal', () => {
        component.quizzes = [quizzes[1]];
        adminPageServiceSpy.isQuizTitleUnique.and.returnValue(false);
        component['handleTitle'](quizzes[1]);
        expect(adminPageServiceSpy.createQuiz).not.toHaveBeenCalled();
        expect(dialogNativeElementSpy.showModal).toHaveBeenCalled();
    });

    it('method onClickHandleTitle should call createQuiz and should close modal', () => {
        const mockQuiz = JSON.parse(JSON.stringify(quizzes[0]));
        component.title.setValue('un titre');
        component['quizToAdd'] = mockQuiz;
        component.onClickHandleTitle();
        expect(adminPageServiceSpy.createQuiz).toHaveBeenCalledWith(mockQuiz);
        expect(adminPageServiceSpy.sortQuizByLastModified).toHaveBeenCalled();
        expect(dialogNativeElementSpy.close).toHaveBeenCalled();
    });

    it('method isTitleEmpty should call isStringEmpty from adminPageService if title.value is defined', () => {
        const mockTitle = 'Title';
        component.title.setValue(mockTitle);
        adminPageServiceSpy.isStringEmpty.and.returnValue(false);
        const result = component.isTitleEmpty();
        expect(adminPageServiceSpy.isStringEmpty).toHaveBeenCalledWith(mockTitle);
        expect(result).toBeFalse();
    });

    it('method isTitleEmpty should return true if this.title.value is null', () => {
        component.title.setValue(null);
        const result = component.isTitleEmpty();
        expect(result).toBe(true);
        expect(adminPageServiceSpy.isStringEmpty).not.toHaveBeenCalled();
    });

    it('isTitleUnique method should call isQuizTitleUnique from adminPageService if title.value isnt null', () => {
        const mockTitle = 'Maurice';
        component.quizzes = quizzes;
        component.title.setValue(mockTitle);
        adminPageServiceSpy.isQuizTitleUnique.and.returnValue(false);
        const result = component.isTitleUnique();
        expect(adminPageServiceSpy.isQuizTitleUnique).toHaveBeenCalledWith(mockTitle, quizzes);
        expect(result).toBeFalse();
    });

    it('isTitleUnique should return true if title.value is null', () => {
        component.title.setValue(null);
        const result = component.isTitleUnique();
        expect(result).toBeTrue();
    });

    it('should return the unique identifier of the quiz', () => {
        const index = 0;
        expect(component.trackByFn(index, MOCK_QUIZZES_ADMIN[0])).toBe(MOCK_QUIZZES_ADMIN[0].id);
    });

    it('should return different identifiers for different quizzes', () => {
        const index1 = 0;
        const index2 = 1;
        expect(component.trackByFn(index1, MOCK_QUIZZES_ADMIN[0])).not.toBe(component.trackByFn(index2, MOCK_QUIZZES_ADMIN[1]));
    });
});
