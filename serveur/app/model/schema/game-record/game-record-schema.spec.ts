import mongoose from 'mongoose';
import { gameRecordSchema } from './game-record-schema';
// eslint-disable-next-line @typescript-eslint/naming-convention
const GameRecordModel = mongoose.model('GameRecord', gameRecordSchema); // Pour respecter la convention de nommer une classe en UpperCamelCase

describe('GameRecord Model', () => {
    it('should have name, startingDate, playersNumber, and bestScore as required fields', async () => {
        expect(gameRecordSchema.paths.name.isRequired).toBeTruthy();
        expect(gameRecordSchema.paths.startingDate.isRequired).toBeTruthy();
        expect(gameRecordSchema.paths.playersNumber.isRequired).toBeTruthy();
        expect(gameRecordSchema.paths.bestScore.isRequired).toBeTruthy();
    });

    it('should transform document correctly on toJSON', () => {
        const gameRecordDocument = new GameRecordModel({
            name: 'Tetris',
            startingDate: '1984-06-06 00:00:00',
            playersNumber: 1,
            bestScore: 999999,
        });
        const serializedDocument = gameRecordDocument.toJSON();
        // eslint-disable-next-line no-underscore-dangle
        expect(serializedDocument._id).toBeUndefined();
        // ID de mongoDB genere un underscore
    });
});
