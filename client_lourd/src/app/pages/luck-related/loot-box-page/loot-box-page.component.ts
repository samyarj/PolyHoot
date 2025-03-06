import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LootBoxWinDialogComponent } from '@app/components/general-elements/lootbox-win-dialog/lootbox-win-dialog.component';
import { LootBoxContainer, Reward } from '@app/interfaces/lootbox-related';
import { LootBoxService } from '@app/services/luck-services/lootbox.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-loot-box-page',
    templateUrl: './loot-box-page.component.html',
    styleUrls: ['./loot-box-page.component.scss'],
})
export class LootBoxPageComponent {
    lootBoxes: LootBoxContainer[] = [];
    private lootBoxesObserver: Partial<Observer<LootBoxContainer[]>> = {
        next: (lootBoxes: LootBoxContainer[]) => {
            this.lootBoxes = lootBoxes;
        },
        error: () => {
            console.log('Could not fetch lootBoxes.');
        },
    };

    constructor(
        private lootBoxService: LootBoxService,
        private matdialog: MatDialog,
    ) {
        this.lootBoxService.getBoxes().subscribe(this.lootBoxesObserver);
    }

    get user() {
        return this.lootBoxService.user;
    }

    openBox(id: number) {
        this.lootBoxService.openBox(id).subscribe({
            next: (reward: Reward) => {
                this.matdialog.open(LootBoxWinDialogComponent, {
                    data: reward,
                    backdropClass: 'backdrop-dialog',
                    panelClass: 'custom-container',
                });
                this.lootBoxService.getBoxes().subscribe(this.lootBoxesObserver);
            },
        });
    }
}
