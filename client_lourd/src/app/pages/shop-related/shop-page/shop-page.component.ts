import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/general-elements/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '@app/components/general-elements/error-dialog/error-dialog.component';
import { WIDTH_SIZE } from '@app/constants/constants';
import { ShopService } from '@app/services/general-services/shop.service';

@Component({
    selector: 'app-shop-page',
    templateUrl: './shop-page.component.html',
    styleUrls: ['./shop-page.component.scss'],
})
export class ShopPageComponent {
    constructor(
        private shopService: ShopService,
        private matdialog: MatDialog,
    ) {
        this.shopService.getShop();
    }
    get shop() {
        return this.shopService.shop;
    }

    submitBuy(type: string, itemURL: string) {
        let messageTarget = '';
        switch (type) {
            case 'avatar': {
                messageTarget = 'cet avatar';
                break;
            }
            case 'banner': {
                messageTarget = "cette bannière d'avatar";
                break;
            }
            case 'theme': {
                messageTarget = 'ce thème';
                break;
            }
        }

        const dialogRef = this.matdialog.open(ConfirmationDialogComponent, {
            width: WIDTH_SIZE,
            data: `Voulez vous acheter ${messageTarget}?`,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.buyItem(type, itemURL);
            }
        });
    }

    buyItem(type: string, itemURL: string) {
        this.shopService.buyItem(type, itemURL).subscribe({
            next: (isItemAddedToInventory: boolean) => {
                if (isItemAddedToInventory === false) {
                    this.matdialog.open(ErrorDialogComponent, {
                        width: '400px',
                        data: {
                            message: "Vous possèdez déjà l'item obtenu. Vous recevrez le prix de la lootBox en retour dans votre compte.",
                            reloadOnClose: false,
                        },
                    });
                } else {
                    this.matdialog.open(ConfirmationDialogComponent, {
                        width: WIDTH_SIZE,
                        data: 'Merci pour votre achat. Vous pouvez consulter votre achat dans votre inventaire.',
                    });
                }
                this.shopService.getShop();
            },
        });
    }
}
