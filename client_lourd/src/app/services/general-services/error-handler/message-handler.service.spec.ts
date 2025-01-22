import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/general-elements/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '@app/components/general-elements/error-dialog/error-dialog.component';
import { WIDTH_SIZE } from '@app/constants/constants';
import { of } from 'rxjs';
import { MessageHandlerService } from './message-handler.service';

describe('MessageHandlerService', () => {
    let service: MessageHandlerService;
    const mockMatDialog = {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of({}) }),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatDialog, useValue: mockMatDialog }],
        });
        service = TestBed.inject(MessageHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('popUpErrorDialog should call matdialog with proper message to show', () => {
        service.popUpErrorDialog('The message the user sees');
        expect(mockMatDialog.open).toHaveBeenCalledWith(ErrorDialogComponent, {
            width: '400px',
            data: { message: 'The message the user sees', reloadOnClose: false },
        });
    });

    it('should return a specific error message when the server is down', () => {
        const result$ = service.handleHttpError({ status: 0 } as HttpErrorResponse);
        result$.subscribe({
            error: (error) => {
                expect(error.error.message).toBe('Impossible de se connecter au serveur pour le moment. Veuillez réessayer ultérieurement.');
            },
        });
    });

    it('should return the error as is for other status codes', () => {
        const error = { status: 404, statusText: 'Not Found' } as HttpErrorResponse;
        const result$ = service.handleHttpError(error);
        result$.subscribe({
            error: (err) => {
                expect(err).toEqual(error);
            },
        });
    });

    it('should open a confirmation dialog when confirmationDialog is called and should call callback if afterClosed returns true', () => {
        const messageToShow = 'Are you sure?';
        const callback = jasmine.createSpy('callback');
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(true) });
        service.confirmationDialog(messageToShow, callback);

        expect(mockMatDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            width: WIDTH_SIZE,
            data: messageToShow,
        });

        expect(callback).toHaveBeenCalled();
    });

    it('should open a confirmation dialog when confirmationDialog is called and should NOT call callback if afterClosed returns false', () => {
        const messageToShow = 'Are you sure?';
        const callback = jasmine.createSpy('callback');
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(false) });
        service.confirmationDialog(messageToShow, callback);

        expect(mockMatDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            width: WIDTH_SIZE,
            data: messageToShow,
        });

        expect(callback).not.toHaveBeenCalled();
    });
});
