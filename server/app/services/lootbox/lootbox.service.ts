import { LootBox } from '@app/classes/lootbox/lootbox';
import { LOOTBOX_1, LOOTBOX_2, LOOTBOX_3, PITY_INCREMENT } from '@app/constants/lootbox';
import { LootBoxContainer, Reward, RewardRarity } from '@app/interface/lootbox-related';
import { Injectable } from '@nestjs/common';
import { UserService } from '../auth/user.service';

@Injectable()
export class LootBoxService {
    private availableLootBoxes: LootBox[] = [new LootBox(LOOTBOX_1), new LootBox(LOOTBOX_2), new LootBox(LOOTBOX_3)];

    constructor(private userService: UserService) {}

    getBoxes(pity: number): LootBoxContainer[] {
        return this.availableLootBoxes.map((lootBox) => lootBox.getAdjustedLootBox(pity));
    }

    async updatePity(uid: string, pity: number) {
        await this.userService.updatePity(uid, pity);
        console.log('pityUpdated!!!');
    }

    async openBox(boxIndex: number, uid: string, pity: number): Promise<Reward> {
        let canAffordBox: Promise<boolean> = this.userService.updateUserCoins(uid, -1 * this.availableLootBoxes[boxIndex].price);
        if (!canAffordBox) {
            return null;
        } else {
            let reward: Reward = this.availableLootBoxes[boxIndex].open(pity);
            // PUT INTO INVENTORY HERE!!!
            if (reward.rarity === RewardRarity.Common) {
                await this.updatePity(uid, pity + PITY_INCREMENT);
            } else {
                await this.updatePity(uid, 0);
            }

            return reward;
        }
    }
}
