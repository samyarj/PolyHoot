import {
    AVATAR_DEADPOOL,
    AVATAR_GREEN_LANTERN,
    AVATAR_PUNISHER,
    AVATAR_SUPERMAN,
    AVATAR_VENOM,
    AVATAR_WONDER_WOMAN,
    BANNER_GOLD,
    BANNER_PLANT,
} from './inventory.constants';

export type ShopItem = { link: string; price: number };

export const SHOP: {
    avatars: ShopItem[];
    banners: ShopItem[];
    themes: ShopItem[];
} = {
    avatars: [
        { link: AVATAR_SUPERMAN, price: 10 },
        { link: AVATAR_WONDER_WOMAN, price: 60 },
        { link: AVATAR_VENOM, price: 50 },
        { link: AVATAR_DEADPOOL, price: 40 },
        { link: AVATAR_GREEN_LANTERN, price: 30 },
        { link: AVATAR_PUNISHER, price: 20 },
    ],
    banners: [
        { link: BANNER_GOLD, price: 30 },
        { link: BANNER_PLANT, price: 20 },
    ],
    themes: [
        { link: 'gold', price: 10 },
        { link: 'inferno', price: 40 },
        { link: 'lava', price: 30 },
        { link: 'emerald', price: 20 },
    ],
};
