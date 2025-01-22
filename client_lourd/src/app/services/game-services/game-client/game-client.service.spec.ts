import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SoundPlayer } from '@app/classes/sound-player/sound-player.class';
import { AppRoute, ChoiceFeedback, ConnectEvents, DisconnectEvents, GameEvents, JoinEvents, TimerEvents } from '@app/constants/enum-class';
import { MOCK_QUESTIONS } from '@app/constants/mock-constants';
import { GameClientService } from '@app/services/game-services/game-client/game-client.service';
import { ResultsService } from '@app/services/game-services/results-service/results-service.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';

describe('GameClientService', () => {
    let service: GameClientService;
    let messageHandlerServiceSpy: jasmine.SpyObj<MessageHandlerService>;
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    const mockRemoveListener = jasmine.createSpy('removeListener');
    const mockSocketHandler = {
        connect: jasmine.createSpy('connect'),
        send: jasmine.createSpy('send'),
        on: jasmine.createSpy('on'),
        socket: { removeListener: mockRemoveListener },
    } as unknown as SocketClientService;
    const mockResultService = {
        handleResultsSockets: jasmine.createSpy('handleResultSockets'),
    } as unknown as ResultsService;
    beforeEach(() => {
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['popUpErrorDialog', 'confirmationDialog']);
        messageHandlerServiceSpy.confirmationDialog.and.callFake((message: string, callback: () => void) => {
            callback();
        });
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
                { provide: SocketClientService, useValue: mockSocketHandler },
                { provide: Router, useValue: mockRouter },
                { provide: ResultsService, useValue: mockResultService },
            ],
        });

        service = TestBed.inject(GameClientService);
    });
    it('should create the component', () => {
        expect(service).toBeTruthy();
    });
    it('should return the socketHandler room ID', () => {
        mockSocketHandler.roomId = '123';
        expect(service.roomId).toBe('123');
    });
    it('selectChoice() should return false if finalAnswer is already true', () => {
        service['finalAnswer'] = true;
        expect(service.selectChoice(0)).toBe(false);
    });
    it('selectChoice() should return true and emit an event', () => {
        service.currentQuestion = MOCK_QUESTIONS[0];
        service['finalAnswer'] = false;
        service.time = Infinity;
        expect(service.selectChoice(0)).toBe(true);
        expect(mockSocketHandler.send).toHaveBeenCalledWith(GameEvents.SelectFromPlayer, { choice: 0 });
    });
    it('finalizeAnswer() should emit an event', () => {
        service['finalAnswer'] = false;
        service.time = Infinity;
        service.finalizeAnswer();
        expect(service['finalAnswer']).toBe(true);
        expect(mockSocketHandler.send).toHaveBeenCalledWith(GameEvents.FinalizePlayerAnswer);
    });
    it('resetInformationFields() should reset the fields', () => {
        service.resetInformationFields();
        expect(service.currentQuestion.type).toBe('');
        expect(service.currentQuestion.text).toBe('');
        expect(service.currentQuestion.points).toBe(0);
    });
    it('signalUserDisconnect() should send an event', () => {
        service.signalUserDisconnect();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(DisconnectEvents.Player);
    });
    it('signalUserConnect() should send an event', () => {
        service.signalUserConnect();
        expect(mockSocketHandler.send).toHaveBeenCalledWith(ConnectEvents.UserToGame);
    });
    it('sendModifyUpdate() should emit the correct event', () => {
        mockSocketHandler.playerName = 'Bob';
        service.sendModifyUpdate(true);
        expect(mockSocketHandler.send).toHaveBeenCalledWith(GameEvents.ModifyUpdate, { playerName: 'Bob', modified: true });
    });
    it('handleWaitingForCorrection() should set choice feedback to awaiting for correction', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.WaitingForCorrection) {
                callback();
            }
        });
        service['handleWaitingForCorrection']();
        expect(service.choiceFeedback).toBe(ChoiceFeedback.AwaitingCorrection);
    });
    it('sendAnswerForCorrection should emit the correct event', () => {
        service.sendAnswerForCorrection('Answer');
        expect(mockSocketHandler.send).toHaveBeenCalledWith(GameEvents.QRLAnswerSubmitted, {
            player: mockSocketHandler.playerName,
            playerAnswer: 'Answer',
        });
    });
    it('resetAttributes() should reset the attributes', () => {
        service.currentQuestion = MOCK_QUESTIONS[0];
        service.resetAttributes();
        expect(service['finalAnswer']).toBe(false);
        expect(service.showAnswers).toBe(false);
        expect(service.playerInfo.userFirst).toBe(false);
        expect(service.playerInfo.choiceSelected).toEqual([false, false, false, false]);
        expect(service.shouldDisconnect).toBe(true);
        // On sait que la question proviendra de MOCK_QUESTIONS, qui a toujours des choices
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const choice of service.currentQuestion.choices!) {
            expect(choice.isSelected).toBe(false);
        }
    });
    it('handleTimerValue() should listen for timerValue', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.Value) {
                callback(1);
            }
        });
        service['handleTimerValue']();
        expect(service.time).toBe(1);
    });
    it('abandonGame should call good functions', () => {
        service.alertSoundPlayer = new SoundPlayer('123');
        service.alertSoundPlayer.stop = jasmine.createSpy('stop').and.stub();
        service.abandonGame();
        expect(mockRouter.navigate).toHaveBeenCalled();
        expect(service.alertSoundPlayer.stop).toHaveBeenCalled();
    });

    it('handleTimerValue() should listen for gamePaused', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.Paused) {
                callback(true);
            }
        });
        service['handleTimerValue']();
        expect(service.gamePaused).toBe(true);
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
    it('handleTimerValue() should listen for timerEnd', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.End) {
                callback(1);
            }
        });
        service['handleTimerValue']();
        expect(service.time).toBe(1);
    });
    it('handleTimerValue() should listen for questionCountdownValue', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.QuestionCountdownValue) {
                callback(1);
            }
        });
        service['handleTimerValue']();
        expect(service.time).toBe(1);
        expect(service.playerInfo.waitingForQuestion).toBeTrue();
    });
    it('handleTimerValue() should listen for questionCountdownEnd', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.QuestionCountdownEnd) {
                callback();
            }
        });
        service.alertSoundPlayer.stop = jasmine.createSpy('stop').and.stub();
        service['handleTimerValue']();
        expect(service.playerInfo.waitingForQuestion).toBeFalse();
        expect(service.alertSoundPlayer.stop).toHaveBeenCalled();
    });
    it('goToNextQuestion() should listen for goToNextQuestion', () => {
        const nextQuestionPayload = {
            question: MOCK_QUESTIONS[0],
            index: 1,
        };
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.NextQuestion) {
                callback(nextQuestionPayload as never);
            }
        });
        service['goToNextQuestion']();
        expect(service.currentQuestionIndex).toBe(nextQuestionPayload.index);
        expect(service.currentQuestion).toEqual(nextQuestionPayload.question);
    });
    it('goToNextQuestion() should send GameEvents.ShowResults if in random mode', () => {
        mockSocketHandler.isRandomMode = true;
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.NextQuestion) {
                callback(null);
            }
        });
        service['goToNextQuestion']();
        expect(mockSocketHandler.send).toHaveBeenCalled();
    });
    it('playerPointsUpdate() should listen for playerPointsUpdate', () => {
        service.playerPoints = 10;
        service.currentQuestion = MOCK_QUESTIONS[0];
        const playerQuestion = {
            points: 10,
            isFirst: false,
        };
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.PlayerPointsUpdate) {
                callback(playerQuestion);
            }
        });
        service['playerPointsUpdate']();
        expect(service.playerPoints).toBe(playerQuestion.points);
        expect(service.playerInfo.userFirst).toEqual(playerQuestion.isFirst);
    });
    it('playerPointsUpdate() should listen for playerPointsUpdate, on right answer', () => {
        service.playerPoints = 50;
        service.currentQuestion = MOCK_QUESTIONS[0];
        const playerQuestion2 = {
            points: 100,
            isFirst: true,
        };
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.PlayerPointsUpdate) {
                callback(playerQuestion2);
            }
        });
        service['playerPointsUpdate']();
        expect(service.playerPoints).toBe(playerQuestion2.points);
        expect(service.choiceFeedback).toBe(ChoiceFeedback.First);
    });
    it('playerPointsUpdate() should listen for playerPointsUpdate, on right answer', () => {
        service.playerPoints = 50;
        service.currentQuestion = MOCK_QUESTIONS[0];
        const playerQuestion2 = {
            points: 55,
            isFirst: false,
        };
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.PlayerPointsUpdate) {
                callback(playerQuestion2);
            }
        });
        service['playerPointsUpdate']();
        expect(service.playerPoints).toBe(playerQuestion2.points);
        expect(service.choiceFeedback).toBe(ChoiceFeedback.Correct);
    });
    it('getTitle() should emit the correct event', () => {
        const mockTitle = 'Test Quiz Title';

        mockSocketHandler.send = jasmine.createSpy('send').and.callFake((eventName: string, callback: (title: string) => void) => {
            if (eventName === JoinEvents.TitleRequest) {
                callback(mockTitle);
            }
        });
        service.getTitle();
        expect(service.quizTitle).toEqual(mockTitle);
    });
    it('showEndResults() should listen to showEndResults', () => {
        service.shouldDisconnect = true;
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.SendResults) {
                callback();
            }
        });
        service['showEndResults']();
        expect(service.shouldDisconnect).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith([AppRoute.RESULTS]);
    });
    it('organizerHasDisconnected() should listen to OrganizerHasDisconnected', () => {
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === DisconnectEvents.OrganizerHasLeft) {
                callback();
            }
        });

        service['organizerHasDisconnected']();
        expect(mockRouter.navigate).toHaveBeenCalledWith([AppRoute.HOME]);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith("L'organisateur a mis fin brusquement à la partie");
    });
    it('handleSockets should call the listener methods', () => {
        service['socketsInitialized'] = false;

        const methods = ['handleTimerValue', 'goToNextQuestion', 'getTitle', 'playerPointsUpdate', 'organizerHasDisconnected', 'showEndResults'];
        methods.forEach((method) => {
            spyOn(service, method as never).and.stub();
        });
        service.handleSockets();

        methods.forEach((method) => {
            expect(service[method as keyof typeof service]).toHaveBeenCalled();
        });

        expect(service['socketsInitialized']).toBe(true);
    });
    it('handleSockets should call the listener methods', () => {
        service['socketsInitialized'] = false;
        mockSocketHandler.isRandomMode = true;
        const methods = ['handleTimerValue', 'goToNextQuestion', 'getTitle', 'playerPointsUpdate', 'organizerHasDisconnected', 'showEndResults'];
        methods.forEach((method) => {
            spyOn(service, method as never).and.stub();
        });
        service.handleSockets();
        methods.forEach((method) => {
            expect(service[method as keyof typeof service]).toHaveBeenCalled();
        });
        expect(service['socketsInitialized']).toBe(true);
    });
});
