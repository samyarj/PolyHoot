import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HeaderGameComponent } from '@app/components/layout/filler/header-game/header-game.component';
import { ConfirmationMessage } from '@app/constants/enum-class';
import { MOCK_GAMES } from '@app/constants/mock-constants';
import { HistoryService } from '@app/services/back-end-communication-services/history-service/history.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { of, throwError } from 'rxjs';
import { HistoryPageComponent } from './history.component';
import SpyObj = jasmine.SpyObj;

describe('HistoryComponent', () => {
    let component: HistoryPageComponent;
    let fixture: ComponentFixture<HistoryPageComponent>;
    let sortingServiceSpy: SpyObj<SortingService>;
    let historyServiceSpy: SpyObj<HistoryService>;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;

    beforeEach(() => {
        sortingServiceSpy = jasmine.createSpyObj('SortingService', ['sortGamesByColumn']);
        historyServiceSpy = jasmine.createSpyObj('HistoryService', ['getAllGamesRecords', 'cleanHistory']);
        messageHandlerServiceSpy = jasmine.createSpyObj('MessageHandlerService', ['popUpErrorDialog', 'confirmationDialog']);
        messageHandlerServiceSpy.confirmationDialog.and.callFake((message: string, callback: () => void) => {
            callback();
        });
        historyServiceSpy.getAllGamesRecords.and.returnValue(of(MOCK_GAMES));
        historyServiceSpy.cleanHistory.and.returnValue(of([]));

        TestBed.configureTestingModule({
            declarations: [HistoryPageComponent, HeaderGameComponent],
            providers: [
                { provide: SortingService, useValue: sortingServiceSpy },
                { provide: HistoryService, useValue: historyServiceSpy },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
            imports: [BrowserAnimationsModule, MatPaginatorModule, RouterModule.forRoot([])],
        });
        fixture = TestBed.createComponent(HistoryPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch all games from the API', () => {
        expect(historyServiceSpy.getAllGamesRecords).toHaveBeenCalled();
    });

    it('should sort games by column', () => {
        component['sortedColumn'] = 'name';
        component['sortDirection'] = 'asc';
        component.dataSource.data = MOCK_GAMES;
        component.sortData('name', 'asc');
        expect(sortingServiceSpy.sortGamesByColumn).toHaveBeenCalledWith('name', 'asc', MOCK_GAMES);
    });

    it('should pop up an error message if there is a problem fetching games', () => {
        const errorMessage = 'Error fetching games';
        historyServiceSpy.getAllGamesRecords.and.returnValue(throwError(() => new HttpErrorResponse({ error: { message: errorMessage } })));
        fixture = TestBed.createComponent(HistoryPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith(errorMessage);
    });

    it('should report correct sort status for a column', () => {
        component['sortedColumn'] = 'name';
        component['sortDirection'] = 'asc';

        expect(component.isSorted('name', 'asc')).toBeTrue();
        expect(component.isSorted('date', 'asc')).toBeFalse();
        expect(component.isSorted('name', 'desc')).toBeFalse();
    });

    it('should open a confirmation dialog when cleanHistory is called', () => {
        // spy sur une méthode privée
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanHistoryCallbackSpy = spyOn<any>(component, 'cleanHistoryCallback');
        component.cleanHistory();
        expect(messageHandlerServiceSpy.confirmationDialog).toHaveBeenCalledWith(ConfirmationMessage.CleanHistory, jasmine.any(Function));
        expect(cleanHistoryCallbackSpy).toHaveBeenCalled();
    });

    it('should call cleanHistory on HistoryService if cleanHistoryCallback is called', () => {
        historyServiceSpy.cleanHistory.and.returnValue(of([]));
        component['cleanHistoryCallback']();
        expect(historyServiceSpy.cleanHistory).toHaveBeenCalledTimes(1);
    });

    it('should handle observer next function when cleanHistory is successful', () => {
        historyServiceSpy.cleanHistory.and.returnValue(of([]));
        component['cleanHistoryCallback']();
        expect(component.dataSource.data).toEqual([]);
    });

    it('should handle observer error function when cleanHistory fails', () => {
        const errorMessage = 'Error cleaning history';
        historyServiceSpy.cleanHistory.and.returnValue(throwError(() => new HttpErrorResponse({ error: { message: errorMessage } })));
        component['cleanHistoryCallback']();
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith(errorMessage);
    });
});
