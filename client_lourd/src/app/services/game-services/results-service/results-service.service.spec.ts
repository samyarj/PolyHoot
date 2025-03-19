import { TestBed } from '@angular/core/testing';
import { DisconnectEvents } from '@app/constants/enum-class';
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
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('roomId should return the roomId from socketHandlerService', () => {
        socketHandlerServiceSpy.roomId = '123';
        expect(service.roomId).toEqual('123');
    });

    it('disconnectUser should emit DisconnectUserFromResultsPage and reset attributes', () => {
        spyOn(service, 'resetAttributes');
        service.disconnectUser();
        expect(socketHandlerServiceSpy.send).toHaveBeenCalledWith(DisconnectEvents.UserFromResults, socketHandlerServiceSpy.playerName);
        expect(service.resetAttributes).toHaveBeenCalled();
    });
});
