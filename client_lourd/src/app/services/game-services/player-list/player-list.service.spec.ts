import { TestBed } from '@angular/core/testing';
import { GameEvents } from '@app/constants/enum-class';
import { ChatEvents } from '@app/services/chat-services/chat-events';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { PlayerListService } from './player-list.service';

describe('PlayerListService', () => {
    let service: PlayerListService;
    const mockSocketHandler = {
        send: jasmine.createSpy('send'),
    } as unknown as SocketClientService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: mockSocketHandler }],
        });
        service = TestBed.inject(PlayerListService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('changeChatStatus should change the canChat status of the player and send the new status to the socketHandlerService', () => {
        const mockPlayer = { name: 'Zekaria', points: 15, isInGame: false, interacted: false, submitted: false, canChat: true };
        const playerData = { playerName: mockPlayer.name, canChat: !mockPlayer.canChat };
        spyOn(service.playerList, 'find').and.returnValue(mockPlayer);
        service.changeChatStatus('Zekaria');
        expect(mockSocketHandler.send).toHaveBeenCalledWith(ChatEvents.ChatStatusChange, playerData);
    });
    it('should reset player list attributes', () => {
        service.playerList = [
            { name: 'Alice', points: 10, isInGame: true, interacted: true, submitted: true, canChat: true },
            { name: 'Bob', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];

        service['resetPlayerList']();

        expect(service.playerList[0].submitted).toBeFalse();
        expect(service.playerList[0].interacted).toBeFalse();
        expect(service.playerList[1].submitted).toBeFalse();
        expect(service.playerList[1].interacted).toBeFalse();
    });
    it('should update the player presence', () => {
        service.playerList = [{ name: 'test', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true }];
        service['updatePlayerPresence']('test', true);
        expect(service.playerList[0].isInGame).toBe(true);
    });
    it('should update the player points', () => {
        const NUMBER_OF_POINTS = 10;
        service.playerList = [{ name: 'test', points: NUMBER_OF_POINTS, isInGame: true, interacted: false, submitted: false, canChat: true }];
        service.updatePlayerPoints('test', NUMBER_OF_POINTS);
        expect(service.playerList[0].points).toBe(NUMBER_OF_POINTS);
    });
    it('handlePlayerInteraction should update player attributes', () => {
        const playerData = { name: 'Frank' };
        const playerIndex = 1;
        // sinon mock et playerlist = mock
        service.playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        spyOn(service.playerList, 'findIndex').and.returnValue(playerIndex);
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.PlayerInteraction) {
                callback(playerData);
            }
        });

        service['handlePlayerInteraction']();

        expect(service.playerList[playerIndex].interacted).toBeTrue();
    });
    it('handlePlayerSubmission should update player submission', () => {
        const playerData = { name: 'Frank' };
        const playerIndex = 1;
        // sinon mock et playerlist = mock
        service.playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        spyOn(service.playerList, 'findIndex').and.returnValue(playerIndex);
        mockSocketHandler.on = jasmine.createSpy('on').and.callFake((event, callback) => {
            if (event === GameEvents.PlayerSubmitted) {
                callback(playerData);
            }
        });
        service['handlePlayerSubmission']();

        expect(service.playerList[playerIndex].submitted).toEqual(true);
    });
});
