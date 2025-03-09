import { LootBoxContainer, Reward, RewardRarity, RewardType } from '@app/interface/lootbox-related';

export const PITY_INCREMENT: number = 5;

// The following rewards must be verified manually that they sum up to 100.
export const REWARDS_1: Reward[] = [
    {
        type: RewardType.Avatar,
        rarity: RewardRarity.VeryRare,
        odds: 5,
        value: '',
    },
    {
        type: RewardType.Avatar,
        rarity: RewardRarity.Rare,
        odds: 25,
        value: '',
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Common,
        odds: 20,
        value: 25,
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Common,
        odds: 20,
        value: '',
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Common,
        odds: 30,
        value: 10,
    },
];

export const REWARDS_2: Reward[] = [
    {
        type: RewardType.Border,
        rarity: RewardRarity.VeryRare,
        odds: 1,
        value: '',
    },
    {
        type: RewardType.Border,
        rarity: RewardRarity.Rare,
        odds: 30,
        value: '',
    },
    {
        type: RewardType.Border,
        rarity: RewardRarity.Common,
        odds: 16,
        value: '',
    },
    {
        type: RewardType.Border,
        rarity: RewardRarity.Common,
        odds: 23,
        value: '',
    },
    {
        type: RewardType.Border,
        rarity: RewardRarity.Common,
        odds: 30,
        value: '',
    },
];

export const REWARDS_3: Reward[] = [
    {
        type: RewardType.Theme,
        rarity: RewardRarity.VeryRare,
        odds: 5,
        value: 'gold',
    },
    {
        type: RewardType.Theme,
        rarity: RewardRarity.Rare,
        odds: 15,
        value: 'red',
    },
    {
        type: RewardType.Theme,
        rarity: RewardRarity.Common,
        odds: 80,
        value: 'green',
    },
];

export const DAILY_FREE_REWARDS: Reward[] = [
    {
        type: RewardType.Coins,
        rarity: RewardRarity.VeryRare,
        odds: 5,
        value: 500,
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Rare,
        odds: 15,
        value: 250,
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Common,
        odds: 20,
        value: 50,
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Common,
        odds: 20,
        value: 30,
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Common,
        odds: 20,
        value: 20,
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Common,
        odds: 20,
        value: 10,
    },
];

export const DAILY_FREE_BOX: LootBoxContainer = {
    rewards: DAILY_FREE_REWARDS,
    image: '',
    price: 0,
};

export const LOOTBOX_1: LootBoxContainer = {
    rewards: REWARDS_1,
    image: '',
    price: 50,
};

export const LOOTBOX_2: LootBoxContainer = {
    rewards: REWARDS_2,
    image: '',
    price: 10,
};

export const LOOTBOX_3: LootBoxContainer = {
    rewards: REWARDS_3,
    image: '',
    price: 100,
};
