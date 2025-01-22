/* eslint-disable @typescript-eslint/no-explicit-any */
// utilise pour les spy des fonctions prives
import { TestBed, fakeAsync } from '@angular/core/testing';
import { DisconnectEvents, GameEvents, JoinEvents, TimerEvents } from '@app/constants/enum-class';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { WaitingPageService } from './waiting-page.service';

describe('WaitingPageService', () => {
    let service: WaitingPageService;
    let socketServiceMock: jasmine.SpyObj<SocketClientService>;

    beforeEach(async () => {
        socketServiceMock = jasmine.createSpyObj('SocketClientService', ['connect', 'send', 'on']);
        socketServiceMock.playerName = 'TestPlayerName';
        socketServiceMock.isOrganizer = true;
        socketServiceMock.roomId = 'TestRoomId';
        await TestBed.configureTestingModule({
            providers: [WaitingPageService, { provide: SocketClientService, useValue: socketServiceMock }],
        });

        service = TestBed.inject(WaitingPageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Getter functions', () => {
        it('should return the correct playerName from SocketClientService', () => {
            const playerName = service.playerName;
            expect(service.playerName).toEqual(playerName);
        });

        it('should return the correct isOrganizer from SocketClientService', () => {
            expect(service.isOrganizer).toBeTrue();
        });

        it('should return the correct isOrganizer from SocketClientService', () => {
            socketServiceMock.isRandomMode = true;
            expect(service.isRandomMode).toBeTrue();
        });

        it('should return the correct roomId from SocketClientService', () => {
            const roomId = 'TestRoomId';
            expect(service.roomId).toEqual(roomId);
        });
    });

    describe('Emitting events', () => {
        it('should emit toggleGameLock event', () => {
            service.toggleGameLock();
            expect(socketServiceMock.send).toHaveBeenCalledWith(GameEvents.ToggleLock);
        });

        it('should emit organizerDisconnected event when leaving as an organizer', () => {
            const resetAttributesSpy = spyOn<any>(service, 'resetAttributes');
            service.leaveWaitingPageAsOrganizor();

            expect(socketServiceMock.send).toHaveBeenCalledWith(DisconnectEvents.OrganizerDisconnected);
            expect(resetAttributesSpy).toHaveBeenCalled();
        });

        it('should emit playerDisconnected event when leaving as a player', () => {
            const resetAttributesSpy = spyOn<any>(service, 'resetAttributes');
            service.leaveWaitingPageAsPlayer();
            expect(socketServiceMock.send).toHaveBeenCalledWith(DisconnectEvents.Player);
            expect(resetAttributesSpy).toHaveBeenCalled();
        });

        it('should emit banPlayer event', () => {
            const playerName = 'testPlayer';
            service.banPlayer(playerName);
            expect(socketServiceMock.send).toHaveBeenCalledWith(GameEvents.PlayerBan, playerName);
        });

        it('should emit startGame event', () => {
            service.startGame();
            const eventName = 'startGame';

            expect(socketServiceMock.send).toHaveBeenCalledWith(eventName);
        });

        it('should emit startGameCountdown event with the specified time', () => {
            const testTime = 60;
            service.startGameCountdown(testTime);

            expect(socketServiceMock.send).toHaveBeenCalledWith(GameEvents.StartGameCountdown, testTime);
        });
    });

    describe('Receiving events', () => {
        beforeEach(() => {
            service['isInitialized'] = false;
        });

        it('should call handleUserSockets and handleGameSockets when handleSocketEvents() is called', () => {
            const handleUserSocketsSpy = spyOn<any>(service, 'handleUserSockets');
            const handleGameSocketsSpy = spyOn<any>(service, 'handleGameSockets');
            service.handleSocketEvents();

            expect(handleUserSocketsSpy).toHaveBeenCalled();
            expect(handleGameSocketsSpy).toHaveBeenCalled();
        });

        it('should call all individual socket handlers when handleUserSockets() is called', () => {
            const handlePlayerLeftSpy = spyOn<any>(service, 'handlePlayerLeft').and.callThrough();
            const handleJoinGameSuccessSpy = spyOn<any>(service, 'handleJoinGameSuccess').and.callThrough();
            const handleBanPlayerSpy = spyOn<any>(service, 'handleBanPlayer').and.callThrough();
            const handleOrganizerDisconnectSpy = spyOn<any>(service, 'handleOrganizerDisconnect').and.callThrough();
            service['handleUserSockets']();

            expect(handlePlayerLeftSpy).toHaveBeenCalled();
            expect(handleJoinGameSuccessSpy).toHaveBeenCalled();
            expect(handleBanPlayerSpy).toHaveBeenCalled();
            expect(handleOrganizerDisconnectSpy).toHaveBeenCalled();
        });

        it('should call all individual socket handlers when handleGameSockets() is called', () => {
            const handleToggleGameLockSpy = spyOn<any>(service, 'handleToggleGameLock').and.callThrough();
            const handleCountdownTimerValueSpy = spyOn<any>(service, 'handleCountdownTimerValue').and.callThrough();
            const handleCountdownEndSpy = spyOn<any>(service, 'handleCountdownEnd').and.callThrough();
            const handleGameTitleSpy = spyOn<any>(service, 'handleGameTitle').and.callThrough();
            service['handleGameSockets']();

            expect(handleToggleGameLockSpy).toHaveBeenCalled();
            expect(handleCountdownTimerValueSpy).toHaveBeenCalled();
            expect(handleCountdownEndSpy).toHaveBeenCalled();
            expect(handleGameTitleSpy).toHaveBeenCalled();
        });

        it('should update players on "onPlayerLeft" event', fakeAsync(() => {
            const testPlayers = ['Player1', 'Player3'];
            socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
                if (eventName === GameEvents.PlayerLeft) {
                    callback(testPlayers);
                }
            });
            service['handlePlayerLeft']();

            expect(service.players).toEqual(testPlayers);
            expect(socketServiceMock.on).toHaveBeenCalledWith(GameEvents.PlayerLeft, jasmine.any(Function));
        }));

        it('should update players on "onJoinGameSuccess" event', () => {
            const testPlayers = ['Player1', 'Player3'];
            socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
                if (eventName === JoinEvents.JoinSuccess) {
                    callback(testPlayers);
                }
            });

            service['handleJoinGameSuccess']();

            expect(service.players).toEqual(testPlayers);
            expect(socketServiceMock.on).toHaveBeenCalledWith(JoinEvents.JoinSuccess, jasmine.any(Function));
        });

        it('should emit true for bannedPlayer$ on "onBanPlayer" event', () => {
            service.bannedPlayer$.subscribe((isBanned) => {
                expect(isBanned).toBeTrue();
            });
            socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
                if (eventName === GameEvents.PlayerBanned) {
                    callback();
                }
            });

            service['handleBanPlayer']();
            expect(socketServiceMock.on).toHaveBeenCalledWith(GameEvents.PlayerBanned, jasmine.any(Function));
        });

        it('should emit true for organizorDisconnect$ on "OrganizerHasDisconnected" event', () => {
            service.organizorDisconnect$.subscribe((isDisconnected) => {
                expect(isDisconnected).toBeTrue();
            });
            socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
                if (eventName === DisconnectEvents.OrganizerHasLeft) {
                    callback();
                }
            });
            service['handleOrganizerDisconnect']();

            expect(socketServiceMock.on).toHaveBeenCalledWith(DisconnectEvents.OrganizerHasLeft, jasmine.any(Function));
        });

        it('should update gameLocked on "onToggleGameLock" event', () => {
            const testLocked = true;
            socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
                if (eventName === GameEvents.AlertLockToggled) {
                    callback(testLocked);
                }
            });
            service['handleToggleGameLock']();

            expect(service.gameLocked).toEqual(testLocked);
            expect(socketServiceMock.on).toHaveBeenCalledWith(GameEvents.AlertLockToggled, jasmine.any(Function));
        });

        it('should update time on "countdownTimerValue" event', () => {
            const testTime = 60;
            socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
                if (eventName === TimerEvents.GameCountdownValue) {
                    callback(testTime);
                }
            });
            service['handleCountdownTimerValue']();

            expect(service.time).toEqual(testTime);
            expect(socketServiceMock.on).toHaveBeenCalledWith(TimerEvents.GameCountdownValue, jasmine.any(Function));
        });

        it('should emit true for timerEnd$ and reset game lock and time on "countdownEnd" event', () => {
            service.timerEnd$.subscribe((isEnded) => {
                expect(isEnded).toBeTrue();
            });
            socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
                if (eventName === TimerEvents.GameCountdownEnd) {
                    callback();
                }
            });
            service['handleCountdownEnd']();

            expect(service.gameLocked).toBeFalse();
            expect(service.time).toBeNull();
            expect(socketServiceMock.on).toHaveBeenCalledWith(TimerEvents.GameCountdownEnd, jasmine.any(Function));
        });

        it('should update gameTitle on "gameTitle" event', () => {
            const testTitle = 'TestTitle';
            socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
                if (eventName === GameEvents.Title) {
                    callback(testTitle);
                }
            });
            service['handleGameTitle']();

            expect(service.gameTitle).toEqual(testTitle);
            expect(socketServiceMock.on).toHaveBeenCalledWith(GameEvents.Title, jasmine.any(Function));
            expect(socketServiceMock.isRandomMode).toBeFalse();
        });

        it("should set isRandomMode to true in socketService on 'gameTitle' event if game's title is 'Mode aléatoire'", () => {
            const randomTitle = 'Mode aléatoire';
            socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
                if (eventName === GameEvents.Title) {
                    callback(randomTitle);
                }
            });

            service['handleGameTitle']();
            expect(service.gameTitle).toEqual(randomTitle);
            expect(socketServiceMock.on).toHaveBeenCalledWith(GameEvents.Title, jasmine.any(Function));
            expect(socketServiceMock.isRandomMode).toBeTrue();
        });
    });

    it('handleCountdownEnd should start game if isOrganizer is true', () => {
        socketServiceMock.isOrganizer = true;
        socketServiceMock.isRandomMode = false;
        const startGameSpy = spyOn(service, 'startGame');
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.GameCountdownEnd) {
                callback();
            }
        });
        service['handleCountdownEnd']();
        expect(startGameSpy).toHaveBeenCalled();
    });
    it('handleCountdownEnd should start game if isRandomMode is true', () => {
        socketServiceMock.isOrganizer = false;
        socketServiceMock.isRandomMode = true;
        const startGameSpy = spyOn(service, 'startGame');
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === TimerEvents.GameCountdownEnd) {
                callback();
            }
        });
        service['handleCountdownEnd']();
        expect(startGameSpy).toHaveBeenCalled();
    });
});
