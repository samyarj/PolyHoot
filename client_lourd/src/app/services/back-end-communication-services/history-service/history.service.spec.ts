import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { EMPTY } from 'rxjs';
import { HistoryService } from './history.service';
import SpyObj = jasmine.SpyObj;

describe('HistoryService', () => {
    let service: HistoryService;
    let httpTestingController: HttpTestingController;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;

    beforeEach(() => {
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleHttpError']);
        messageHandlerServiceSpy.handleHttpError.and.returnValue(EMPTY);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HistoryService, { provide: MessageHandlerService, useValue: messageHandlerServiceSpy }],
        });

        service = TestBed.inject(HistoryService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all game records from the API via GET', () => {
        const testGames: Game[] = []; // Replace with your mock games data
        service.getAllGamesRecords().subscribe((games) => {
            expect(games.length).toBe(testGames.length);
            expect(games).toEqual(testGames);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/games`);
        expect(req.request.method).toEqual('GET');
        req.flush(testGames);
    });

    it('should clean history via DELETE', () => {
        service.cleanHistory().subscribe((result) => {
            expect(result).toEqual([]);
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/clean`);
        expect(req.request.method).toEqual('DELETE');
        req.flush([]);
    });

    it('should call handleError when an error occurs in getAllGamesRecords', () => {
        service.getAllGamesRecords().subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/games`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('error'), { status: 404 });
    });

    it('should call handleError when an error occurs in cleanHistory', () => {
        service.cleanHistory().subscribe({
            error: () => {
                expect(messageHandlerServiceSpy.handleHttpError).toHaveBeenCalled();
            },
        });

        const req = httpTestingController.expectOne(`${service.baseUrl}/clean`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ProgressEvent('error'), { status: 404 });
    });
});
