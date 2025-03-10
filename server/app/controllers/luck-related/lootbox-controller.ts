import { AuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedRequest } from '@app/interface/authenticated-request';
import { LootBoxContainer } from '@app/interface/lootbox-related';
import { UserService } from '@app/services/auth/user.service';
import { LootBoxService } from '@app/services/lootbox/lootbox.service';
import { Body, Controller, Get, HttpStatus, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Timestamp } from 'firebase/firestore';

@ApiTags('LootBox')
@Controller('loot')
export class LootBoxController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly lootBoxService: LootBoxService,
    ) {}

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'LootBoxes fetched successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('lootBox')
    async getLootBoxReward(@Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`GEtting boxes for user : ${req.user.displayName}`);
        try {
            const user = await this.userService.getUserByUid(req.user.uid);
            const lootBoxes: LootBoxContainer[] = this.lootBoxService.getBoxes(user.pity);
            response.status(HttpStatus.OK).json(lootBoxes);
        } catch (error) {
            this.logger.error(`Error fetching lootboxes for: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'LootBox opened successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('lootBox')
    async openLootBox(@Body() payload: { id: number }, @Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Opening box for user : ${req.user.displayName}`);
        try {
            const user = await this.userService.getUserByUid(req.user.uid);
            const reward = await this.lootBoxService.openBox(payload.id, user.uid, user.pity);
            response.status(HttpStatus.OK).json(reward);
        } catch (error) {
            this.logger.error(`Error opening lootbox for: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'DailyFree fetched successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('dailyFree')
    async getDailyFree(@Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Getting boxes for user : ${req.user.displayName}`);
        try {
            const dailyFree: LootBoxContainer = await this.lootBoxService.getDailyFree();
            const canClaim: boolean = await this.lootBoxService.canClaimDailyFreeUser(req.user.uid);
            const user = await this.userService.getUserByUid(req.user.uid);

            const currentTime = new Date();
            const nextDailyFreeDate = new Date((user.nextDailyFree as unknown as Timestamp).toDate());

            const timeDiffMs = nextDailyFreeDate.getTime() - currentTime.getTime();
            const timeDiffMinutes = timeDiffMs / 60000; // Convert milliseconds to minutes

            let hoursLeft: number = Math.floor(timeDiffMinutes / 60);
            let minutesLeft: number = timeDiffMinutes % 60;
            if (hoursLeft === 24 && minutesLeft === 0) {
                hoursLeft = 23;
                minutesLeft = 59.9999998; // Goal is for it to floor towards 59.
            }
            response.status(HttpStatus.OK).json({ lootbox: dailyFree, canClaim: canClaim, hoursLeft: hoursLeft, minutesLeft: minutesLeft });
        } catch (error) {
            this.logger.error(`Error fetching daily free for: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'DailyFree successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('dailyFree')
    async openDailyFree(@Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Opening box for user : ${req.user.displayName}`);
        try {
            const user = await this.userService.getUserByUid(req.user.uid);
            const reward = await this.lootBoxService.openDailyFree(user.uid);
            if (reward === null) {
                throw new Error('Cannot claim daily free, not the time yet :)');
            } else {
                response.status(HttpStatus.OK).json(reward);
            }
        } catch (error) {
            this.logger.error(`Error claiming dailyFree for: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }
}
