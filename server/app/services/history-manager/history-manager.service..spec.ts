import { GameRecordService } from '@app/services/game-record/game-record.service';
import { Test } from '@nestjs/testing';
import { HistoryManagerService } from './history-manager.service';

describe('HistoryManager', () => {
    let historyManager: HistoryManagerService;
    let gameRecordService: GameRecordService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                HistoryManagerService,
                {
                    provide: GameRecordService,
                    useValue: {
                        createGameRecord: jest.fn().mockResolvedValue({}),
                    },
                },
            ],
        }).compile();

        historyManager = moduleRef.get<HistoryManagerService>(HistoryManagerService);
        gameRecordService = moduleRef.get<GameRecordService>(GameRecordService);
    });

    it('should be defined', () => {
        expect(historyManager).toBeDefined();
    });

    describe('addGameRecord', () => {
        it('should add a game record if it does not exist', () => {
            const gameTitle = 'testGame';
            const roomId = 'roomId123';
            historyManager.addGameRecord(gameTitle, roomId);
            expect(historyManager['history'].length).toBe(1);
            expect(historyManager['map'].has(roomId)).toBe(true);
        });

        it('should not add a game record if it already exists', () => {
            const gameTitle = 'testGame';
            const roomId = 'roomId123';
            historyManager.addGameRecord(gameTitle, roomId);
            historyManager.addGameRecord(gameTitle, roomId);
            expect(historyManager['history'].length).toBe(1);
            expect(historyManager['map'].has(roomId)).toBe(true);
        });
    });

    describe('saveGameRecordToDB', () => {
        it('should save the game record to the database', async () => {
            const roomId = 'roomId123';
            const players = [{ name: 'Player 1', points: 100, isInGame: true, noBonusesObtained: 0 }];
            historyManager['map'].set(roomId, {
                name: 'testGame',
                startingDate: new Date().toString(),
                playersNumber: 0,
                bestScore: 0,
            });
            await historyManager.saveGameRecordToDB(roomId, players);
            expect(gameRecordService.createGameRecord).toHaveBeenCalled();
        });
    });

    describe('removeGameRecord', () => {
        it('should remove a game record', () => {
            const roomId = 'roomId123';
            historyManager['map'].set(roomId, {
                name: 'testGame',
                startingDate: new Date().toString(),
                playersNumber: 0,
                bestScore: 0,
            });
            historyManager['history'].push(historyManager['map'].get(roomId));
            historyManager.removeGameRecord(roomId);
            expect(historyManager['history'].length).toBe(0);
            expect(historyManager['map'].has(roomId)).toBe(false);
        });
    });
});
