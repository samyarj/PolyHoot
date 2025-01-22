import mongoose from 'mongoose';
import { questionSchema } from './question';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QuestionModel = mongoose.model('Question', questionSchema); // Pour respecter la convention de nommer une classe en UpperCamelCase

describe('Question Model', () => {
    it('should have text, type, and points as required fields', async () => {
        expect(questionSchema.paths.text.isRequired).toBeTruthy();
        expect(questionSchema.paths.type.isRequired).toBeTruthy();
        expect(questionSchema.paths.points.isRequired).toBeTruthy();
    });

    it('should transform document correctly on toJSON', () => {
        const questionDocument = new QuestionModel({
            type: 'multiple-choice',
            text: 'What is 2 + 2?',
            points: 1,
            choices: [{ text: '4', isCorrect: true }],
            lastModified: '09/11/2001',
        });
        const serializedDocument = questionDocument.toJSON();
        // eslint-disable-next-line no-underscore-dangle
        expect(serializedDocument._id).toBeUndefined(); // ID de mongoDB genere un underscore
    });
});
