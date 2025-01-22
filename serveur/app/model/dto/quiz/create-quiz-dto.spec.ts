import { MOCK_QUESTIONS } from '@app/constants/mock-questions';
import { CreateQuizDto } from '@app/model/dto/quiz/create-quiz.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

const NUMBER_OF_ERRORS = 4;

describe('CreateQuizDto', () => {
    it('should validate and pass with correct data', async () => {
        const validData = {
            title: 'Sample Quiz Title',
            description: 'Sample Description',
            duration: 30,
            lastModification: new Date().toString(),
            questions: [MOCK_QUESTIONS[0], MOCK_QUESTIONS[1]],
        };
        const dto = plainToClass(CreateQuizDto, validData);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
    });

    it('should validate and fail with incorrect data', async () => {
        const invalidData = {
            title: '',
            description: '',
            duration: -1,
            lastModification: '',
            questions: [MOCK_QUESTIONS[0], MOCK_QUESTIONS[1]],
        };

        const dto = plainToClass(CreateQuizDto, invalidData);
        const errors = await validate(dto);

        expect(errors.length).toBe(NUMBER_OF_ERRORS);
    });
});
