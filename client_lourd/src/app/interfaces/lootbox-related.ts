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
    value: string | number; // the link for the avatar/border or the name of the theme to be applied. Or coins amount.
}

export interface LootBoxContainer {
    rewards: Reward[];
    image: string; // image of the lootbox.
    price: number;
}
