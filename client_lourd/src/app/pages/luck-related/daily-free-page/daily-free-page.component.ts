import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LootBoxWinDialogComponent } from '@app/components/general-elements/lootbox-win-dialog/lootbox-win-dialog.component';
import { LootBoxContainer, Reward, RewardRarity, RewardType } from '@app/interfaces/lootbox-related';
import { LootBoxService } from '@app/services/luck-services/lootbox.service';
import { interval, Observer, Subject, Subscription, takeUntil } from 'rxjs';

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
    canClaim: boolean = true; // needed by default so startTimer dont start on ngOninit
    shouldConsiderAvailable: boolean = false;
    private destroy$ = new Subject<void>();
    private intervalSubscription: Subscription | null = null;
    private dailyFreeObserver: Partial<Observer<{ lootbox: LootBoxContainer; canClaim: boolean; hoursLeft: number; minutesLeft: number }>> = {
        next: (dailyFree: { lootbox: LootBoxContainer; canClaim: boolean; hoursLeft: number; minutesLeft: number }) => {
            this.dailyFreeContainer = dailyFree.lootbox;
            this.canClaim = dailyFree.canClaim;
            this.hoursLeft = dailyFree.hoursLeft;
            this.minutesLeft = dailyFree.minutesLeft;
            this.startTimer();
            if (this.canClaim) {
                this.shouldConsiderAvailable = false;
            } else {
                this.shouldConsiderAvailable = true;
            }
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
        // keep this demon as is. We're hyper-customizing this :).
        if (this.hoursLeft < 0) {
            return 'Checking status';
        } else {
            if (this.hoursLeft > 1) {
                if (Math.floor(this.minutesLeft) > 1) {
                    return `${this.hoursLeft} heures et ${Math.floor(this.minutesLeft)} minutes`;
                } else if (Math.floor(this.minutesLeft) === 1) {
                    return `${this.hoursLeft} heures et ${Math.floor(this.minutesLeft)} minute`;
                } else {
                    return `${this.hoursLeft} heures`;
                }
            } else if (this.hoursLeft === 1) {
                if (Math.floor(this.minutesLeft) > 1) {
                    return `${this.hoursLeft} heure et ${Math.floor(this.minutesLeft)} minutes`;
                } else if (Math.floor(this.minutesLeft) === 1) {
                    return `${this.hoursLeft} heure et ${Math.floor(this.minutesLeft)} minute`;
                } else {
                    return `${this.hoursLeft} heure`;
                }
            } else {
                if (Math.floor(this.minutesLeft) > 1) {
                    return `${Math.floor(this.minutesLeft)} minutes`;
                } else if (Math.floor(this.minutesLeft) === 1) {
                    return `${Math.floor(this.minutesLeft)} minute`;
                } else {
                    return 'Checking status';
                }
            }
        }
    }

    ngOnInit() {
        this.startTimer();
    }

    startTimer() {
        if (!this.intervalSubscription && !this.canClaim) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.intervalSubscription = interval(12000)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    if (!this.canClaim) {
                        this.minutesLeft -= 0.2;
                        if (this.minutesLeft <= 0) {
                            this.hoursLeft -= 1;
                            if (this.hoursLeft < 0) {
                                this.loadDailyFree();
                            }
                            // eslint-disable-next-line no-loss-of-precision
                            this.minutesLeft = 59.999999999999999; // So that it floors towards 59 when shown on screen.
                        }
                    }
                });
        }
    }

    stopTimer() {
        if (this.intervalSubscription) {
            this.intervalSubscription.unsubscribe();
            this.intervalSubscription = null;
        }
    }

    ngOnDestroy() {
        this.stopTimer();
        this.destroy$.next();
        this.destroy$.complete();
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
        this.stopTimer();
        this.lootBoxService.getDailyFree().subscribe(this.dailyFreeObserver);
    }
}
