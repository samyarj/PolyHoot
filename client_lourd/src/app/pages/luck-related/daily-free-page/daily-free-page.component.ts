import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LootBoxWinDialogComponent } from '@app/components/general-elements/lootbox-win-dialog/lootbox-win-dialog.component';
import { LootBoxContainer, Reward, RewardRarity, RewardType } from '@app/interfaces/lootbox-related';
import { LootBoxService } from '@app/services/luck-services/lootbox.service';
import { interval, Observer, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-daily-free-page',
    templateUrl: './daily-free-page.component.html',
    styleUrls: ['./daily-free-page.component.scss'],
})
export class DailyFreePageComponent implements OnInit, OnDestroy {
    isMoved = false;
    rewardRarity = RewardRarity;
    rewardType = RewardType;
    dailyFreeContainer: LootBoxContainer = {
        rewards: [],
        image: '',
        price: 0,
    };
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    nextDailyFreeDate: Date = new Date(9999, 1, 1);
    hoursLeft: number = 0;
    minutesLeft: number = 0;
    canClaim: boolean = false;
    shouldConsiderAvailable: boolean = false;
    private destroy$ = new Subject<void>();

    private dailyFreeObserver: Partial<Observer<{ lootbox: LootBoxContainer; canClaim: boolean; nextDailyFreeDate: Date }>> = {
        next: (dailyFree: { lootbox: LootBoxContainer; canClaim: boolean; nextDailyFreeDate: Date }) => {
            this.dailyFreeContainer = dailyFree.lootbox;
            this.canClaim = dailyFree.canClaim;
            this.nextDailyFreeDate = new Date(dailyFree.nextDailyFreeDate);
            this.setHoursMinsLeft();
            if (this.canClaim) {
                this.shouldConsiderAvailable = false;
            } else {
                this.shouldConsiderAvailable = true;
            }
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

    get availableIn() {
        if (this.hoursLeft < 0) {
            return 'Checking status';
        } else {
            if (this.hoursLeft > 1) {
                if (this.minutesLeft > 1) {
                    return `${this.hoursLeft} heures et ${Math.ceil(this.minutesLeft)} minutes`;
                } else {
                    return `${this.hoursLeft} heures et ${Math.ceil(this.minutesLeft)} minute`;
                }
            } else if (this.hoursLeft === 1) {
                if (this.minutesLeft > 1) {
                    return `${this.hoursLeft} heure et ${Math.ceil(this.minutesLeft)} minutes`;
                } else {
                    return `${this.hoursLeft} heure et ${Math.ceil(this.minutesLeft)} minute`;
                }
            } else {
                if (this.minutesLeft > 1) {
                    return `${Math.ceil(this.minutesLeft)} minutes`;
                } else {
                    return `${Math.ceil(this.minutesLeft)} minute`;
                }
            }
        }
    }

    ngOnInit() {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        interval(12000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (!this.canClaim) {
                    this.minutesLeft -= 0.2;
                    if (this.minutesLeft <= 0) {
                        this.hoursLeft -= 1;
                        if (this.hoursLeft < 0) {
                            this.loadDailyFree();
                        }
                        this.minutesLeft = 60;
                    }
                    console.log(`heures: ${this.hoursLeft}\nminutes: ${this.minutesLeft}`);
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    setHoursMinsLeft() {
        const currentDate = new Date();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const timeDifferenceMin = (this.nextDailyFreeDate.getTime() - currentDate.getTime()) / 60000; // 60 000 ms in one minute
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.hoursLeft = Math.floor(timeDifferenceMin / 60); // Round down the hours
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.minutesLeft = timeDifferenceMin % 60;
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
        this.lootBoxService.getDailyFree().subscribe(this.dailyFreeObserver);
    }
}
