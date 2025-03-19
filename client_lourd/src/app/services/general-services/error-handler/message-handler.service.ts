import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/general-elements/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '@app/components/general-elements/error-dialog/error-dialog.component';
import { WIDTH_SIZE } from '@app/constants/constants';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessageHandlerService {
    constructor(private matdialog: MatDialog) {}

    popUpErrorDialog(messageToShow: string) {
        this.matdialog.open(ErrorDialogComponent, {
            width: WIDTH_SIZE,
            panelClass: 'custom-container',
            data: { message: messageToShow, reloadOnClose: false },
        });
    }

    handleHttpError(error: HttpErrorResponse) {
        if (error.status === 0) {
            return throwError(() => ({
                error: { message: 'Impossible de se connecter au serveur pour le moment. Veuillez réessayer ultérieurement.' },
            }));
        }
        return throwError(() => error);
    }

    confirmationDialog(messageToShow: string, callback: () => void) {
        const dialogRef = this.matdialog.open(ConfirmationDialogComponent, {
            width: WIDTH_SIZE,
            panelClass: 'custom-container',
            data: messageToShow,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                callback();
            }
        });
    }
}
