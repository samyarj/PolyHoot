import { AuthGuard } from '@app/guards/auth/auth.guard';
import { UserService } from '@app/services/auth/user.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

@Controller('game-logs')
export class GameLogsController {
    constructor(private userService: UserService) {}

    @Post(':uid')
    @UseGuards(AuthGuard)
    async addGameLog(
        @Param('uid') uid: string,
        @Body()
        gameLog: {
            gameName?: string;
            startTime?: string;
            endTime?: string;
            status?: 'complete' | 'abandoned';
            result?: 'win' | 'lose';
        },
    ) {
        const success = await this.userService.addGameLog(uid, gameLog);
        return { success };
    }

    @Get(':uid')
    @UseGuards(AuthGuard)
    async getGameLogs(@Param('uid') uid: string) {
        const logs = await this.userService.getGameLogs(uid);
        return { logs };
    }

    @Put(':uid')
    @UseGuards(AuthGuard)
    async updateGameLog(
        @Param('uid') uid: string,
        @Query('index') index: string,
        @Body()
        gameLog: {
            gameName?: string;
            startTime?: string;
            endTime?: string;
            status?: 'complete' | 'abandoned';
            result?: 'win' | 'lose';
        },
    ) {
        const success = await this.userService.updateGameLog(uid, gameLog);
        return { success };
    }

    @Delete(':uid')
    @UseGuards(AuthGuard)
    async clearGameLogs(@Param('uid') uid: string) {
        const success = await this.userService.clearGameLogs(uid);
        return { success };
    }
}
