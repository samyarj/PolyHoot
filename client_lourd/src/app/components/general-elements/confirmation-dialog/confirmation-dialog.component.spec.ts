import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;

    const dialogRefMock = {
        close: (dialogResult?: boolean) => {
            return dialogResult;
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConfirmationDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: 'Are you sure?' },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the passed message', () => {
        expect(component.data).toBe('Are you sure?');
    });

    it('should close dialog with true on confirm', () => {
        spyOn(dialogRefMock, 'close');
        component.onConfirm();
        expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });

    it('should close dialog with false on dismiss', () => {
        spyOn(dialogRefMock, 'close');
        component.onDismiss();
        expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });
});
