import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-qr-code-friend-pop-in',
    templateUrl: './qr-code-friend-pop-in.component.html',
    styleUrls: ['./qr-code-friend-pop-in.component.scss'],
})
export class QrCodeFriendPopInComponent implements OnInit {
    qrData: string;
    colorDark: string = '#000000';
    constructor(
        public dialogRef: MatDialogRef<QrCodeFriendPopInComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            type: 'friend-request';
            username: string;
            uid: string;
        }, // @Inject(WINDOW) private window: Window,
    ) {
        this.qrData = JSON.stringify({
            type: 'friend-request',
            username: this.data.username,
            uid: this.data.uid,
        });
        console.log(this.qrData);
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
