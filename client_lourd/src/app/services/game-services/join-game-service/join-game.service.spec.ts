// any est accepté dans ce contexte car on veut spy sur une méthode privée
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { Router } from '@angular/router';
import { JoinErrors, JoinEvents } from '@app/constants/enum-class';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { JoinGameService } from './join-game.service';

describe('JoinGameService', () => {
    let service: JoinGameService;
    let socketServiceMock: jasmine.SpyObj<SocketClientService>;
    let routerMock: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        socketServiceMock = jasmine.createSpyObj('SocketClientService', ['connect', 'send', 'on']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            providers: [JoinGameService, { provide: SocketClientService, useValue: socketServiceMock }, { provide: Router, useValue: routerMock }],
        });
        service = TestBed.inject(JoinGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit validGameId event when the method validGameId is called', () => {
        const gameId = '1234';
        const handleIdValidationSpy = spyOn<any>(service, 'handleIdValidation');

        service.validGameId(gameId);

        expect(socketServiceMock.send).toHaveBeenCalledWith(JoinEvents.ValidateGameId, gameId);
        expect(handleIdValidationSpy).toHaveBeenCalled();
    });

    it('should emit joinGame event when the method joinGame is called', () => {
        const gameId = '1234';
        const playerName = 'Nour';
        const handleJoinGameSpy = spyOn<any>(service, 'handleJoinGame');
        const data = { gameId, playerName };

        service.joinGame(gameId, playerName);

        expect(socketServiceMock.send).toHaveBeenCalledWith(JoinEvents.Join, data);
        expect(handleJoinGameSpy).toHaveBeenCalled();
    });

    it('should redirect to the specified page', () => {
        const page = '/page';
        service.redirectToPage(page);
        expect(routerMock.navigate).toHaveBeenCalledWith([page]);
    });

    it('should update gameIdValidated property', () => {
        const value = true;
        service.updateGameIdValidated(value);
        expect(service.gameIdValidated).toEqual(value);
    });

    it('should reset service properties (popUpMessage, gameIdValidated and wrongPin)', () => {
        service.popUpMessage = 'Test message';
        service.gameIdValidated = true;
        service.wrongPin = true;
        service.resetService();
        expect(service.popUpMessage).toEqual('');
        expect(service.gameIdValidated).toBeFalse();
        expect(service.wrongPin).toBeFalse();
    });

    describe('handleIdValidation', () => {
        it('should call handleValidId', () => {
            const handleValidIdSpy = spyOn<any>(service, 'handleValidId').and.callThrough();
            service['handleIdValidation']();
            expect(handleValidIdSpy).toHaveBeenCalled();
        });

        it('should call handleInvalidId', () => {
            const handleInvalidIdSpy = spyOn<any>(service, 'handleInvalidId').and.callThrough();
            service['handleIdValidation']();
            expect(handleInvalidIdSpy).toHaveBeenCalled();
        });

        it('should call handleRoomLocked', () => {
            const handleRoomLockedSpy = spyOn<any>(service, 'handleRoomLocked').and.callThrough();
            service['handleIdValidation']();
            expect(handleRoomLockedSpy).toHaveBeenCalled();
        });
    });

    describe('handleJoinGame', () => {
        it('should call handleCanJoinGame', () => {
            const gameId = '1234';
            const playerName = 'Nour';
            const handleCanJoinGameSpy = spyOn<any>(service, 'handleCanJoinGame').and.callThrough();
            service['handleJoinGame'](gameId, playerName);
            expect(handleCanJoinGameSpy).toHaveBeenCalledWith(gameId, playerName);
        });

        it('should call handleExistingName', () => {
            const handleExistingNameSpy = spyOn<any>(service, 'handleExistingName').and.callThrough();
            service['handleJoinGame']('1234', 'Nour');
            expect(handleExistingNameSpy).toHaveBeenCalled();
        });

        it('should call handleBannedName', () => {
            const handleBannedNameSpy = spyOn<any>(service, 'handleBannedName').and.callThrough();
            service['handleJoinGame']('1234', 'Nour');
            expect(handleBannedNameSpy).toHaveBeenCalled();
        });

        it('should call handleOrganizerName', () => {
            const handleOrganizerNameSpy = spyOn<any>(service, 'handleOrganizerName').and.callThrough();
            service['handleJoinGame']('1234', 'Nour');
            expect(handleOrganizerNameSpy).toHaveBeenCalled();
        });

        it('should call handleCantJoinGame', () => {
            const handleCantJoinGameSpy = spyOn<any>(service, 'handleCantJoinGame').and.callThrough();
            service['handleJoinGame']('1234', 'Nour');
            expect(handleCantJoinGameSpy).toHaveBeenCalled();
        });

        it('should call handleRoomLocked', () => {
            const handleRoomLockedSpy = spyOn<any>(service, 'handleRoomLocked').and.callThrough();
            service['handleJoinGame']('1234', 'Nour');
            expect(handleRoomLockedSpy).toHaveBeenCalled();
        });
    });

    it('should update gameIdValidated, wrongPin, and popUpMessage on "gameIdValid" event', () => {
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === JoinEvents.ValidId) {
                callback();
            }
        });
        service['handleValidId']();
        expect(service.gameIdValidated).toBeTrue();
        expect(service.wrongPin).toBeFalse();
        expect(service.popUpMessage).toEqual('');
    });

    it('should update gameIdValidated and popUpMessage on "invalidId" event', () => {
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === JoinErrors.InvalidId) {
                callback();
            }
        });
        service['handleInvalidId']();
        expect(service.gameIdValidated).toBeFalse();
        expect(service.popUpMessage).toEqual("Le code d'accès est invalide. Essayez à nouveau.");
    });

    it('should update gameIdValidated and popUpMessage on "roomLocked" event', () => {
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === JoinErrors.RoomLocked) {
                callback();
            }
        });
        service['handleRoomLocked']();
        expect(service.gameIdValidated).toBeFalse();
        expect(service.popUpMessage).toEqual("La partie est verrouillée. Veuillez demander l'accès à l'organisateur ou essayez un différent code.");
    });

    it('should update roomId, playerName, and isOrganizer properties and redirect to the waiting page on "canJoinGame" event', () => {
        const gameId = '1234';
        const playerName = 'Nour';
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === JoinEvents.CanJoin) {
                callback();
            }
        });
        service['handleCanJoinGame'](gameId, playerName);
        expect(socketServiceMock.roomId).toEqual(gameId);
        expect(socketServiceMock.playerName).toEqual(playerName);
        expect(socketServiceMock.isOrganizer).toBeFalse();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/waiting']);
    });

    it('should set popUpMessage to the appropriate message on "existingName" event', () => {
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === JoinErrors.ExistingName) {
                callback();
            }
        });
        service['handleExistingName']();
        expect(service.popUpMessage).toEqual('Ce nom est déjà utilisé. Veuillez choisir un autre nom.');
    });

    it('should set popUpMessage to the appropriate message on "bannedName" event', () => {
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === JoinErrors.BannedName) {
                callback();
            }
        });
        service['handleBannedName']();
        expect(service.popUpMessage).toEqual('Ce nom est banni. Veuillez choisir un autre nom.');
    });

    it('should set popUpMessage to the appropriate message on "organizerName" event', () => {
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === JoinErrors.OrganizerName) {
                callback();
            }
        });
        service['handleOrganizerName']();
        expect(service.popUpMessage).toEqual("Vous ne pouvez pas vous appeler 'organisateur'. Veuillez choisir un autre nom.");
    });

    it('should set popUpMessage to the appropriate message on "cantJoinGame" event', () => {
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === JoinErrors.Generic) {
                callback();
            }
        });
        service['handleCantJoinGame']();
        expect(service.popUpMessage).toEqual('Ce nom est invalide. Veuillez choisir un autre nom.');
    });

    it('should set wrongPin to true and then false after a delay', fakeAsync(() => {
        const TIMER_VALUE = 3000;
        service['showPopUp']();
        expect(service.wrongPin).toBeTrue();
        tick(TIMER_VALUE);
        flush();
        expect(service.wrongPin).toBeFalse();
    }));
});
