import { ERROR } from '@app/constants/error-messages';
import { CreateGameRecordDto } from '@app/model/dto/game-record/create-game-record.dto';
import { GameRecordDocument, GameRecordSchema } from '@app/model/schema/game-record/game-record-schema';
import { GameRecord } from '@common/game-record';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameRecordService {
    constructor(@InjectModel(GameRecordSchema.name) private gameRecordModel: Model<GameRecordDocument>) {}

    async getGameRecords(): Promise<GameRecord[]> {
        try {
            return await this.gameRecordModel.find().exec();
        } catch (error) {
            throw new NotFoundException(ERROR.HISTORY.LIST_FAILED_TO_LOAD);
        }
    }
    async deleteAllGameRecords(): Promise<GameRecord[]> {
        await this.gameRecordModel.deleteMany().exec();
        const updatedGameRecords = await this.gameRecordModel.find().exec();
        return updatedGameRecords;
    }

    async createGameRecord(gameRecord: CreateGameRecordDto): Promise<GameRecordDocument> {
        const createdGameRecord = new this.gameRecordModel(gameRecord);
        return createdGameRecord.save();
    }
}
