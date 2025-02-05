import { ERROR } from '@app/constants/error-messages';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { Controller, Delete, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('History')
@Controller('history')
export class HistoryController {
    constructor(private readonly gameRecordService: GameRecordService) {}

    @ApiOkResponse({
        description: 'Returns history of all played games',
        isArray: true,
    })
    @Get('/games')
    async getAllGamesRecords(@Res() response: Response) {
        try {
            const gameRecords = await this.gameRecordService.getGameRecords();
            response.status(HttpStatus.OK).json(gameRecords);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.HISTORY.LIST_FAILED_TO_LOAD });
        }
    }

    @ApiOkResponse({
        description: 'Delete all game history records',
    })
    @Delete('/clean')
    async deleteAllGameRecords(@Res() response: Response) {
        try {
            const udatedHistory = await this.gameRecordService.deleteAllGameRecords();
            response.status(HttpStatus.OK).send(udatedHistory);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.HISTORY.FAILED_TO_DELETE });
        }
    }
}
