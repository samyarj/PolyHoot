import { ERROR } from '@app/constants/error-messages';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/constants/mongo-constants';
import { GameRecordDocument, GameRecordSchema, gameRecordSchema } from '@app/model/schema/game-record/game-record-schema';
import { NotFoundException } from '@nestjs/common';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameRecordService } from './game-record.service';

describe('GameRecordService', () => {
    let service: GameRecordService;
    let gameRecordModel: Model<GameRecordDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: GameRecordSchema.name, schema: gameRecordSchema }]),
            ],
            providers: [GameRecordService],
        }).compile();

        service = module.get<GameRecordService>(GameRecordService);
        gameRecordModel = module.get<Model<GameRecordDocument>>(getModelToken(GameRecordSchema.name));
        connection = await module.get(getConnectionToken());
        jest.restoreAllMocks();
        await gameRecordModel.deleteMany({}).exec();
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a game record', async () => {
        const gameRecord = {
            name: 'testGame',
            startingDate: new Date().toString(),
            playersNumber: 0,
            bestScore: 0,
        };
        const createdGameRecord = await service.createGameRecord(gameRecord);
        expect(createdGameRecord).toBeDefined();
        expect(createdGameRecord.name).toEqual(gameRecord.name);
        expect(createdGameRecord.startingDate).toEqual(gameRecord.startingDate);
        expect(createdGameRecord.playersNumber).toEqual(gameRecord.playersNumber);
        expect(createdGameRecord.bestScore).toEqual(gameRecord.bestScore);
    });

    it('should get game records', async () => {
        const gameRecord = {
            name: 'testGame',
            startingDate: new Date().toString(),
            playersNumber: 0,
            bestScore: 0,
        };
        await service.createGameRecord(gameRecord);
        const gameRecords = await service.getGameRecords();
        expect(gameRecords).toBeDefined();
        expect(gameRecords.length).toBe(1);
        expect(gameRecords[0].name).toEqual(gameRecord.name);
        expect(gameRecords[0].startingDate).toEqual(gameRecord.startingDate);
        expect(gameRecords[0].playersNumber).toEqual(gameRecord.playersNumber);
        expect(gameRecords[0].bestScore).toEqual(gameRecord.bestScore);
    });

    it('should return an NotFoundException when getting game records fails', async () => {
        gameRecordModel.find = jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new NotFoundException(ERROR.HISTORY.LIST_FAILED_TO_LOAD)),
        });

        await expect(service.getGameRecords()).rejects.toThrow(ERROR.HISTORY.LIST_FAILED_TO_LOAD);

        expect(gameRecordModel.find).toHaveBeenCalled();
    });

    it('should delete all game records', async () => {
        const gameRecord = {
            name: 'testGame',
            startingDate: new Date().toString(),
            playersNumber: 0,
            bestScore: 0,
        };
        await service.createGameRecord(gameRecord);
        let gameRecords = await service.getGameRecords();
        expect(gameRecords.length).toBe(1);
        await service.deleteAllGameRecords();
        gameRecords = await service.getGameRecords();
        expect(gameRecords.length).toBe(0);
    });
});
