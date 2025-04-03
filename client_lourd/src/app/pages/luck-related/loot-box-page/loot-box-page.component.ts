import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '@app/components/general-elements/error-dialog/error-dialog.component';
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
    isClaimingBox: boolean = false;
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
        if (!this.isClaimingBox) {
            this.isClaimingBox = true;
            this.lootBoxService.openBox(id).subscribe({
                next: (reward: Reward | null | boolean) => {
                    if (reward === null) {
                        const dialogRef = this.matdialog.open(ErrorDialogComponent, {
                            width: '400px',
                            panelClass: 'custom-container',
                            data: { message: "Vous n'avez pas assez d'argent pour vous procurer cette Loot Box.", reloadOnClose: false },
                        });

                        dialogRef.afterClosed().subscribe(() => {
                            this.isClaimingBox = false;
                        });
                    } else if (reward === false) {
                        const dialogRef = this.matdialog.open(ErrorDialogComponent, {
                            width: '400px',
                            panelClass: 'custom-container',
                            data: {
                                message: "Vous possèdez déjà l'item obtenu. Vous recevrez le prix de la lootBox en retour dans votre compte.",
                                reloadOnClose: false,
                            },
                        });
                        dialogRef.afterClosed().subscribe(() => {
                            this.isClaimingBox = false;
                        });
                    } else if (reward !== true) {
                        // to remove stupid type deduction error.
                        const dialogRef = this.matdialog.open(LootBoxWinDialogComponent, {
                            data: reward,
                            backdropClass: `backdrop-dialog-${reward.rarity}`,
                            panelClass: 'custom-container',
                        });
                        dialogRef.afterClosed().subscribe(() => {
                            this.isClaimingBox = false;
                        });
                        this.lootBoxService.getBoxes().subscribe(this.lootBoxesObserver);
                    }
                },
            });
        }
    }
}
