import { SHOP } from '@app/constants/shop';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ShopService {
    getShop(inventory: { avatars?: string[]; banners?: string[]; themes?: string[] }) {
        return {
            avatars: SHOP.avatars.filter((avatar) => !(inventory.avatars?.includes(avatar.link) ?? false)).sort((a, b) => b.price - a.price),

            banners: SHOP.banners.filter((banner) => !(inventory.banners?.includes(banner.link) ?? false)).sort((a, b) => b.price - a.price),

            themes: SHOP.themes.filter((theme) => !(inventory.themes?.includes(theme.link) ?? false)).sort((a, b) => b.price - a.price),
        };
    }
}
