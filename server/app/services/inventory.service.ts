import { Injectable } from '@nestjs/common';
import { UserService } from './auth/user.service';

@Injectable()
export class InventoryService {
    constructor(private userService: UserService) {}

    async equipTheme(uid: string, theme: string): Promise<boolean> {
        return await this.userService.equipTheme(uid, theme);
    }

    async equipAvatar(uid: string, avatarURL: string): Promise<boolean> {
        return await this.userService.equipAvatar(uid, avatarURL);
    }

    async equipBanner(uid: string, bannerURL: string): Promise<boolean> {
        return await this.userService.equipBanner(uid, bannerURL);
    }
}
