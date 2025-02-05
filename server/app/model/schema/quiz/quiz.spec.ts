import mongoose from 'mongoose';
import { quizSchema } from './quiz';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QuizModel = mongoose.model('Quiz', quizSchema); // Respecter la convention de nommer les classes en UpperCamelCase

describe('Quiz Model', () => {
    it('should have title, description, lastModification, and duration as required fields', async () => {
        expect(quizSchema.paths.title.isRequired).toBeTruthy();
        expect(quizSchema.paths.description.isRequired).toBeTruthy();
        expect(quizSchema.paths.lastModification.isRequired).toBeTruthy();
        expect(quizSchema.paths.duration.isRequired).toBeTruthy();
    });

    it('should transform document correctly on toJSON', () => {
        const quizDocument = new QuizModel({
            title: 'General Knowledge Quiz',
            description: 'A quiz to test your general knowledge',
            lastModification: '2023-01-01',
            duration: 30,
            questions: [
                {
                    type: 'multiple-choice',
                    text: 'What is 2 + 2?',
                    points: 1,
                    choices: [{ text: '4', isCorrect: true }],
                },
            ],
            visibility: true,
        });

        const serializedDocument = quizDocument.toJSON();
        // eslint-disable-next-line no-underscore-dangle
        expect(serializedDocument._id).toBeUndefined(); // Mongo utilise des attributs avec un underscore
    });
});
