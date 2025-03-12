import { ShopItem } from '@app/constants/shop';
import { AuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedRequest } from '@app/interface/authenticated-request';
import { UserService } from '@app/services/auth/user.service';
import { ShopService } from '@app/services/shop.service';
import { Body, Controller, Get, HttpStatus, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Shop')
@Controller('shop')
export class ShopController {
    constructor(
        private readonly logger: Logger,
        private readonly shopService: ShopService,
        private readonly userService: UserService,
    ) {}

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'Shop fetched successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('shop')
    async getShop(@Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Getting shop for user : ${req.user.displayName}`);
        try {
            const user = await this.userService.getUserByUid(req.user.uid);
            const shop: {
                avatars: ShopItem[];
                banners: ShopItem[];
                themes: ShopItem[];
            } = this.shopService.getShop(user.inventory);
            response.status(HttpStatus.OK).json(shop);
        } catch (error) {
            this.logger.error(`Error getting shop: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'Purchase made successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('shop')
    async setAvatar(@Body() body: { type: string; itemURL: string }, @Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Buying ${body.type} from shop for user : ${req.user.displayName}`);
        try {
            const itemPrice: number | null = this.shopService.getPriceByLink(body.itemURL);
            if (itemPrice === null) {
                throw new Error("L'item n'est pas présent dans la boutique!");
            }

            const canAffordItem: boolean = await this.userService.updateUserCoins(req.user.uid, -1 * itemPrice);
            if (canAffordItem) {
                const isItemAddedToInventory: boolean | null = await this.userService.addToInventory(req.user.uid, body.type, body.itemURL);
                if (!isItemAddedToInventory) {
                    await this.userService.updateUserCoins(req.user.uid, itemPrice); //give back money
                }
                response.status(HttpStatus.OK).json(isItemAddedToInventory);
            } else {
                response.status(HttpStatus.OK).json(null); // not enough money
            }
        } catch (error) {
            this.logger.error(`Error buying ${body.type} from shop: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }
}
