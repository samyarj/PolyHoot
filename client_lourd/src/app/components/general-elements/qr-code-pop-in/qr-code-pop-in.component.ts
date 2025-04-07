import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-qr-code-pop-in',
    templateUrl: './qr-code-pop-in.component.html',
    styleUrls: ['./qr-code-pop-in.component.scss'],
})
export class QrCodePopInComponent implements OnInit {
    qrData: string;
    colorDark: string = '#000000';
    constructor(
        public dialogRef: MatDialogRef<QrCodePopInComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            type: 'join-game';
            roomId: string;
            gameName: string;
        }, // @Inject(WINDOW) private window: Window,
    ) {
        this.qrData = JSON.stringify({
            type: 'join-game',
            roomId: this.data.roomId,
            gameName: this.data.gameName,
        });
    }

    ngOnInit(): void {
        this.updateQRColors();
    }

    updateQRColors() {
        const computedStyles = getComputedStyle(document.documentElement);
        this.colorDark = computedStyles.getPropertyValue('--text-color').trim() || '#000000';
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
