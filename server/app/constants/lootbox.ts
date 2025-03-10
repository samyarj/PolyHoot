import { LootBoxContainer, Reward, RewardRarity, RewardType } from '@app/interface/lootbox-related';
import {
    AVATAR_BATMAN,
    AVATAR_CAPTAIN_AMERICA,
    AVATAR_LOKI,
    AVATAR_SPIDERMAN,
    BANNER_FIRE,
    BANNER_SIDALI,
    BANNER_WATER,
    BANNER_WOOD,
} from './inventory.constants';

export const PITY_INCREMENT: number = 5;

// The following rewards must be verified manually that they sum up to 100.
export const REWARDS_1: Reward[] = [
    {
        type: RewardType.Avatar,
        rarity: RewardRarity.VeryRare,
        odds: 1,
        value: AVATAR_BATMAN,
    },
    {
        type: RewardType.Avatar,
        rarity: RewardRarity.VeryRare,
        odds: 2,
        value: AVATAR_CAPTAIN_AMERICA,
    },
    {
        type: RewardType.Avatar,
        rarity: RewardRarity.VeryRare,
        odds: 2,
        value: AVATAR_LOKI,
    },
    {
        type: RewardType.Avatar,
        rarity: RewardRarity.Rare,
        odds: 25,
        value: AVATAR_SPIDERMAN,
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
        value: 15,
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
        value: BANNER_SIDALI,
    },
    {
        type: RewardType.Border,
        rarity: RewardRarity.Rare,
        odds: 10,
        value: BANNER_FIRE,
    },
    {
        type: RewardType.Border,
        rarity: RewardRarity.Rare,
        odds: 15,
        value: BANNER_WATER,
    },
    {
        type: RewardType.Border,
        rarity: RewardRarity.Common,
        odds: 25,
        value: BANNER_WOOD,
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Common,
        odds: 49,
        value: 10,
    },
];

export const REWARDS_3: Reward[] = [
    {
        type: RewardType.Theme,
        rarity: RewardRarity.VeryRare,
        odds: 1,
        value: 'vice',
    },
    {
        type: RewardType.Theme,
        rarity: RewardRarity.VeryRare,
        odds: 1,
        value: 'neon',
    },
    {
        type: RewardType.Theme,
        rarity: RewardRarity.VeryRare,
        odds: 1,
        value: 'celestial',
    },
    {
        type: RewardType.Theme,
        rarity: RewardRarity.VeryRare,
        odds: 2,
        value: 'toxic',
    },
    {
        type: RewardType.Theme,
        rarity: RewardRarity.Rare,
        odds: 15,
        value: 'sunset',
    },
    {
        type: RewardType.Coins,
        rarity: RewardRarity.Common,
        odds: 80,
        value: 10,
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
    image: 'AVATARS',
    price: 50,
};

export const LOOTBOX_2: LootBoxContainer = {
    rewards: REWARDS_2,
    image: 'BANNIÈRES DE PROFIL',
    price: 10,
};

export const LOOTBOX_3: LootBoxContainer = {
    rewards: REWARDS_3,
    image: 'THÈMES',
    price: 100,
};
