/* eslint-disable max-lines */ // Nous nous permettons de depasser le nombre de
// lignes maximales, du a la grande quantite de handlers que l'on doit tester.
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SoundPlayer } from '@app/classes/sound-player/sound-player.class';
import { TIME_TO_NEXT_ANSWER } from '@app/constants/constants';
import { AppRoute, ConnectEvents, DisconnectEvents, GameEvents, GameStatus, QRLGrade, TimerEvents } from '@app/constants/enum-class';
import { MOCK_QUESTIONS } from '@app/constants/mock-constants';
import { PlayerListService } from '@app/services/game-services/player-list/player-list.service';
import { ResultsService } from '@app/services/game-services/results-service/results-service.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { OrganizerService } from './organizer.service';

describe('OrganizerService', () => {
    let service: OrganizerService;
    let messageHandlerServiceSpy: jasmine.SpyObj<MessageHandlerService>;
    let playerListServiceSpy: jasmine.SpyObj<PlayerListService>;
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    const mockSocketHandler = {
        connect: jasmine.createSpy('connect'),
        send: jasmine.createSpy('send'),
        on: jasmine.createSpy('on'),
        isRandomMode: false,
    } as unknown as SocketClientService;
    const mockResultService = {
        handleResultsSockets: jasmine.createSpy('handleResultSockets'),
    } as unknown as ResultsService;

    beforeEach(() => {
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['popUpErrorDialog', 'confirmationDialog']);
        messageHandlerServiceSpy.confirmationDialog.and.callFake((message: string, callback: () => void) => {
            callback();
        });
        playerListServiceSpy = jasmine.createSpyObj('PlayerListService', ['sortById']);
        playerListServiceSpy = jasmine.createSpyObj('PlayerListService', [
            'sortById',
            'resetPlayerList',
            'updatePlayerPresence',
            'updatePlayerPoints',
            'handlePlayerInteraction',
            'handlePlayerSubmission',
        ]);
        playerListServiceSpy.playerList = [];
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
                { provide: SocketClientService, useValue: mockSocketHandler },
                { provide: Router, useValue: mockRouter },
                { provide: ResultsService, useValue: mockResultService },
                { provide: PlayerListService, useValue: playerListServiceSpy },
            ],
        });

        service = TestBed.inject(OrganizerService);
        service.gameInfo = { time: 0, currentQuestionIndex: 0, currentIndex: 0, playersInGame: 0 };
    });
    afterEach(() => {
        service.peopleAnswering.modifying = [];
        service.peopleAnswering.notModifying = [];
    });
    it('should create the component', () => {
        expect(service).toBeTruthy();
    });
    it('pauseGame should send event', () => {
        service.pauseGame();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(TimerEvents.Pause);
    });
    it('startAlertMode should send event', () => {
        service.startAlertMode();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(TimerEvents.AlertGameMode);
    });
    it('handleTimerValue() should listen for gamePaused', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.Paused) {
                callback(true);
            }
        });
        service['handleTimerValue']();
        expect(service.gameModifiers.paused).toBe(true);
    });
    it('should return the socketHandler room ID', () => {
        mockSocketHandler.roomId = '123';
        expect(service.roomId).toBe('123');
    });
    it('should emit showResults', fakeAsync(() => {
        service.showResults();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(GameEvents.ShowResults);
    }));
    it('handleSockets should call the listener methods', () => {
        service['socketsInitialized'] = false;
        const methods = ['handleChoiceSockets', 'handlePlayerListSockets', 'handleTimeSockets', 'handleResultsSockets', 'handleGameEnded'];
        methods.forEach((method) => {
            spyOn(service, method as never).and.stub();
        });
        service.handleSockets();
        methods.forEach((method) => {
            expect(service[method as keyof typeof service]).toHaveBeenCalled();
        });
        expect(service['socketsInitialized']).toBe(true);
    });
    it('initializeAttributes should initialize the attributes correctly', () => {
        service['initializeNoAnswersArray'] = jasmine.createSpy('initializeNoAnswersArray').and.stub();
        service['initializeCorrectAnswers'] = jasmine.createSpy('initializeCorrectAnswers').and.stub();
        service.initializeAttributes();
        expect(service['initializeNoAnswersArray']).toHaveBeenCalled();
        expect(service['initializeCorrectAnswers']).toHaveBeenCalled();
        expect(service.gameInfo.time).toBe(0);
        expect(service.shouldDisconnect).toBe(true);
    });
    it('abandonGame should call good functions', () => {
        service.alertSoundPlayer = new SoundPlayer('123');
        service.alertSoundPlayer.stop = jasmine.createSpy('stop').and.stub();
        service.abandonGame();
        expect(mockRouter.navigate).toHaveBeenCalled();
        expect(service.alertSoundPlayer.stop).toHaveBeenCalled();
        expect(mockSocketHandler.isRandomMode).toBeFalse();
    });
    it('initializeCorrectAnswers should correctly initialize the answer array', () => {
        service.currentQuestion = MOCK_QUESTIONS[0];
        service['initializeCorrectAnswers']();
        expect(service.isCorrectAnswersArray).toEqual([true, false, false]);
    });
    it('should correctly initialize the no answers array', () => {
        service.currentQuestion = MOCK_QUESTIONS[0];
        service['initializeNoAnswersArray']();
        expect(service.noAnswersArray).toEqual([0, 0, 0]);
    });
    it('should increase the noAnswersArray if a player selects a choice', () => {
        service.noAnswersArray = [0, 0, 0];
        playerListServiceSpy.noPlayers = 10;
        service['selectChoice']({ selected: true, choice: 1 });
        expect(service.noAnswersArray).toEqual([0, 1, 0]);
    });
    it('should send the event once sendInfoToUsers() is called', () => {
        service['sendInfoToUsers']();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(GameEvents.CorrectionFinished, {
            pointsTotal: service['pointsAfterCorrection'],
            answers: service['totalNumberOfAnswers'],
        });
    });
    it('should set the game state to finished if sendInfoToUsers detects that question array would go out of bounds', () => {
        service.gameInfo.currentQuestionIndex = 10;
        service['questionsLength'] = 2;
        service['sendInfoToUsers']();
        expect(service.gameStatus).toBe('gameFinished');
    });
    it('updatePointsForPlayer should push the correct values', () => {
        const questionPoints = 20;
        service.gameInfo.currentIndex = 0;
        service.answersQRL = [{ player: 'Bob', playerAnswer: 'Answer' }];
        service.answersQRL[service.gameInfo.currentIndex].player = 'Bob';
        playerListServiceSpy.playerList = [
            { name: 'Bob', points: questionPoints, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        const gradeReceived = 100;
        service['updatePointsForPlayer'](gradeReceived);
        expect(service['pointsAfterCorrection']).toEqual([{ playerName: 'Bob', points: questionPoints + service.currentQuestion.points }]);
    });
    it('gradeAnswer should send info to users if it was the last question', () => {
        service.gameInfo.currentIndex = 1;
        service.answersQRL = [{ player: 'Bob', playerAnswer: 'Answer' }];
        service['sendInfoToUsers'] = jasmine.createSpy('sendInfoToUsers').and.stub();
        service.gradeAnswer(0);
        expect(service['sendInfoToUsers']).toHaveBeenCalled();
    });
    it('gradeAnswer should increment the current index if more answers remain to be graded', () => {
        service.gameInfo.currentIndex = 0;
        service.answersQRL = [
            { player: 'Bob', playerAnswer: 'Answer' },
            { player: 'my_crush', playerAnswer: 'Gab' },
        ];
        service.gradeAnswer(0);
        expect(service.gameInfo.currentIndex).toBe(1);
    });
    it('updateTotalAnswersArray should update the array', () => {
        service['totalNumberOfAnswers'] = [0, 0, 0];
        service['updateTotalAnswersArray'](QRLGrade.Wrong);
        service['updateTotalAnswersArray'](QRLGrade.Partial);
        service['updateTotalAnswersArray'](QRLGrade.Correct);
        expect(service['totalNumberOfAnswers']).toEqual([1, 1, 1]);
    });
    it('should decrease the noAnswersArray if a player unselects a choice', () => {
        service.noAnswersArray = [0, 1, 0];
        playerListServiceSpy.noPlayers = 10;
        service['selectChoice']({ selected: false, choice: 1 });
        expect(service.noAnswersArray).toEqual([0, 0, 0]);
    });
    it('should send a signal if the user disconnects', () => {
        service.signalUserDisconnect();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(DisconnectEvents.OrganizerDisconnected);
        expect(mockSocketHandler.isRandomMode).toBeFalse();
    });
    it('should send a signal if the user connects', () => {
        service.signalUserConnect();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(ConnectEvents.UserToGame);
    });
    it('should handle the selectChoice', () => {
        const mockData = { selected: true, choice: 1 };
        service['selectChoice'] = jasmine.createSpy('selectChoice').and.stub();
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.PlayerChoiceToOrganizer) {
                callback(mockData);
            }
        });
        service['handleChoiceSockets']();
        expect(service['selectChoice']).toHaveBeenCalledWith(mockData);
    });
    it('should handle updatePlayerStatus', () => {
        service.peopleAnswering.modifying = ['test'];
        service.peopleAnswering.notModifying = [];
        playerListServiceSpy.updatePlayerPresence = jasmine.createSpy('updatePlayerPresence').and.stub();
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.PlayerStatusUpdate) {
                callback({ name: 'test', isInGame: false });
            }
        });
        service['handlePlayerStatus']();
        expect(service.peopleAnswering.modifying).toEqual([]);
        expect(playerListServiceSpy.updatePlayerPresence).toHaveBeenCalledWith('test', false);
    });
    it('should handle updatePlayerPoints', () => {
        playerListServiceSpy.updatePlayerPoints = jasmine.createSpy('updatePlayerPoints').and.stub();
        service.gameInfo.currentQuestionIndex = Infinity;
        service['questionsLength'] = 1;
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.OrganizerPointsUpdate) {
                callback({ name: 'test', points: 1 });
            }
        });
        service['handlePlayerPoints']();
        expect(playerListServiceSpy.updatePlayerPoints).toHaveBeenCalledWith('test', 1);
    });
    it('should handle givePlayerList', () => {
        const mockData = [{ name: 'test', points: 3, isInGame: true, interacted: false, submitted: false, canChat: true }];
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.SendPlayerList) {
                callback(mockData);
            }
        });
        service['handlePlayerList']();
        expect(playerListServiceSpy.playerList).toEqual(mockData);
        expect(service.noPlayers).toBe(1);
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.SendPlayerList) {
                callback([]);
            }
        });
        service.signalUserDisconnect = jasmine.createSpy('signalUserDisconnect').and.stub();
        service['handlePlayerList']();
        expect(service.signalUserDisconnect).toHaveBeenCalled();
    });
    it('handlePlayerListSockets should listen for the correct events', () => {
        service['handlePlayerStatus'] = jasmine.createSpy('handlePlayerStatus').and.stub();
        service['handlePlayerPoints'] = jasmine.createSpy('handlePlayerPoints').and.stub();
        service['handlePlayerList'] = jasmine.createSpy('handlePlayerList').and.stub();
        service['handlePlayerListSockets']();
        expect(service['handlePlayerStatus']).toHaveBeenCalled();
        expect(service['handlePlayerPoints']).toHaveBeenCalled();
        expect(service['handlePlayerList']).toHaveBeenCalled();
    });
    it('should handle timerValue', () => {
        const mockTime = 10;
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.Value) {
                callback(mockTime);
            }
        });
        service['handleTimerValue']();
        expect(service.gameInfo.time).toBe(mockTime);
    });

    it('should handle questionCountdownValue', () => {
        const mockTime = 10;
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.QuestionCountdownValue) {
                callback(mockTime);
            }
        });
        service['handleTimerValue']();
        expect(service.gameInfo.time).toBe(mockTime);
    });

    it('should handle questionCountdownEnd', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.QuestionCountdownEnd) {
                callback();
            }
        });
        service.alertSoundPlayer.stop = jasmine.createSpy('stop').and.stub();
        service['handleTimerEnd']();
        expect(service.alertSoundPlayer.stop).toHaveBeenCalled();
    });

    it('should handle canProceedToNextQuestion', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.ProceedToNextQuestion) {
                callback();
            }
        });
        service.gameInfo.currentQuestionIndex = 10;
        service['questionsLength'] = 1;
        service['handleNextQuestion']();
        expect(service.gameStatus).toBe(GameStatus.GameFinished);
    });
    it('should handle timerEnd', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.End) {
                callback();
            }
        });
        service['handleTimerEnd']();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(GameEvents.QuestionEndByTimer);
    });
    it('should handle getQuestionsLength', () => {
        const mockLength = 10;
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.QuestionsLength) {
                callback(mockLength);
            }
        });
        service['handleQuestionsLength']();
        expect(service['questionsLength']).toBe(mockLength);
    });

    it('nextQuestion() should adjust variables and send startQuestionCountdown', fakeAsync(() => {
        service.nextQuestion();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(GameEvents.StartQuestionCountdown);
        tick(TIME_TO_NEXT_ANSWER);
        expect(service.gameStatus).toBe('waitingForAnswers');
    }));

    it('should handle goToNextQuestion', () => {
        service['initializeNoAnswersArray'] = jasmine.createSpy('initializeNoAnswersArray').and.stub();
        service['initializeCorrectAnswers'] = jasmine.createSpy('initializeCorrectAnswers').and.stub();
        const mockQuestion = { question: MOCK_QUESTIONS[0], index: 0 };
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.NextQuestion) {
                callback(mockQuestion);
            }
        });
        service['handleNextQuestion']();
        expect(service.gameInfo.currentQuestionIndex).toBe(mockQuestion.index);
        expect(service.currentQuestion).toBe(mockQuestion.question);
    });
    it('handleTimeSockets should listen to the correct events', () => {
        service['handleTimerValue'] = jasmine.createSpy('handleTimerValue').and.stub();
        service['handleTimerEnd'] = jasmine.createSpy('handleTimerEnd').and.stub();
        service['handleQuestionsLength'] = jasmine.createSpy('handleQuestionsLength').and.stub();
        service['handleNextQuestion'] = jasmine.createSpy('handleNextQuestion').and.stub();
        service['handleTimeSockets']();
        expect(service['handleTimerValue']).toHaveBeenCalled();
        expect(service['handleTimerEnd']).toHaveBeenCalled();
        expect(service['handleQuestionsLength']).toHaveBeenCalled();
        expect(service['handleNextQuestion']).toHaveBeenCalled();
    });
    it('should handle showEndResults', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.SendResults) {
                callback();
            }
        });
        service['handleResultsSockets']();
        expect(service.shouldDisconnect).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith([AppRoute.RESULTS]);
    });
    it('should handle gameEnded', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.End) {
                callback();
            }
        });
        service['handleGameEnded']();
        expect(mockRouter.navigate).toHaveBeenCalledWith([AppRoute.CREATE]);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('Les joueurs ont tous quitté la partie!');
    });
    it('should handle event if everyone submitted', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.EveryoneSubmitted) {
                callback();
            }
        });
        service['handleEveryoneSubmitted']();
        expect(service.gameStatus).toBe(GameStatus.OrganizerCorrecting);
    });
    it('should handle event if a QRL answer was submitted', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.QRLAnswerSubmitted) {
                callback({ player: 'Bob', playerAnswer: 'his_answer' });
            }
        });
        service['handleQRLAnswer']();
        expect(service.answersQRL).toContain({ player: 'Bob', playerAnswer: 'his_answer' });
    });
    it('should handle event if someone has just modified their answer', () => {
        service.peopleAnswering.modifying = [];
        service.peopleAnswering.notModifying = ['Bob'];
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.ModifyUpdate) {
                callback({ playerName: 'Bob', modified: true });
            }
        });
        service['handleAnswerUpdate']();
        expect(service.peopleAnswering.modifying).toEqual(['Bob']);
        expect(service.peopleAnswering.notModifying).toEqual([]);
    });
    it('should handle event if someone has not recently modified their answer', () => {
        service.peopleAnswering.modifying = ['Bob'];
        service.peopleAnswering.notModifying = [];
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.ModifyUpdate) {
                callback({ playerName: 'Bob', modified: false });
            }
        });
        service['handleAnswerUpdate']();
        expect(service.peopleAnswering.modifying).toEqual([]);
        expect(service.peopleAnswering.notModifying).toEqual(['Bob']);
    });
    it('handleTimerValue() should listen for alertModeStarted', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.AlertModeStarted) {
                callback();
            }
        });
        service.alertSoundPlayer.play = jasmine.createSpy('play').and.stub();
        service['handleTimerValue']();
        expect(service.alertSoundPlayer.play).toHaveBeenCalled();
    });
});
