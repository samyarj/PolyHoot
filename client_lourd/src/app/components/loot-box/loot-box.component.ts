import { Component, Input } from '@angular/core';
import { LootBoxContainer, RewardRarity, RewardType } from '@app/interfaces/lootbox-related';

@Component({
    selector: 'app-loot-box',
    templateUrl: './loot-box.component.html',
    styleUrls: ['./loot-box.component.scss'],
})
export class LootBoxComponent {
    @Input() openFunction!: (id: number) => void;
    @Input() id!: number;
    @Input() lootBoxContainer!: LootBoxContainer;
    isMoved = false;
    rewardRarity = RewardRarity; // to use enum in HTML
    rewardType = RewardType;
    toggleMove() {
        this.isMoved = !this.isMoved;
    }
}
