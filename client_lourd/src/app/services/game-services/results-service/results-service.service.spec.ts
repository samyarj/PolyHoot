import { TestBed } from '@angular/core/testing';
import { DisconnectEvents, GameEvents } from '@app/constants/enum-class';
import { MOCK_QUESTIONS } from '@app/constants/mock-constants';
import { QuestionType } from '@app/interfaces/question-type';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { ResultsService } from './results-service.service';

describe('ResultsService', () => {
    let service: ResultsService;
    let socketHandlerServiceSpy: jasmine.SpyObj<SocketClientService>;
    beforeEach(() => {
        socketHandlerServiceSpy = jasmine.createSpyObj('SocketClientService', ['on', 'send']);
        TestBed.configureTestingModule({
            providers: [ResultsService, { provide: SocketClientService, useValue: socketHandlerServiceSpy }],
        });
        service = TestBed.inject(ResultsService);
        service.questions = MOCK_QUESTIONS;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('roomId should return the roomId from socketHandlerService', () => {
        socketHandlerServiceSpy.roomId = '123';
        expect(service.roomId).toEqual('123');
    });

    it('setAttributes should set attributes correctly', () => {
        const questions = service.questions;
        const players = [{ name: 'Player 1', points: 100, noBonusesObtained: 0, isInGame: true }];
        const choicesHistory = [
            [1, 0],
            [0, 1],
        ];
        service.resultsData = { questions, players, choicesHistory };

        service.setAttributes();

        expect(service.questions).toEqual(questions);
        expect(service.question).toEqual(questions[0]);
        expect(service.nbPlayers).toEqual(players.length);
    });

    it('sortPlayers should sort players correctly', () => {
        const players = [
            { name: 'Player A', points: 100, noBonusesObtained: 0, isInGame: true },
            { name: 'Player B', points: 80, noBonusesObtained: 0, isInGame: true },
            { name: 'Player C', points: 120, noBonusesObtained: 0, isInGame: false },
            { name: 'Player D', points: 80, noBonusesObtained: 0, isInGame: true },
        ];
        service.resultsData.players = players;

        service.sortPlayers();

        expect(service.sortedPlayersList).toEqual([
            { name: 'Player A', points: 100, noBonusesObtained: 0, isInGame: true },
            { name: 'Player B', points: 80, noBonusesObtained: 0, isInGame: true },
            { name: 'Player D', points: 80, noBonusesObtained: 0, isInGame: true },
            { name: 'Player C', points: 120, noBonusesObtained: 0, isInGame: false },
        ]);
    });

    it('setAnswersArray should set nbAnswersArray correctly', () => {
        service.question = {
            text: 'Question 1',
            type: QuestionType.QCM,
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        };
        const choicesHistory = [[1, 0]];
        service.resultsData.choicesHistory = choicesHistory;

        service.setAnswersArray();

        expect(service.nbAnswersArray).toEqual([1, 0]);
    });

    it('setCOrrectAnswers should set correctAnswersArray', () => {
        service.question = {
            text: 'Question 1',
            type: QuestionType.QCM,
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        };
        service.setCorrectAnswers();
        expect(service.correctAnswersArray).toEqual([true, false]);
    });

    it('handleResultsSockets should set resultsData and call setAttributes', () => {
        spyOn(service, 'setAttributes');
        const questions = service.questions;
        const players = [{ name: 'Player 1', points: 100, noBonusesObtained: 0, isInGame: true }];
        const choicesHistory = [
            [1, 0],
            [0, 1],
        ];
        const testData = { questions, players, choicesHistory };

        socketHandlerServiceSpy.on.and.callFake((event, callback) => {
            if (event === GameEvents.SendResults) {
                callback(testData as never);
            }
        });
        service.handleResultsSockets();
        expect(service.resultsData).toEqual(testData);
        expect(service.setAttributes).toHaveBeenCalled();
    });
    it('disconnectUser should emit DisconnectUserFromResultsPage and reset attributes', () => {
        spyOn(service, 'resetAttributes');
        service.disconnectUser();
        expect(socketHandlerServiceSpy.send).toHaveBeenCalledWith(DisconnectEvents.UserFromResults, socketHandlerServiceSpy.playerName);
        expect(service.resetAttributes).toHaveBeenCalled();
    });
});
