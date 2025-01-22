// https://stackoverflow.com/questions/68607971/how-to-unit-test-window-location-reload-in-angular-12-unit-testing

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorMessage } from '@app/interfaces/error-message';
import { WINDOW } from '@app/services/general-services/window.token';
import { of } from 'rxjs';
import { ErrorDialogComponent } from './error-dialog.component';

describe('ErrorDialogComponent', () => {
    let component: ErrorDialogComponent;
    let fixture: ComponentFixture<ErrorDialogComponent>;

    const mockWindow = {
        location: { reload: jasmine.createSpy('reload').and.stub() },
    };

    const mockMatDialog = {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of({}) }),
    };

    const mockMatDialogRef = {
        close: jasmine.createSpy('close'),
        afterClosed: () => of(true),
    };

    const mockDialogData: ErrorMessage = { message: '', reloadOnClose: true };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ErrorDialogComponent],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: MatDialogRef, useValue: mockMatDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
                { provide: WINDOW, useValue: mockWindow },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reload the page when pop-up is closed if reloadOnClose is true', () => {
        component.onClose();
        expect(mockWindow.location.reload).toHaveBeenCalled();
    });

    it('should close the pop-up when button is clicked', () => {
        spyOn(component, 'onClose').and.callThrough();
        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();
        expect(component.onClose).toHaveBeenCalled();
    });
});
