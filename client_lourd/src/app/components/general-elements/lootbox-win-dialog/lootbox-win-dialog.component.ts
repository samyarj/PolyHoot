import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Reward, RewardRarity, RewardType } from '@app/interfaces/lootbox-related';

@Component({
    selector: 'app-lootbox-win-dialog',
    templateUrl: './lootbox-win-dialog.component.html',
    styleUrls: ['./lootbox-win-dialog.component.scss'],
})
export class LootBoxWinDialogComponent implements OnInit {
    rewardType = RewardType;
    rewardRarity = RewardRarity;
    isOpened = false;
    removeBoxImage = false;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    explosionDelay: number = 500;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    removeDelay: number = 3000;
    constructor(
        public dialogRef: MatDialogRef<LootBoxWinDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Reward, // @Inject(WINDOW) private window: Window,
    ) {}

    onClose(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
        setTimeout(() => {
            this.isOpened = true;
            setTimeout(() => {
                this.removeBoxImage = true;
            }, this.removeDelay);
        }, this.explosionDelay); // You can adjust the delay
    }
}
