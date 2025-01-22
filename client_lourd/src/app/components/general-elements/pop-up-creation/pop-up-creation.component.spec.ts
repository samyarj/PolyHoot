/* eslint-disable @typescript-eslint/no-explicit-any */
// utilise pour les attributs prives
import { HttpClient, HttpErrorResponse, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JoinEvents } from '@app/constants/enum-class';
import { MOCK_POP_UP_QUIZ } from '@app/constants/mock-constants';
import { QuizService } from '@app/services/back-end-communication-services/quiz-service/quiz.service';
import { WaitingPageService } from '@app/services/waiting-room-services/waiting-page.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { of, throwError } from 'rxjs';
import { PopUpCreationComponent } from './pop-up-creation.component';

describe('PopUpCreationComponent', () => {
    let component: PopUpCreationComponent;
    let fixture: ComponentFixture<PopUpCreationComponent>;

    const mockMatDialog = {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of({}) }),
    };

    const mockMatDialogRef = {
        close: jasmine.createSpy('close'),
        afterClosed: () => of({}),
    };

    const mockSocketService = {
        send: jasmine.createSpy('send'),
        isRandomMode: false,
        isOrganizer: false,
        playerName: '',
    };

    const mockRouter = {
        navigate: jasmine.createSpy('navigate'),
    };

    const mockHandler = {
        handle: jasmine.createSpy('handle').and.returnValue(of({})),
    };

    const mockQuizService = jasmine.createSpyObj('QuizService', ['getQuizById', 'quizExists', 'quizIsVisible']);

    const waitingPageServiceSpy = jasmine.createSpyObj('waitingPageService', ['players']);

    const mockDialogData = { data: MOCK_POP_UP_QUIZ };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PopUpCreationComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: MatDialogRef, useValue: mockMatDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
                { provide: Router, useValue: mockRouter },
                { provide: QuizService, useValue: mockQuizService },
                { provide: HttpClient },
                { provide: HttpHandler, useValue: mockHandler },
                { provide: SocketClientService, useValue: mockSocketService },
                { provide: WaitingPageService, useValue: waitingPageServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PopUpCreationComponent);
        component = fixture.componentInstance;
        component.data = mockDialogData.data;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the pop-up when the exit button is clicked', () => {
        spyOn(component, 'onClose').and.callThrough();
        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();
        expect(component.onClose).toHaveBeenCalled();
    });

    it('should display the correct information of the quiz', async () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.quiz-title').textContent.trim()).toBe(MOCK_POP_UP_QUIZ.title);
        expect(compiled.querySelector('.quiz-description').textContent.trim()).toContain(MOCK_POP_UP_QUIZ.description);
        expect(compiled.querySelector('.quiz-time').textContent.trim()).toContain(MOCK_POP_UP_QUIZ.duration);
    });

    it('should show the questions of the quiz', async () => {
        const compiled = fixture.debugElement.nativeElement;
        const questionElements = compiled.querySelectorAll('.questions-list li');
        expect(questionElements.length).toBe(MOCK_POP_UP_QUIZ.questions.length);
        for (let i = 0; i < questionElements.length; i++) {
            expect(questionElements[i].textContent).toContain(MOCK_POP_UP_QUIZ.questions[i].text);
        }
    });
    it('should redirect to /waiting upon clicking playing with a game', async () => {
        spyOn(component, 'navigate').and.stub();
        mockSocketService.send.and.callFake((eventName, data, callback) => {
            callback('someRoomId');
        });
        component.isQuizValid = true;
        const button = fixture.debugElement.nativeElement.querySelector('.play-button');
        button.click();
        fixture.detectChanges();
        const expectedData = { quiz: component.data, isRandomMode: false };
        expect(mockSocketService.send).toHaveBeenCalledWith(JoinEvents.Create, expectedData, jasmine.any(Function));
    });
    it('should handle random mode correctly when creating a new game', async () => {
        component.data.title = 'Mode aléatoire';
        waitingPageServiceSpy.players = [];
        mockSocketService.isOrganizer = false;
        mockSocketService.playerName = 'Organisateur';
        waitingPageServiceSpy.players = ['Organisateur'];
        mockSocketService.isRandomMode = true;
        component.isQuizValid = true;
        const button = fixture.debugElement.nativeElement.querySelector('.play-button');
        button.click();
        fixture.detectChanges();
        const expectedData = { quiz: component.data, isRandomMode: true };
        expect(mockSocketService.send).toHaveBeenCalledWith(JoinEvents.Create, expectedData, jasmine.any(Function));
        expect(mockSocketService.isRandomMode).toBeTrue();
        expect(mockSocketService.isOrganizer).toBeFalse();
        expect(mockSocketService.playerName).toEqual('Organisateur');
        expect(waitingPageServiceSpy.players).toEqual(['Organisateur']);
        component.data.title = 'React Quiz';
    });
    it('should verify local storage and navigate to /waiting upon creating a new game', async () => {
        spyOn(component, 'navigate').and.stub();
        mockSocketService.send.and.callFake((eventName, data, callback) => {
            callback('someRoomId');
        });
        const getItemSpy = spyOn(localStorage, 'getItem').and.returnValue('true');
        const removeItemSpy = spyOn(localStorage, 'removeItem');

        const button = fixture.debugElement.nativeElement.querySelector('.play-button');
        button.click();
        fixture.detectChanges();
        const expectedData = { quiz: component.data, isRandomMode: false };
        expect(mockSocketService.send).toHaveBeenCalledWith(JoinEvents.Create, expectedData, jasmine.any(Function));
        expect(component.navigate).toHaveBeenCalledWith('/waiting');
        expect(getItemSpy).toHaveBeenCalledWith('navigatedFromUnload');
        expect(removeItemSpy).toHaveBeenCalledWith('navigatedFromUnload');
    });

    it('should open an error pop-up if quiz is not valid', async () => {
        component.isQuizValid = false;
        if (component.data.title !== 'Mode aléatoire') {
            const button = fixture.debugElement.nativeElement.querySelector('.test-button');
            spyOn<any>(component, 'openErrorMessage').and.callThrough();
            button.click();
            fixture.detectChanges();
            expect(component['openErrorMessage']).toHaveBeenCalled();
        }
    });

    it('should set data and isQuizValid to true when quiz.visibility is true', () => {
        const quiz = MOCK_POP_UP_QUIZ;
        quiz.visibility = true;
        mockQuizService.getQuizById.and.returnValue(of(quiz));
        if (quiz.id) {
            component['fetchQuizById'](quiz.id);
            expect(component.data).toEqual(quiz);
            expect(component.isQuizValid).toBeTrue();
        }
    });

    it('should set errorMessage and isQuizValid to false when quiz.visibility is not true', () => {
        const quiz = MOCK_POP_UP_QUIZ;
        quiz.visibility = false;
        mockQuizService.getQuizById.and.returnValue(of(quiz));
        if (quiz.id) {
            component['fetchQuizById'](quiz.id);
            expect(component.errorMessage).toBe('Le jeu a été caché aux utilisateurs!');
            expect(component.isQuizValid).toBeFalse();
        }
    });

    it('should handle absence of quiz.visibility properly', () => {
        const quiz = { id: '1234' };
        mockQuizService.getQuizById.and.returnValue(of(quiz));
        component['fetchQuizById'](quiz.id);
        expect(component.errorMessage).toBe('Le jeu a été caché aux utilisateurs!');
        expect(component.isQuizValid).toBeFalse();
    });

    it('should set errorMessage when fetching quiz by ID fails', () => {
        const errorResponse = new HttpErrorResponse({
            status: 404,
        });
        mockQuizService.getQuizById.and.returnValue(throwError(() => errorResponse));
        component['fetchQuizById']('id-not-in-DB');

        const expectedErrorMessage = "Le jeu n'existe plus. Message erreur: " + errorResponse.message;
        expect(component.errorMessage).toBe(expectedErrorMessage);
    });

    it('should navigate if quiz is valid', () => {
        component.isQuizValid = true;
        component.navigate('mockRoute');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['mockRoute']);
        expect(component.dialogRef.close).toHaveBeenCalled();
    });
});
