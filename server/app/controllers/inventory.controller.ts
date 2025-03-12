import { AuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedRequest } from '@app/interface/authenticated-request';
import { InventoryService } from '@app/services/inventory.service';
import { Body, Controller, HttpStatus, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
    constructor(
        private readonly logger: Logger,
        private readonly inventoryService: InventoryService,
    ) {}

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'Theme equipped successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('theme')
    async setTheme(@Body() body: { theme: string }, @Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Equipping theme for user : ${req.user.displayName}`);
        try {
            //const user = await this.userService.getUserByUid(req.user.uid);
            const isThemeEquipped: boolean = await this.inventoryService.equipTheme(req.user.uid, body.theme);
            response.status(HttpStatus.OK).json(isThemeEquipped);
        } catch (error) {
            this.logger.error(`Error equipping theme: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'Theme equipped successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('avatar')
    async setAvatar(@Body() body: { avatarURL: string }, @Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Equipping avatar for user : ${req.user.displayName}`);
        try {
            //const user = await this.userService.getUserByUid(req.user.uid);
            const isAvatarEquipped: boolean = await this.inventoryService.equipAvatar(req.user.uid, body.avatarURL);
            response.status(HttpStatus.OK).json(isAvatarEquipped);
        } catch (error) {
            this.logger.error(`Error equipping avatar: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'Banner equipped successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('banner')
    async setBanner(@Body() body: { bannerURL: string }, @Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Equipping banner for user : ${req.user.displayName}`);
        try {
            //const user = await this.userService.getUserByUid(req.user.uid);
            const isBannerEquipped: boolean = await this.inventoryService.equipBanner(req.user.uid, body.bannerURL);
            response.status(HttpStatus.OK).json(isBannerEquipped);
        } catch (error) {
            this.logger.error(`Error equipping banner: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }
}
