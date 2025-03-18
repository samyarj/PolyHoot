export enum RewardType {
    Theme = 'theme',
    Avatar = 'avatar',
    Border = 'border',
    Coins = 'coins',
}

export enum RewardRarity {
    Common = 'common',
    Rare = 'rare',
    VeryRare = 'very-rare',
}

export interface Reward {
    type: RewardType;
    rarity: RewardRarity;
    odds: number;
    value: string | number; // the link for the avatar/border or the name of the theme to be applied.
}

export interface PartialPlayer {
    name: string;
    points: number;
    isInGame: boolean;
    submitted: boolean;
}

export interface PlayerResult {
    equippedAvatar: string;
    equippedBanner: string;
    name: string;
    reward: Reward | null;
    points: number;
    isInGame: boolean;
    noBonusesObtained: number;
}
