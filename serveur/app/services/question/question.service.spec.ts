/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { ERROR } from '@app/constants/error-messages';
import { MOCK_QUESTIONS } from '@app/constants/mock-questions';
import { SUCCESS } from '@app/constants/success-messages';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { UpdateQuestionDto } from '@app/model/dto/question/update-question.dto';
import { Question, QuestionDocument, questionSchema } from '@app/model/schema/question/question';
import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model, Types } from 'mongoose';
import { QuestionService } from './question.service';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/constants/mongo-constants';

describe('QuestionServiceEndToEnd', () => {
    let service: QuestionService;
    let questionModel: Model<QuestionDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    const mockLogger = {
        log: jest.fn(),
        error: jest.fn(),
    };

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
            ],
            providers: [QuestionService, { provide: Logger, useValue: mockLogger }],
        }).compile();

        service = module.get<QuestionService>(QuestionService);
        questionModel = module.get<Model<QuestionDocument>>(getModelToken(Question.name));
        connection = await module.get(getConnectionToken());
        jest.restoreAllMocks();
        await questionModel.deleteMany({}).exec();
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

    it('start() should populate the database when there is no data', async () => {
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        questionModel.countDocuments = jest.fn().mockImplementation(() => 0);
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('start() should not populate the DB when there is some data', async () => {
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        questionModel.countDocuments = jest.fn().mockImplementation(() => 1);
        await service.start();
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });

    it('populateDB() should log the error if mongo query failed', async () => {
        jest.spyOn(questionModel, 'insertMany').mockImplementation(async () => {
            throw new Error(ERROR.QUESTION.LIST_FAILED_TO_LOAD);
        });
        await service.populateDB();
        expect(mockLogger.error).toHaveBeenCalledWith(ERROR.QUESTION.FAILED_TO_INSERT, expect.any(Error));
    });

    it('populateDB() should add questions', async () => {
        questionModel.insertMany = jest.fn().mockResolvedValue(true);
        await service.populateDB();
        expect(questionModel.insertMany).toHaveBeenCalledWith(expect.any(Array));
        expect(mockLogger.log).toHaveBeenCalledWith(SUCCESS.QUESTION_INSERTION);
    });

    it('getAllQuestions() return all questions in database', async () => {
        const mockQuestions = [new Question(), new Question()];

        questionModel.find = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockQuestions),
        });
        const questions = await service.getAllQuestions();

        expect(questions).toEqual(mockQuestions);
        expect(questionModel.find).toHaveBeenCalled();
    });

    it('getAllQuestions() should throw an error if fetch failed', async () => {
        questionModel.find = jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new NotFoundException(ERROR.QUESTION.LIST_FAILED_TO_LOAD)),
        });

        await expect(service.getAllQuestions()).rejects.toThrow(ERROR.QUESTION.LIST_FAILED_TO_LOAD);

        expect(questionModel.find).toHaveBeenCalled();
    });

    it('getQuestionById() returns correct question', async () => {
        const mockQuestion = getFakeQuestion();

        questionModel.findById = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ ...mockQuestion }),
        });

        const question = await service.getQuestionById('id');

        expect(questionModel.findById).toHaveBeenCalledWith('id');
        expect(question).toEqual(mockQuestion);
    });

    it('getQuestionById() should return an error if question is not found', async () => {
        questionModel.findById = jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new ConflictException()),
        });
        await expect(service.getQuestionById('nonExistentId')).rejects.toThrow(NotFoundException);
    });

    it('createQuestion() successfully creates a new quiz if it does not already exist', async () => {
        service['findQuestionByText'] = jest.fn().mockResolvedValue(null);

        const mockCreateQuestionDto = getFakeDTOQuestion();
        const mockCreatedQuestion = getFakeQuestion();
        jest.spyOn(questionModel.prototype, 'save').mockResolvedValue(mockCreatedQuestion);

        const result = await service.createQuestion(mockCreateQuestionDto);

        expect(result).toEqual(mockCreatedQuestion);
    });

    it('createQuestion() should not create a new question if it already exists', async () => {
        const existingQuestion = getFakeQuestion();
        service['findQuestionByText'] = jest.fn().mockResolvedValue(existingQuestion);
        const sameQuestionDTO = getFakeDTOQuestion();

        await expect(service.createQuestion(sameQuestionDTO)).rejects.toThrow(ConflictException);

        jest.spyOn(questionModel, 'create').mockImplementation(async () => Promise.resolve(null));
        expect(questionModel.create).not.toHaveBeenCalled();
    });

    it('verifyAndUpdateQuestion() should correctly update the question if the text is different.', async () => {
        const differentQuestion = getFakeDifferentUpdateQuestion();
        const diffQuestionWithId = { ...differentQuestion, _id: new mongoose.Types.ObjectId().toString() };

        service['findQuestionByText'] = jest.fn().mockResolvedValue(null);

        await expect(service.verifyAndUpdateQuestion(diffQuestionWithId._id, diffQuestionWithId)).resolves.toBeDefined();
    });

    it('findQuestionByText() correctly finds the question by its text', async () => {
        const mockQuestion = getFakeQuestion();
        questionModel.findOne = jest.fn().mockResolvedValue(mockQuestion);

        const result = await service['findQuestionByText']('Quelle est la capitale de la France ?');
        expect(result).toEqual(mockQuestion);
        expect(questionModel.findOne).toHaveBeenCalled();
    });

    it('verifyAndUpdateQuestion() should not update the question if the text is the same.', async () => {
        const question = getFakeQuestion();
        const questionWithId = { ...question, _id: new mongoose.Types.ObjectId().toString() };
        service['findQuestionByText'] = jest.fn().mockResolvedValue(questionWithId);

        const sameQuestion = getFakeSameUpdateQuestion();

        await expect(service.verifyAndUpdateQuestion('same-id', sameQuestion)).rejects.toThrow(ERROR.QUESTION.ALREADY_EXISTS);
    });

    it('updateQuestion() should raise an error if findByIdAndUpdate() fails', async () => {
        jest.spyOn(questionModel, 'findByIdAndUpdate').mockImplementationOnce(() => {
            throw new Error('No question found with the given ID.');
        });
        const id = new Types.ObjectId().toString();
        const updateData = { text: 'Updated question text' };

        await expect(service['updateQuestion'](id, updateData)).rejects.toThrow(ERROR.QUESTION.ID_NOT_FOUND);
        expect(mockLogger.error).toHaveBeenCalledWith(ERROR.QUESTION.FAILED_TO_UPDATE, expect.any(Error));
    });

    it('deleteQuestionById() should remove the question from the collection if it exists.', async () => {
        questionModel.deleteOne = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        });

        await service.deleteQuestionById('id-to-delete');

        expect(questionModel.deleteOne).toHaveBeenCalledWith({ _id: 'id-to-delete' });
    });

    it('deleteQuestionById() should raise a NotFoundException if a question which does not exist is deleted.', async () => {
        const invalidId = '1234';
        await expect(service.deleteQuestionById(invalidId)).rejects.toThrow(NotFoundException);
    });

    it('verifyAnswers() should return true if the question follows the expected format', async () => {
        const question = getFakeQuestion();
        service['choiceVerifier'] = jest.fn().mockReturnValue(true);
        const result = await service.verifyAnswers(question);
        expect(result).toBe(true);
    });
    it('verifyAnswers() should return false if the question is not QCM type', async () => {
        const question = getFakeQuestion();
        question.type = 'other';
        service['choiceVerifier'] = jest.fn().mockReturnValue(true);
        const result = await service.verifyAnswers(question);
        expect(result).toBe(false);
    });

    it('choiceVerifier() should return false if there are no choices', () => {
        const choicesTest = [];
        expect(service['choiceVerifier'](choicesTest)).toBe(false);
    });
    it('choiceVerifier() should return true if all correct choices are selected', () => {
        const choicesTest = [
            { text: 'Choice 1', isCorrect: true, isSelected: true },
            { text: 'Choice 2', isCorrect: false, isSelected: false },
        ];
        expect(service['choiceVerifier'](choicesTest)).toBe(true);
    });

    it('choiceVerifier() should return false if not all correct choices are selected', () => {
        const choicesTest = [
            { text: 'Choice 1', isCorrect: true, isSelected: false },
            { text: 'Choice 2', isCorrect: false, isSelected: false },
        ];
        expect(service['choiceVerifier'](choicesTest)).toBe(false);
    });
    it('choiceVerifier() should return false if false answer is chosen', () => {
        const choicesTest = [
            { text: 'Choice 1', isCorrect: false, isSelected: true },
            { text: 'Choice 2', isCorrect: false, isSelected: false },
        ];
        expect(service['choiceVerifier'](choicesTest)).toBe(false);
    });

    const getFakeQuestion = () => {
        return MOCK_QUESTIONS[0] as Question;
    };

    const getFakeDTOQuestion = () => {
        return MOCK_QUESTIONS[0] as CreateQuestionDto;
    };

    const getFakeSameUpdateQuestion = () => {
        return MOCK_QUESTIONS[0] as UpdateQuestionDto;
    };

    const getFakeDifferentUpdateQuestion = (): UpdateQuestionDto => {
        return MOCK_QUESTIONS[1] as UpdateQuestionDto;
    };
});
