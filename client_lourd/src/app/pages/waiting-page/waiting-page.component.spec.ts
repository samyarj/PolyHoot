/* eslint-disable @typescript-eslint/no-explicit-any */
// utilise pour les spy des fonctions prives
import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderGameComponent } from '@app/components/layout/filler/header-game/header-game.component';
import { START_GAME_COUNTDOWN } from '@app/constants/constants';
import { AppRoute, ConfirmationMessage } from '@app/constants/enum-class';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { WaitingPageService } from '@app/services/waiting-room-services/waiting-page.service';
import { Subject, Subscription, of } from 'rxjs';
import { WaitingPageComponent } from './waiting-page.component';

describe('WaitingPageComponent', () => {
    let component: WaitingPageComponent;
    let fixture: ComponentFixture<WaitingPageComponent>;
    let waitingPageServiceSpy: jasmine.SpyObj<WaitingPageService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let locationSpy: jasmine.SpyObj<Location>;
    let messageHandlerSpy: jasmine.SpyObj<MessageHandlerService>;

    beforeEach(async () => {
        waitingPageServiceSpy = jasmine.createSpyObj('WaitingPageService', [
            'handleSocketEvents',
            'toggleGameLock',
            'banPlayer',
            'startGameCountdown',
            'leaveWaitingPageAsPlayer',
            'leaveWaitingPageAsOrganizor',
        ]);

        messageHandlerSpy = jasmine.createSpyObj('MessageHandlerService', ['popUpErrorDialog', 'confirmationDialog']);
        messageHandlerSpy.confirmationDialog.and.callFake((message: string, callback: () => void) => {
            callback();
        });

        Object.assign(waitingPageServiceSpy, {
            roomId: 'testRoomId',
            players: ['Alice', 'Bob'],
            isOrganizer: true,
            gameLocked: false,
            gameTitle: 'Test Game Title',
            time: 42,
            bannedPlayer$: of(true),
            organizorDisconnect$: of(true),
            timerEnd$: of(true),
        });

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        locationSpy = jasmine.createSpyObj('Location', ['path']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule, FormsModule, BrowserAnimationsModule, MatIconModule],
            declarations: [WaitingPageComponent, HeaderGameComponent, ChatComponent],
            providers: [
                { provide: WaitingPageService, useValue: waitingPageServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: Location, useValue: locationSpy },
                { provide: MessageHandlerService, useValue: messageHandlerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('abandonAsOrganizer should call for confirmation popup and leave page after', () => {
        component.leaveWaitingPageAsOrganizor = jasmine.createSpy('leaveWaitingPageAsOrganizor').and.stub();
        component.abandonAsOrganizer();
        expect(component.leaveWaitingPageAsOrganizor).toHaveBeenCalled();
    });
    it('should call startGameCountdown with START_GAME_COUNTDOWN when startGame is called', () => {
        component.startGame();
        expect(waitingPageServiceSpy.startGameCountdown).toHaveBeenCalledWith(START_GAME_COUNTDOWN);
    });
    it('should set the item in the localStorage', () => {
        spyOn(localStorage, 'setItem').and.stub();
        component.handleBeforeUnload();
        expect(localStorage.setItem).toHaveBeenCalledWith('navigatedFromUnload', 'true');
    });

    it('should unload if "navigatedFromUnload" is in localStorage', () => {
        const getItemSpy = spyOn(localStorage, 'getItem').and.returnValue('true');
        const removeItemSpy = spyOn(localStorage, 'removeItem');
        fixture = TestBed.createComponent(WaitingPageComponent);

        expect(getItemSpy).toHaveBeenCalledWith('navigatedFromUnload');
        expect(removeItemSpy).toHaveBeenCalledWith('navigatedFromUnload');
    });

    it('should call toggleGameLock on the service when toggleGameLock is called', () => {
        component.toggleGameLock();
        expect(waitingPageServiceSpy.toggleGameLock).toHaveBeenCalled();
    });

    it('should call banPlayer on the service with the correct player name when banPlayerCallback is called', () => {
        const playerName = 'testPlayer';
        component['banPlayerCallback'](playerName);
        expect(waitingPageServiceSpy.banPlayer).toHaveBeenCalledWith(playerName);
    });

    it('should call confirmationDialog from messageHandler when banPlayer is called', () => {
        const callbackSpy = spyOn<any>(component, 'banPlayerCallback');
        component.banPlayer('Zemmour');
        expect(messageHandlerSpy.confirmationDialog).toHaveBeenCalledWith(ConfirmationMessage.BanPlayer, jasmine.any(Function));
        expect(callbackSpy).toHaveBeenCalled();
    });

    it('should call startGameCountdown on the service with START_GAME_COUNTDOWN when startGame is called', () => {
        component.startGame();
        expect(waitingPageServiceSpy.startGameCountdown).toHaveBeenCalledWith(START_GAME_COUNTDOWN);
    });

    it('should call leaveWaitingPageAsPlayer on the service and navigate to /home when leaveWaitingPageAsPlayer is called', () => {
        component.leaveWaitingPageAsPlayer();
        const routerPath = AppRoute.HOME;

        expect(waitingPageServiceSpy.leaveWaitingPageAsPlayer).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith([routerPath]);
    });

    it('should call leaveWaitingPageAsOrganizor on the service and navigate to /home when leaveWaitingPageAsOrganizor is called', () => {
        component.leaveWaitingPageAsOrganizor();
        const routerPath = AppRoute.HOME;

        expect(waitingPageServiceSpy.leaveWaitingPageAsOrganizor).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith([routerPath]);
    });

    describe('Getter functions', () => {
        it('should get the roomId from the waitingPageService', () => {
            expect(component.roomId).toBe(waitingPageServiceSpy.roomId);
        });

        it('should get the isOrganizer status from the waitingPageService', () => {
            expect(component.isOrganizer).toBe(waitingPageServiceSpy.isOrganizer);
        });

        it('should get the isRandomMode status from the waitingPageService', () => {
            expect(component.isRandomMode).toBe(waitingPageServiceSpy.isRandomMode);
        });

        it('should get the players list from the waitingPageService', () => {
            expect(component.players).toEqual(waitingPageServiceSpy.players);
        });

        it('should get the gameLocked status from the waitingPageService', () => {
            expect(component.gameLocked).toBe(waitingPageServiceSpy.gameLocked);
        });

        it('should get the gameTitle from the waitingPageService', () => {
            expect(component.gameTitle).toBe(waitingPageServiceSpy.gameTitle);
        });

        it('should get the time from the waitingPageService', () => {
            expect(component.time).toBe(waitingPageServiceSpy.time);
        });
        it('should get player name from the waitingPageService', () => {
            expect(component.name).toBe(waitingPageServiceSpy.playerName);
        });
    });

    describe('ngOnDestroy', () => {
        beforeEach(() => {
            component['organizorDisconnectedSub'] = new Subscription();
            component['bannedSubscription'] = new Subscription();
            component['timerEndSubscription'] = new Subscription();

            spyOn(component['organizorDisconnectedSub'], 'unsubscribe');
            spyOn(component['bannedSubscription'], 'unsubscribe');
            spyOn(component['timerEndSubscription'], 'unsubscribe');
            spyOn<any>(component, 'handleRouteNavigation');

            component.ngOnDestroy();
        });

        it('should call handleRouteNavigation', () => {
            expect(component['handleRouteNavigation']).toHaveBeenCalled();
        });

        it('should unsubscribe from organizorDisconnectedSub', () => {
            expect(component['organizorDisconnectedSub'].unsubscribe).toHaveBeenCalled();
        });

        it('should unsubscribe from bannedSubscription', () => {
            expect(component['bannedSubscription'].unsubscribe).toHaveBeenCalled();
        });

        it('should unsubscribe from timerEndSubscription', () => {
            expect(component['timerEndSubscription'].unsubscribe).toHaveBeenCalled();
        });
    });

    describe('handleRouteNavigation', () => {
        it('should not call leaveWaitingPageAsOrganizor or leaveWaitingPageAsPlayer on When this.roomId is null', () => {
            const leaveWaitingPageAsOrganizorSpy = spyOn<any>(component, 'leaveWaitingPageAsOrganizor');
            const leaveWaitingPageAsPlayerSpy = spyOn<any>(component, 'leaveWaitingPageAsPlayer');
            Object.assign(waitingPageServiceSpy, {
                roomId: null,
            });

            expect(leaveWaitingPageAsPlayerSpy).not.toHaveBeenCalled();
            expect(leaveWaitingPageAsOrganizorSpy).not.toHaveBeenCalled();
        });

        describe('handleOrganizerRouteNavigation', () => {
            it('should call leaveWaitingPageAsOrganizor and navigate to /home for organizer navigating away from /organizer', () => {
                locationSpy.path.and.returnValue('/someOtherPath');
                component['handleRouteNavigation']();

                expect(waitingPageServiceSpy.leaveWaitingPageAsOrganizor).toHaveBeenCalled();
                expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoute.HOME]);
            });
            it('should return true for organizer navigating away from Waiting Page before game start', () => {
                locationSpy.path.and.returnValue('/someOtherPath');
                component['hasTimerEnded'] = false;
                expect(component['handleOrganizerRouteNavigation']('/someOtherPath')).toBeTrue();
            });

            it('should return true when organizer navigate to /organizer path before game start', () => {
                locationSpy.path.and.returnValue(AppRoute.ORGANIZER);
                component['hasTimerEnded'] = false;
                expect(component['handleOrganizerRouteNavigation'](AppRoute.ORGANIZER)).toBeTrue();
            });

            it('should return false when organizer navigate to /organizer path before game start', () => {
                locationSpy.path.and.returnValue(AppRoute.ORGANIZER);
                component['hasTimerEnded'] = true;
                expect(component['handleOrganizerRouteNavigation'](AppRoute.ORGANIZER)).toBeFalse();
            });
        });

        describe('handlePlayerRouteNavigation', () => {
            beforeEach(() => {
                Object.assign(waitingPageServiceSpy, {
                    isOrganizer: false,
                });
                component['isorganizerDisconnected'] = false;
                component['isplayerBanned'] = false;
            });

            it('should call leaveWaitingPageAsPlayer and navigate to /home for player navigating away from waiting page', () => {
                locationSpy.path.and.returnValue('/someOtherPath');
                component['hasTimerEnded'] = false;
                component['handleRouteNavigation']();
                expect(waitingPageServiceSpy.leaveWaitingPageAsPlayer).toHaveBeenCalled();
                expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoute.HOME]);
            });

            it('should return false for player navigating away from Waiting Page and the organizer already disconnected', () => {
                locationSpy.path.and.returnValue('/someOtherPath');
                component['isorganizerDisconnected'] = true;

                expect(component['handlePlayerRouteNavigation']('/someOtherPath')).toBeFalse();
            });

            it('should return true for player navigating away from Waiting Page before game start', () => {
                locationSpy.path.and.returnValue('/someOtherPath');
                component['hasTimerEnded'] = false;

                expect(component['handlePlayerRouteNavigation']('/someOtherPath')).toBeTrue();
            });

            it('should return false for player on /game path before game start', () => {
                locationSpy.path.and.returnValue(AppRoute.GAME);
                component['hasTimerEnded'] = false;

                expect(component['handlePlayerRouteNavigation'](AppRoute.GAME)).toBeTrue();
            });
        });
    });

    describe('handleSocketSubscriptions', () => {
        let mockOrganizerDisconnectSubject: Subject<boolean>;
        let mockBannedPlayerSubject: Subject<boolean>;
        let mockTimerEndSubject: Subject<boolean>;
        beforeEach(() => {
            Object.assign(waitingPageServiceSpy, {
                isOrganizer: false,
            });
            fixture = TestBed.createComponent(WaitingPageComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            component['isorganizerDisconnected'] = false;
            mockOrganizerDisconnectSubject = new Subject<boolean>();
            mockBannedPlayerSubject = new Subject<boolean>();
            mockTimerEndSubject = new Subject<boolean>();

            waitingPageServiceSpy.organizorDisconnect$ = mockOrganizerDisconnectSubject.asObservable();
            waitingPageServiceSpy.bannedPlayer$ = mockBannedPlayerSubject.asObservable();
            waitingPageServiceSpy.timerEnd$ = mockTimerEndSubject.asObservable();

            spyOn<any>(component, 'organizorHasDisconnected');
            spyOn<any>(component, 'popUpErrorDialog');
            spyOn<any>(component, 'navigateToGame');
            component['handleSocketSubscriptions']();
        });

        it('should set isorganizerDisconnected to true and call organizorHasDisconnected when organizer disconnects', () => {
            mockOrganizerDisconnectSubject.next(true);
            expect(component['isorganizerDisconnected']).toBeTrue();
            expect(component['organizorHasDisconnected']).toHaveBeenCalled();
        });
        it('should open an error dialog when the player is banned', () => {
            mockBannedPlayerSubject.next(true);
            expect(component['isplayerBanned']).toBeTrue();
            expect(component['popUpErrorDialog']).toHaveBeenCalledWith("Vous avez été banni de la salle d'attente", AppRoute.HOME);
        });
        it('should navigate to the correct route when the game starts', () => {
            mockTimerEndSubject.next(true);

            expect(component['hasTimerEnded']).toBeTrue();
            expect(component['navigateToGame']).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith([AppRoute.GAME]);
        });
    });
});
