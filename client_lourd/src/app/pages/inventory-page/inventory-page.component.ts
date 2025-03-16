import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '@app/components/general-elements/error-dialog/error-dialog.component';
import { InventoryService } from '@app/services/general-services/inventory.service';

@Component({
    selector: 'app-inventory-page',
    templateUrl: './inventory-page.component.html',
    styleUrls: ['./inventory-page.component.scss'],
})
export class InventoryPageComponent {
    isChangingTheme: boolean = false;
    isChangingAvatar: boolean = false;
    isChangingBanner: boolean = false;
    currentTheme: string = '';
    currentAvatar: string = '';
    currentBanner: string = '';

    constructor(
        private inventoryService: InventoryService,
        private matdialog: MatDialog,
    ) {}

    get themes() {
        return this.inventoryService.themes;
    }

    get banners() {
        return this.inventoryService.banners;
    }

    get avatars() {
        return this.inventoryService.avatars;
    }

    get canEquip(): boolean {
        return !(this.currentTheme === '' && this.currentAvatar === '' && this.currentBanner === '');
    }

    get equippedAvatar(): string | undefined {
        return this.inventoryService.equippedAvatar;
    }

    get equippedBorder(): string | undefined {
        return this.inventoryService.equippedBorder;
    }

    get waitingForServerEquip(): boolean {
        return this.isChangingAvatar || this.isChangingBanner || this.isChangingTheme;
    }

    selectAvatar(avatarURL: string) {
        this.currentTheme = '';
        this.currentAvatar = avatarURL;
        if (this.currentBanner === '' && this.equippedBorder !== undefined && this.equippedBorder !== '') {
            this.currentBanner = this.equippedBorder;
        }
    }

    selectBanner(bannerURL: string) {
        this.currentTheme = '';
        this.currentBanner = bannerURL;
        if (this.currentAvatar === '' && this.equippedAvatar !== undefined && this.equippedAvatar !== '') {
            this.currentAvatar = this.equippedAvatar;
        }
    }

    selectTheme(theme: string) {
        this.currentAvatar = '';
        this.currentBanner = '';
        this.currentTheme = theme;
    }

    equip() {
        if (this.canEquip) {
            if (this.currentTheme) {
                this.setTheme(this.currentTheme);
                this.currentAvatar = '';
                this.currentBanner = '';
                this.currentTheme = '';
            } else {
                this.setAvatar(this.currentAvatar);
                this.setBanner(this.currentBanner);
                this.currentAvatar = '';
                this.currentBanner = '';
                this.currentTheme = '';
            }
        }
    }

    setAvatar(avatarUrl: string) {
        if (!this.isChangingAvatar) {
            this.isChangingAvatar = true;
            this.inventoryService.setAvatar(avatarUrl).subscribe({
                next: (isAvatarEquipped: boolean) => {
                    if (!isAvatarEquipped) {
                        this.matdialog.open(ErrorDialogComponent, {
                            width: '400px',
                            panelClass: 'custom-container',
                            data: { message: "Vous ne possèdez pas l'avatar que vous voulez équiper.", reloadOnClose: false },
                        });
                    }
                    this.isChangingAvatar = false;
                },
            });
        }
    }

    setBanner(bannerUrl: string) {
        if (!this.isChangingBanner) {
            this.isChangingBanner = true;
            this.inventoryService.setBanner(bannerUrl).subscribe({
                next: (isBannerEquipped: boolean) => {
                    if (!isBannerEquipped) {
                        this.matdialog.open(ErrorDialogComponent, {
                            width: '400px',
                            panelClass: 'custom-container',
                            data: { message: "Vous ne possèdez pas la bordure d'avatar que vous voulez équiper.", reloadOnClose: false },
                        });
                    }
                    this.isChangingBanner = false;
                },
            });
        }
    }

    setTheme(theme: string) {
        if (!this.isChangingTheme) {
            this.isChangingTheme = true;
            this.inventoryService.setTheme(theme).subscribe({
                next: (isThemeEquipped: boolean) => {
                    if (!isThemeEquipped) {
                        this.matdialog.open(ErrorDialogComponent, {
                            width: '400px',
                            panelClass: 'custom-container',
                            data: { message: 'Vous ne possèdez pas le thème de couleur que vous voulez équiper.', reloadOnClose: false },
                        });
                    }
                    this.isChangingTheme = false;
                },
            });
        }
    }
}
