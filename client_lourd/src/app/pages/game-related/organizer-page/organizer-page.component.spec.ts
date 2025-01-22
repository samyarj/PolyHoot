import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SoundPlayer } from '@app/classes/sound-player/sound-player.class';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderGameComponent } from '@app/components/general-elements/header-game/header-game.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { AppRoute, GameStatus, QRLGrade } from '@app/constants/enum-class';
import { MOCK_QUESTIONS } from '@app/constants/mock-constants';
import { OrganizerService } from '@app/services/game-services/organizer/organizer.service';
import { PlayerListService } from '@app/services/game-services/player-list/player-list.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { of } from 'rxjs';
import { OrganizerPageComponent } from './organizer-page.component';

describe('OrganizerPageComponent', () => {
    let component: OrganizerPageComponent;
    let fixture: ComponentFixture<OrganizerPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let locationSpy: jasmine.SpyObj<Location>;
    let playerListServiceSpy: jasmine.SpyObj<PlayerListService>;
    const mockSocketHandler = {
        connect: jasmine.createSpy('connect'),
        send: jasmine.createSpy('send'),
        on: jasmine.createSpy('on'),
    } as unknown as SocketClientService;
    const mockMatDialog = {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of({}) }),
    };
    const mockOrganizerService = {
        initializeAttributes: jasmine.createSpy('initializeAttributes').and.stub(),
        handleSockets: jasmine.createSpy('handleSockets').and.stub(),
        signalUserConnect: jasmine.createSpy('signalUserConnect').and.stub(),
        signalUserDisconnect: jasmine.createSpy('signalUserDisconnect').and.stub(),
        nextQuestion: jasmine.createSpy('nextQuestion').and.stub(),
        showResults: jasmine.createSpy('showResults').and.stub(),
        gradeAnswer: jasmine.createSpy('gradeAnswer').and.stub(),
        pauseGame: jasmine.createSpy('pauseGame').and.stub(),
        startAlertMode: jasmine.createSpy('startAlertMode').and.stub(),
        stopAlertModeSound: jasmine.createSpy('stopAlertModeSound').and.stub(),
        sortById: jasmine.createSpy('sortById').and.stub(),
        handlePlayerList: jasmine.createSpy('handlePlayerList'),
        abandonGame: jasmine.createSpy('abandonGame'),
    } as unknown as OrganizerService;
    beforeEach(() => {
        playerListServiceSpy = jasmine.createSpyObj('PlayerListService', ['sortById']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        locationSpy = jasmine.createSpyObj('Location', ['path']);
        TestBed.configureTestingModule({
            declarations: [OrganizerPageComponent, HeaderGameComponent, ChatComponent, PlayerListComponent],
            imports: [RouterTestingModule, MatIconModule, FormsModule, RouterModule.forRoot([])],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: OrganizerService, useValue: mockOrganizerService },
                { provide: Location, useValue: locationSpy },
                { provide: PlayerListService, useValue: playerListServiceSpy },
                { provide: SocketClientService, useValue: mockSocketHandler },
            ],
        });

        fixture = TestBed.createComponent(OrganizerPageComponent);
        component = fixture.componentInstance;
        mockOrganizerService.peopleAnswering = { modifying: [], notModifying: [] };
        mockOrganizerService.gameInfo = { time: 0, currentQuestionIndex: 0, currentIndex: 0, playersInGame: 0 };
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('getters should return correct values', () => {
        mockOrganizerService.gameModifiers = { paused: true, alertMode: true };
        mockOrganizerService.currentQuestion = MOCK_QUESTIONS[0];
        mockOrganizerService.gameInfo.playersInGame = 1;
        expect(component.questionType).toBe(MOCK_QUESTIONS[0].type);
        expect(component.alertMode).toBeTrue();
        expect(component.gamePaused).toBeTrue();
        expect(component.playersInGame).toEqual(1);
    });

    it('startAlertMode should call pauseGame from startAlertMode', () => {
        component.startAlertMode();
        expect(mockOrganizerService.startAlertMode).toHaveBeenCalled();
    });
    it('pauseGame should call pauseGame from service', () => {
        component.pauseGame();
        expect(mockOrganizerService.pauseGame).toHaveBeenCalled();
    });
    it('should unload if "navigatedFromUnload" is in localStorage', () => {
        locationSpy.path.and.returnValue('/someOtherPath');
        spyOn(localStorage, 'getItem').and.returnValue('true');
        spyOn(localStorage, 'removeItem');
        mockOrganizerService.alertSoundPlayer = new SoundPlayer('adresse bidon');
        mockOrganizerService.alertSoundPlayer.stop = jasmine.createSpy('stop').and.stub();
        new OrganizerPageComponent(mockOrganizerService, routerSpy, locationSpy);

        expect(localStorage.removeItem).toHaveBeenCalledWith('navigatedFromUnload');
        expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoute.HOME]);
        expect(mockOrganizerService.alertSoundPlayer.stop).toHaveBeenCalled();
    });

    it('should return the correct question index', () => {
        mockOrganizerService.gameInfo.currentQuestionIndex = 1;
        expect(component.currentQuestionIndex).toBe(mockOrganizerService.gameInfo.currentQuestionIndex);
    });
    it('should return the correct noAnswersArray', () => {
        const mockNoAnswersArray = [0, 0, 0];
        mockOrganizerService.noAnswersArray = mockNoAnswersArray;
        expect(component.noAnswersArray).toBe(mockOrganizerService.noAnswersArray);
    });
    it('should return the correct gameStatus', () => {
        mockOrganizerService.gameStatus = GameStatus.WaitingForAnswers;
        expect(component.gameStatus).toBe(GameStatus.WaitingForAnswers);
    });
    it('abandonGame should call abandonGame of service', () => {
        component.abandonGame();
        expect(mockOrganizerService.abandonGame).toHaveBeenCalled();
    });

    it('should return the correct question', () => {
        const mockQuestion = MOCK_QUESTIONS[0];
        mockOrganizerService.currentQuestion = mockQuestion;
        expect(component.question).toBe(mockOrganizerService.currentQuestion);
    });

    it('should return the correct noPlayers', () => {
        expect(component.noPlayers).toBe(mockOrganizerService.noPlayers);
    });
    it('should return the correct number of people modifying the question', () => {
        mockOrganizerService.peopleAnswering.modifying = ['Bob', 'Mary'];
        expect(component.peopleModifyingQuestion).toBe(mockOrganizerService.peopleAnswering.modifying);
    });
    it('should return the correct number of people not modifying the question', () => {
        mockOrganizerService.peopleAnswering.notModifying = ['Bob', 'Mary'];
        expect(component.peopleNotModifyingQuestion).toBe(mockOrganizerService.peopleAnswering.notModifying);
    });
    it('should return the modified answer array', () => {
        mockOrganizerService.peopleAnswering.modifying = ['Bob'];
        mockOrganizerService.peopleAnswering.notModifying = [];
        expect(component.modifyAnswerArray).toEqual([1, 0]);
    });
    it('should return the answers array', () => {
        const answersQRL = [{ player: 'Bob', playerAnswer: 'Answer' }];
        mockOrganizerService.answersQRL = answersQRL;
        expect(component.answersArray).toEqual(answersQRL);
    });
    it('should return the current index', () => {
        mockOrganizerService.gameInfo.currentIndex = 0;
        expect(component.currentIndex).toEqual(mockOrganizerService.gameInfo.currentIndex);
    });

    it('should return the name and answer of the player being corrected if it exists', () => {
        mockOrganizerService.gameInfo.currentIndex = 0;
        mockOrganizerService.answersQRL = [{ player: 'Bob', playerAnswer: 'Answer' }];
        expect(component.playerBeingCorrected).toBe('Bob');
        expect(component.answerBeingCorrected).toBe('Answer');
    });
    it('should return the empty string of the player and answer if the given player does not exist', () => {
        mockOrganizerService.gameInfo.currentIndex = 0;
        mockOrganizerService.answersQRL = [];
        expect(component.playerBeingCorrected).toBe('');
        expect(component.answerBeingCorrected).toBe('');
    });

    it('should return the correct isCorrectAnswersArray', () => {
        const mockIsCorrectAnswersArray = [true, false, true];
        mockOrganizerService.isCorrectAnswersArray = mockIsCorrectAnswersArray;
        expect(component.isCorrectAnswersArray).toBe(mockOrganizerService.isCorrectAnswersArray);
    });
    it('should call the grade answer in the organizer service once answer is graded', () => {
        const gradeByOrganizer = QRLGrade.Correct;
        component.gradeAnswer(gradeByOrganizer);
        expect(mockOrganizerService.gradeAnswer).toHaveBeenCalledWith(gradeByOrganizer);
    });

    it('should return the correct timeLeft', () => {
        mockOrganizerService.gameInfo.time = 30; // Assuming time is in seconds
        expect(component.timeLeft).toBe(mockOrganizerService.gameInfo.time);
    });
    it('should set the item in the localStorage', () => {
        spyOn(localStorage, 'setItem').and.stub();
        component.handleBeforeUnload();
        expect(localStorage.setItem).toHaveBeenCalledWith('navigatedFromUnload', 'true');
    });
    it('should call signalUserDisconnect on ngOnDestroy if roomId is set and the path is not results', () => {
        locationSpy.path.and.returnValue('/someOtherPath');
        Object.defineProperty(mockOrganizerService, 'roomId', {
            get: () => '123',
            configurable: true,
        });
        component.ngOnDestroy();
        expect(mockOrganizerService.signalUserDisconnect).toHaveBeenCalled();
    });
    it('should call signalUserDisconnect on ngOnDestroy if roomId is set, shouldDisconnect is true and path is results', () => {
        mockOrganizerService.shouldDisconnect = true;
        locationSpy.path.and.returnValue(AppRoute.RESULTS);
        Object.defineProperty(mockOrganizerService, 'roomId', {
            get: () => '123',
            configurable: true,
        });
        component.ngOnDestroy();
        expect(mockOrganizerService.signalUserDisconnect).toHaveBeenCalled();
    });
    it('showResults should show the results', () => {
        component.showResults();
        expect(mockOrganizerService.showResults).toHaveBeenCalled();
    });
    it('showResults should go the next question', () => {
        component.nextQuestion();
        expect(mockOrganizerService.nextQuestion).toHaveBeenCalled();
    });
});
