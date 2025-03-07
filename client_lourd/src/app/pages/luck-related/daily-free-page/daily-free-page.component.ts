import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LootBoxWinDialogComponent } from '@app/components/general-elements/lootbox-win-dialog/lootbox-win-dialog.component';
import { LootBoxContainer, Reward, RewardRarity, RewardType } from '@app/interfaces/lootbox-related';
import { LootBoxService } from '@app/services/luck-services/lootbox.service';
import { lastValueFrom, Observer } from 'rxjs';

@Component({
    selector: 'app-daily-free-page',
    templateUrl: './daily-free-page.component.html',
    styleUrls: ['./daily-free-page.component.scss'],
})
export class DailyFreePageComponent {
    isMoved = false;
    rewardRarity = RewardRarity;
    rewardType = RewardType;
    dailyFreeContainer: LootBoxContainer = {
        rewards: [],
        image: '',
        price: 0,
    };
    canClaim: boolean = false;
    shouldConsiderAvailable: boolean = false;
    firstRequestMade: boolean = false;

    private dailyFreeObserver: Partial<Observer<{ lootbox: LootBoxContainer; canClaim: boolean }>> = {
        next: (dailyFree: { lootbox: LootBoxContainer; canClaim: boolean }) => {
            this.dailyFreeContainer = dailyFree.lootbox;
            this.canClaim = dailyFree.canClaim;
            if (this.canClaim) {
                this.shouldConsiderAvailable = false;
            } else {
                this.shouldConsiderAvailable = true;
            }
            this.firstRequestMade = false;
            console.log(this.user?.nextDailyFree);
        },
        error: () => {
            console.log('Could not fetch lootBoxes.');
        },
    };

    constructor(
        private lootBoxService: LootBoxService,
        private matdialog: MatDialog,
    ) {
        this.loadDailyFree();
    }

    get user() {
        return this.lootBoxService.user;
    }

    get availableIn(): string {
        if (this.user?.nextDailyFree !== null && this.user?.nextDailyFree !== undefined && this.shouldConsiderAvailable && !this.firstRequestMade) {
            const nextDateStr = this.user.nextDailyFree.toDate().toLocaleString('en-US', {});
            const currentDate = new Date();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const timeDifferenceMin = (new Date(nextDateStr).getTime() - currentDate.getTime()) / 60000; // 60 000 ms in one minute
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const hours = Math.floor(timeDifferenceMin / 60); // Round down the hours
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const minutes = Math.ceil(timeDifferenceMin % 60); // Round up the minutes
            if (timeDifferenceMin <= 0) {
                this.lootBoxService.getDailyFree().subscribe(this.dailyFreeObserver);
                this.firstRequestMade = true;
                return 'Checking status';
            } else {
                return `${hours} heures et ${minutes} minutes`;
            }
        }
        return 'Checking status';
    }

    openDailyFree() {
        this.lootBoxService.openDailyFree().subscribe({
            next: async (reward: Reward) => {
                this.isMoved = true;
                this.matdialog.open(LootBoxWinDialogComponent, {
                    data: reward,
                    backdropClass: `backdrop-dialog-${reward.rarity}`,
                    panelClass: 'custom-container',
                });
                this.lootBoxService.getDailyFree().subscribe(this.dailyFreeObserver);
            },
        });
    }

    private async loadDailyFree(): Promise<void> {
        try {
            const dailyFree = await lastValueFrom(this.lootBoxService.getDailyFree());
            this.dailyFreeContainer = dailyFree.lootbox;
            this.canClaim = dailyFree.canClaim;
            if (this.canClaim) {
                this.shouldConsiderAvailable = false;
            } else {
                this.shouldConsiderAvailable = true;
            }
        } catch (error) {
            console.error('Error fetching daily free loot box:', error);
        }
    }
}
