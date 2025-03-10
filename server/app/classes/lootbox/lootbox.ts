import { LootBoxContainer, Reward, RewardRarity } from '@app/interface/lootbox-related';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LootBox {
    rewards: Reward[];
    image: string;
    price: number;

    constructor(lootBoxContainer: LootBoxContainer) {
        this.rewards = this.sortRewards(lootBoxContainer.rewards);
        this.image = lootBoxContainer.image;
        this.price = lootBoxContainer.price;
    }

    sortRewards(rewards: Reward[]) {
        return rewards.sort((a, b) => {
            const rarityOrder: Record<RewardRarity, number> = {
                [RewardRarity.Common]: 0,
                [RewardRarity.Rare]: 1,
                [RewardRarity.VeryRare]: 2,
            };

            // First compare by rarity
            const rarityComparison = rarityOrder[b.rarity] - rarityOrder[a.rarity];
            if (rarityComparison !== 0) {
                return rarityComparison; // If different rarity, prioritize the rarity sort
            }

            // If rarity is the same, then compare by odds in increasing order
            return a.odds - b.odds;
        });
    }

    getAdjustedLootBox(pity: number): LootBoxContainer {
        return {
            rewards: this.getRewardsOdds(pity),
            image: this.image,
            price: this.price,
        };
    }

    getRewardsOdds(pity: number): Reward[] {
        let cumulatedOdds: number = 0;
        const updatedRewards: Reward[] = this.rewards.map((reward) => ({
            ...reward,
            odds: reward.odds,
        }));

        // When entering here, the array is always sorted as follows:
        // VR(5%) VR(10%) R(15%) R(20%) C(20%) C(30%)
        updatedRewards.forEach((reward) => {
            if (reward.rarity === RewardRarity.Common) {
                let newOdds: number = Math.max(0, reward.odds - pity);
                cumulatedOdds += Math.min(reward.odds, pity);
                reward.odds = newOdds;
            }
        });

        while (cumulatedOdds > 0) {
            updatedRewards.forEach((reward) => {
                if (reward.rarity === RewardRarity.VeryRare && cumulatedOdds > 0) {
                    cumulatedOdds -= 1;
                    reward.odds += 1;
                } else if (reward.rarity === RewardRarity.Rare && cumulatedOdds > 0) {
                    cumulatedOdds -= 1;
                    reward.odds += 1;
                }
            });
        }

        return updatedRewards;
    }

    open(pity: number) {
        const updatedRewards = this.getRewardsOdds(pity);

        // Generate a random number and determine the reward
        let randomValue = Math.random() * 100;
        let cumulative = 0;

        for (const reward of updatedRewards) {
            cumulative += reward.odds;
            if (randomValue <= cumulative) {
                return reward;
            }
        }

        // Fallback (should never reach this point if odds are done correctly)
        return updatedRewards[updatedRewards.length - 1];
    }
}
