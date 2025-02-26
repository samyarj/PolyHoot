import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderGameComponent } from '@app/components/layout/filler/header-game/header-game.component';
import { AppRoute } from '@app/constants/enum-class';
import { QuestionType } from '@app/interfaces/question-type';
import { ResultsService } from '@app/services/game-services/results-service/results-service.service';
import { of } from 'rxjs';
import { ResultsPageComponent } from './results-page.component';

describe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;
    let resultsServiceSpy: jasmine.SpyObj<ResultsService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let locationSpy: jasmine.SpyObj<Location>;
    const mockMatDialog = {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of({}) }),
    };
    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        locationSpy = jasmine.createSpyObj('Location', ['path']);
        resultsServiceSpy = jasmine.createSpyObj('ResultsService', ['sortPlayers', 'setAnswersArray', 'setCorrectAnswers', 'disconnectUser'], {
            questions: [
                {
                    id: 'q1',
                    type: QuestionType.QCM,
                    text: 'What is the capital of France?',
                    points: 5,
                    choices: [
                        { text: 'Paris', isCorrect: true },
                        { text: 'London', isCorrect: false },
                        { text: 'Rome', isCorrect: false },
                    ],
                    lastModified: new Date().toString(),
                },
                {
                    id: 'q2',
                    type: QuestionType.QCM,
                    text: 'Who wrote Hamlet?',
                    points: 5,
                    choices: [
                        { text: 'William Shakespeare', isCorrect: true },
                        { text: 'Charles Dickens', isCorrect: false },
                        { text: 'Leo Tolstoy', isCorrect: false },
                    ],
                    lastModified: new Date().toString(),
                },
                {
                    id: 'q3',
                    type: QuestionType.QCM,
                    text: 'Which country is known for its tulips?',
                    points: 3,
                    choices: [
                        { text: 'Netherlands', isCorrect: true },
                        { text: 'Italy', isCorrect: false },
                        { text: 'France', isCorrect: false },
                        { text: 'Japan', isCorrect: false },
                    ],
                    lastModified: new Date().toString(),
                },
            ],
        });
        resultsServiceSpy.question = resultsServiceSpy.questions[0];
        TestBed.configureTestingModule({
            declarations: [ResultsPageComponent, HeaderGameComponent, ChatComponent],
            imports: [FormsModule, MatIconModule],
            providers: [
                { provide: ResultsService, useValue: resultsServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: Location, useValue: locationSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should set the item in the localStorage', () => {
        spyOn(localStorage, 'setItem').and.stub();
        component.handleBeforeUnload();
        expect(localStorage.setItem).toHaveBeenCalledWith('navigatedFromUnload', 'true');
    });

    it('should unload if "navigatedFromUnload" is in localStorage', () => {
        locationSpy.path.and.returnValue('/someOtherPath');
        spyOn(localStorage, 'getItem').and.returnValue('true');
        spyOn(localStorage, 'removeItem');

        new ResultsPageComponent(resultsServiceSpy, routerSpy, locationSpy);
        component.ngOnInit();
        expect(localStorage.removeItem).toHaveBeenCalledWith('navigatedFromUnload');
        expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoute.HOME]);
    });

    it('should get correctAnswersArray from resultsService', () => {
        expect(component.correctAnswersArray).toEqual(resultsServiceSpy.correctAnswersArray);
    });
    it('should get nbPlayers from resultsService', () => {
        expect(component.nbPlayers).toEqual(resultsServiceSpy.nbPlayers);
    });
    it('should get playerList from resultsService', () => {
        expect(component.playerList).toEqual(resultsServiceSpy.playerList);
    });
    it('navigate(next) should navigate to the next question', () => {
        resultsServiceSpy.currentQuestionIndex = 0;
        component.navigate('next');
        expect(resultsServiceSpy.currentQuestionIndex).toEqual(1);
        expect(resultsServiceSpy.question).toEqual(resultsServiceSpy.questions[1]);
    });

    it('navigate(previous) should navigate to the previous question', () => {
        resultsServiceSpy.currentQuestionIndex = 2;
        resultsServiceSpy.question = resultsServiceSpy.questions[2];
        component.navigate('previous');
        expect(resultsServiceSpy.currentQuestionIndex).toEqual(1);
        expect(resultsServiceSpy.question).toEqual(resultsServiceSpy.questions[1]);
    });
    it('navigate() should not navigate if the direction is not next or previous', () => {
        resultsServiceSpy.currentQuestionIndex = 0;
        component.navigate('random');
        expect(resultsServiceSpy.currentQuestionIndex).toEqual(0);
        expect(resultsServiceSpy.question).toEqual(resultsServiceSpy.questions[0]);
    });
    it('navigate() should set correct variables if previous is not possible', () => {
        resultsServiceSpy.currentQuestionIndex = 0;
        component.navigate('random');
        expect(component.canShowNext).toEqual(true);
        expect(component.canShowPrevious).toEqual(false);
    });
    it('navigate() should set correct variables if next is not possible', () => {
        resultsServiceSpy.currentQuestionIndex = resultsServiceSpy.questions.length - 1;
        component.navigate('random');
        expect(component.canShowNext).toEqual(false);
        expect(component.canShowPrevious).toEqual(true);
    });
    it('canNavigate() should set correct variables if quiz has only 1 question', () => {
        resultsServiceSpy.questions.length = 1;
        component['canNavigate']();
        expect(component.canShowNext).toEqual(false);
        expect(component.canShowPrevious).toEqual(false);
    });
    it('returnHome() should navigate to home', () => {
        component.returnHome();
        expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoute.HOME]);
    });
    it('should call signalUserDisconnect on ngOnDestroy if roomId is set and the path is not results', () => {
        locationSpy.path.and.returnValue('/someOtherPath');
        Object.defineProperty(resultsServiceSpy, 'roomId', {
            get: () => '123',
            configurable: true,
        });
        component.ngOnDestroy();
        expect(resultsServiceSpy.disconnectUser).toHaveBeenCalled();
    });
});
