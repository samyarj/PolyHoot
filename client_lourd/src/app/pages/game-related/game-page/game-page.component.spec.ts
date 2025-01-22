import { Location } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderGameComponent } from '@app/components/general-elements/header-game/header-game.component';
import { AppRoute, ChoiceFeedback } from '@app/constants/enum-class';
import { MOCK_QUESTIONS, MOCK_QUESTION_GAME_PAGE } from '@app/constants/mock-constants';
import { GameClientService } from '@app/services/game-services/game-client/game-client.service';
import { BehaviorSubject, of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

const BUFFER_TIME = 5000;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mockClientService: jasmine.SpyObj<GameClientService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let locationSpy: jasmine.SpyObj<Location>;

    const assignDefaultQuestion: () => void = () => {
        mockClientService.currentQuestion = MOCK_QUESTION_GAME_PAGE;
    };
    const mockMatDialog = {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of({}) }),
    };
    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        locationSpy = jasmine.createSpyObj('Location', ['path']);
        mockClientService = jasmine.createSpyObj('GameClientService', [
            'initializeQuiz',
            'selectChoice',
            'finalizeAnswer',
            'initializeNewQuestion',
            'resetQuiz',
            'fetchQuiz',
            'fetchDefaultQuiz',
            'resetInformationFields',
            'handleSockets',
            'resetAttributes',
            'sendAnswerForCorrection',
            'signalUserConnect',
            'signalUserDisconnect',
            'roomId',
            'sendModifyUpdate',
            'getTitle',
            'abandonGame',
            'removeListeners',
        ]);

        TestBed.configureTestingModule({
            declarations: [GamePageComponent, HeaderGameComponent, ChatComponent],
            imports: [RouterTestingModule, FormsModule],
            providers: [
                { provide: GameClientService, useValue: mockClientService },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: Location, useValue: locationSpy },
            ],
        });
        mockClientService.clearAnswer = new BehaviorSubject<boolean>(false);
        mockClientService.playerInfo = { submitted: false, userFirst: false, choiceSelected: [], waitingForQuestion: false };
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('getters should return expected values', () => {
        expect(component.isTesting).toEqual(false);
        expect(component.quizReady).toEqual(true);
        mockClientService.playerInfo.waitingForQuestion = true;
        mockClientService.playerInfo.submitted = true;
        mockClientService.gamePaused = true;
        mockClientService.choiceFeedback = ChoiceFeedback.Correct;
        expect(component.waitingForQuestion).toBeTrue();
        expect(component.submitted).toBeTrue();
        expect(component.gamePaused).toBeTrue();
        expect(component.choiceFeedback).toBe(ChoiceFeedback.Correct);
    });

    it('should call selectChoice with the correct index when selectChoice is called', () => {
        component.selectChoice(0);
        expect(mockClientService.selectChoice).toHaveBeenCalledWith(0);
    });

    it('should return the gameClient answers', () => {
        mockClientService['realShowAnswers'] = true;
        expect(component.showAnswers).toBe(mockClientService.showAnswers);
    });
    it('should return the pointsReceived', () => {
        mockClientService.pointsReceived = 10;
        expect(component.pointsReceived).toBe(mockClientService.pointsReceived);
    });

    it('should call finalizeAnswer when finalizeAnswer is called', () => {
        const question = MOCK_QUESTIONS[0];
        question.type = 'QCM';
        mockClientService.currentQuestion = question;
        component.finalizeAnswer();
        expect(mockClientService.finalizeAnswer).toHaveBeenCalled();
    });
    it('should send the answer for correction if its a QRL', () => {
        const question = MOCK_QUESTIONS[0];
        question.type = 'QRL';
        mockClientService.currentQuestion = question;
        component.finalizeAnswer();
        expect(mockClientService.sendAnswerForCorrection).toHaveBeenCalled();
    });
    it('should unload if "navigatedFromUnload" is in localStorage', () => {
        locationSpy.path.and.returnValue('/someOtherPath');
        spyOn(localStorage, 'getItem').and.returnValue('true');
        spyOn(localStorage, 'removeItem');
        new GamePageComponent(routerSpy, mockClientService, locationSpy);

        expect(localStorage.removeItem).toHaveBeenCalledWith('navigatedFromUnload');
        expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoute.HOME]);
    });

    it('should call signalUserDisconnect on ngOnDestroy if roomId is set and the path is not results', () => {
        locationSpy.path.and.returnValue('/someOtherPath');
        Object.defineProperty(mockClientService, 'roomId', {
            get: () => '123',
            configurable: true,
        });
        component.ngOnDestroy();
        expect(mockClientService.signalUserDisconnect).toHaveBeenCalled();
    });
    it('should call signalUserDisconnect on ngOnDestroy if roomId is set, shouldDisconnect is true and path is results', () => {
        mockClientService.shouldDisconnect = true;
        locationSpy.path.and.returnValue(AppRoute.RESULTS);
        Object.defineProperty(mockClientService, 'roomId', {
            get: () => '123',
            configurable: true,
        });
        component.ngOnDestroy();
        expect(mockClientService.signalUserDisconnect).toHaveBeenCalled();
    });

    it('should return the time', () => {
        mockClientService.time = 1;
        expect(component.time).toEqual(mockClientService.time);
    });

    it('should return the correct quiz title', () => {
        mockClientService.quizTitle = 'MockQuiz';
        expect(component.quizTitle).toBe(mockClientService.quizTitle);
    });

    it('should return the current Question', () => {
        mockClientService.currentQuestion = MOCK_QUESTION_GAME_PAGE;
        expect(component.currentQuestion).toEqual(MOCK_QUESTION_GAME_PAGE);
    });
    it('should return the first user', () => {
        mockClientService.playerInfo.userFirst = true;
        expect(component.userFirst).toBe(mockClientService.playerInfo.userFirst);
    });
    it('should return the selected choice', () => {
        mockClientService.playerInfo.choiceSelected = [true, false, false, false];
        expect(component.choiceSelected).toBe(mockClientService.playerInfo.choiceSelected);
    });
    it('should set the item in the localStorage', () => {
        spyOn(localStorage, 'setItem').and.stub();
        component.handleBeforeUnload();
        expect(localStorage.setItem).toHaveBeenCalledWith('navigatedFromUnload', 'true');
    });
    it('should remove the localStorage item and navigate home on unload', () => {
        spyOn(localStorage, 'removeItem').and.stub();
        component['onUnload']();
        expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoute.HOME]);
        expect(localStorage.removeItem).toHaveBeenCalledWith('navigatedFromUnload');
    });

    it('should return the current Index', () => {
        const mockCurrentIndex = 0;
        mockClientService.currentQuestionIndex = mockCurrentIndex;
        expect(component.currentIndex).toEqual(mockCurrentIndex);
    });

    it('should return the player points', () => {
        const mockPlayerPoints = 0;
        mockClientService.playerPoints = mockPlayerPoints;
        expect(component.playerPoints).toEqual(mockPlayerPoints);
    });

    it('handleKeyUp should set isKeyAlreadyPressed to false ', () => {
        component.isKeyAlreadyPressed = true;
        component.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }));
        expect(component.isKeyAlreadyPressed).toBeFalse();

        component.isKeyAlreadyPressed = true;
        component.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }));
        expect(component.isKeyAlreadyPressed).toBeFalse();
    });

    it('handleKeyDown, if enter key pressed, should not call finalize answer', () => {
        component.isKeyAlreadyPressed = true;
        mockClientService['finalAnswer'] = false;
        component.handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(mockClientService.finalizeAnswer).not.toHaveBeenCalled();
    });

    it('if pressing enter, should finalizeAnswer', () => {
        spyOn(component, 'finalizeAnswer');
        assignDefaultQuestion();
        component.handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(component.finalizeAnswer).toHaveBeenCalled();
    });

    it('if not pressing enter, should not finalizeAnswer', () => {
        spyOn(component, 'finalizeAnswer');
        assignDefaultQuestion();
        component.handleKeyDown(new KeyboardEvent('keydown', { key: 'a' }));
        expect(component.finalizeAnswer).not.toHaveBeenCalled();
    });

    it('if QCM, if pressing 1, should call selectChoice for first option', () => {
        spyOn(component, 'selectChoice');
        assignDefaultQuestion();
        component.handleKeyDown(new KeyboardEvent('keydown', { key: '1' }));
        expect(component.selectChoice).toHaveBeenCalledWith(0);
    });

    it('if QCM, if pressing 2, should call selectChoice for second option', () => {
        spyOn(component, 'selectChoice');
        assignDefaultQuestion();
        component.handleKeyDown(new KeyboardEvent('keydown', { key: '2' }));
        expect(component.selectChoice).toHaveBeenCalledWith(1);
    });

    it('if QCM, if pressing 3, should call selectChoice for third option', () => {
        spyOn(component, 'selectChoice');
        assignDefaultQuestion();
        component.handleKeyDown(new KeyboardEvent('keydown', { key: '3' }));
        expect(component.selectChoice).toHaveBeenCalledWith(2);
    });

    it('if QCM, if pressing 4, should call selectChoice for fourth option', () => {
        spyOn(component, 'selectChoice');
        assignDefaultQuestion();
        component.handleKeyDown(new KeyboardEvent('keydown', { key: '4' }));
        expect(component.selectChoice).toHaveBeenCalledWith(3);
    });

    it('abandonGame should call abandonGame of service', () => {
        component.abandonGame();
        expect(mockClientService.abandonGame).toHaveBeenCalled();
    });
    it('should call textHasNotBeenModified and set typingHasStopped to true after debounce time', fakeAsync(() => {
        const lastModifiedSubject = component['lastModified'];
        mockClientService.sendModifyUpdate = jasmine.createSpy().and.stub();
        lastModifiedSubject.next();
        tick(BUFFER_TIME);
        expect(component['gameClientService'].sendModifyUpdate).toHaveBeenCalledWith(false);
        expect(component['typingHasStopped']).toBeTrue();
    }));

    it('should clear the answer when clearAnswer emits true', () => {
        mockClientService.clearAnswer.next(true);
        expect(component.answer).toEqual('');
    });
    it('should notify gameClient if the text box was modified', () => {
        component['typingHasStopped'] = true;
        component['lastModified'].next = jasmine.createSpy('next').and.stub();
        component.textAreaModified();
        expect(mockClientService.sendModifyUpdate).toHaveBeenCalledWith(true);
        expect(component['lastModified'].next).toHaveBeenCalled();
    });
});
