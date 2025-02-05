import { ERROR } from '@app/constants/error-messages';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { HistoryController } from './history.controller';

describe('HistoryController', () => {
    let controller: HistoryController;
    let gameRecordService: SinonStubbedInstance<GameRecordService>;

    const MOCK_GAMES = [
        { name: 'Space Invaders', startingDate: '2024-01-01', playersNumber: 4, bestScore: 5000 },
        { name: 'Mystic Quest', startingDate: '2024-02-15', playersNumber: 2, bestScore: 3000 },
        { name: 'Castle Raiders', startingDate: '2024-03-10', playersNumber: 3, bestScore: 4500 },
    ];

    beforeEach(async () => {
        gameRecordService = createStubInstance(GameRecordService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HistoryController],
            providers: [{ provide: GameRecordService, useValue: gameRecordService }],
        }).compile();

        controller = module.get<HistoryController>(HistoryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get all game records', async () => {
        gameRecordService.getGameRecords.resolves(MOCK_GAMES);

        const response = {} as unknown as Response;

        response.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return response;
        };

        response.json = (data) => {
            expect(data).toEqual(MOCK_GAMES);
            return response;
        };

        await controller.getAllGamesRecords(response);
    });

    it('should handle error when getting all game records', async () => {
        gameRecordService.getGameRecords.throws(new Error(ERROR.HISTORY.LIST_FAILED_TO_LOAD));

        const response = {} as unknown as Response;

        response.status = (code) => {
            expect(code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
            return response;
        };
        response.send = (data) => {
            expect(data).toEqual({ message: ERROR.HISTORY.LIST_FAILED_TO_LOAD });
            return response;
        };

        await controller.getAllGamesRecords(response);
    });

    it('should delete all game records', async () => {
        const gameRecords = [];
        gameRecordService.deleteAllGameRecords.resolves(gameRecords);

        const response = {} as unknown as Response;

        response.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return response;
        };
        response.send = (data) => {
            expect(data).toEqual(gameRecords);
            return response;
        };
        await controller.deleteAllGameRecords(response);
    });

    it('should handle error when deleting all game records', async () => {
        gameRecordService.deleteAllGameRecords.throws(new Error(ERROR.HISTORY.FAILED_TO_DELETE));

        const response = {} as unknown as Response;

        response.status = (code) => {
            expect(code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
            return response;
        };
        response.send = (data) => {
            expect(data).toEqual({ message: ERROR.HISTORY.FAILED_TO_DELETE });
            return response;
        };
        await controller.deleteAllGameRecords(response);
    });
});
