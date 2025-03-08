import { LootBox } from '@app/classes/lootbox/lootbox';
import { DAILY_FREE_BOX, LOOTBOX_1, LOOTBOX_2, LOOTBOX_3, PITY_INCREMENT } from '@app/constants/lootbox';
import { LootBoxContainer, Reward, RewardRarity, RewardType } from '@app/interface/lootbox-related';
import { Injectable } from '@nestjs/common';
import { UserService } from '../auth/user.service';

@Injectable()
export class LootBoxService {
    private availableLootBoxes: LootBox[] = [new LootBox(LOOTBOX_1), new LootBox(LOOTBOX_2), new LootBox(LOOTBOX_3)];
    private dailyFree: LootBox = new LootBox(DAILY_FREE_BOX);
    constructor(private userService: UserService) {}

    getBoxes(pity: number): LootBoxContainer[] {
        return this.availableLootBoxes.map((lootBox) => lootBox.getAdjustedLootBox(pity));
    }

    async updatePity(uid: string, pity: number) {
        await this.userService.updatePity(uid, pity);
    }

    async updateNextDailyFree(uid: string): Promise<boolean> {
        return await this.userService.updateNextDailyFree(uid);
    }

    async getDailyFree(): Promise<LootBoxContainer> {
        return await this.dailyFree;
    }

    async canClaimDailyFreeUser(uid: string): Promise<boolean> {
        return await this.userService.canClaimDailyFreeUser(uid);
    }

    async openDailyFree(uid: string): Promise<Reward | null> {
        let reward: Reward = this.dailyFree.open(0);
        if (reward.type === RewardType.Coins && typeof reward.value === 'number') {
            //certain this is number unless object not well constructed
            if (await this.updateNextDailyFree(uid)) {
                await this.userService.updateUserCoins(uid, reward.value as number);
                return reward;
            }
        }

        return null;
    }

    async openBox(boxIndex: number, uid: string, pity: number): Promise<Reward | boolean> {
        let canAffordBox: boolean = await this.userService.updateUserCoins(uid, -1 * this.availableLootBoxes[boxIndex].price);
        if (!canAffordBox) {
            return null;
        } else {
            let reward: Reward = this.availableLootBoxes[boxIndex].open(pity);
            if (reward.type === RewardType.Coins && typeof reward.value === 'number') {
                //certain this is number unless object not well constructed
                await this.userService.updateUserCoins(uid, reward.value as number);
            } else {
                // PUT INTO INVENTORY HERE if not coins and if not alr owned!!!
                let hasBeenAddedToInventory: boolean = false;
                if (reward.type === RewardType.Avatar) hasBeenAddedToInventory = await this.userService.addToInventory(uid, 'avatar', reward.value);
                else if (reward.type === RewardType.Border)
                    hasBeenAddedToInventory = await this.userService.addToInventory(uid, 'banner', reward.value);
                else if (reward.type === RewardType.Theme)
                    hasBeenAddedToInventory = await this.userService.addToInventory(uid, 'theme', reward.value);

                if (!hasBeenAddedToInventory) {
                    await this.userService.updateUserCoins(uid, this.availableLootBoxes[boxIndex].price); // give back money.
                    return false;
                }
            }
            if (reward.rarity === RewardRarity.Common) {
                await this.updatePity(uid, pity + PITY_INCREMENT);
            } else {
                await this.updatePity(uid, 0);
            }

            return reward;
        }
    }
}
