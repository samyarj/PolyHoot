/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { ERROR } from '@app/constants/error-messages';
import { MOCK_QUIZZES } from '@app/constants/mock-quizzes';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/constants/mongo-constants';
import { SUCCESS } from '@app/constants/success-messages';
import { CreateQuizDto } from '@app/model/dto/quiz/create-quiz.dto';
import { UpdateQuizDto } from '@app/model/dto/quiz/update-quiz.dto';
import { Quiz, QuizDocument, quizSchema } from '@app/model/schema/quiz/quiz';
import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model } from 'mongoose';
import { QuizService } from './quiz.service';

describe('QuizServiceEndToEnd', () => {
    let service: QuizService;
    let quizModel: Model<QuizDocument>;
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
                MongooseModule.forFeature([{ name: Quiz.name, schema: quizSchema }]),
            ],
            providers: [QuizService, { provide: Logger, useValue: mockLogger }],
        }).compile();

        service = module.get<QuizService>(QuizService);
        quizModel = module.get<Model<QuizDocument>>(getModelToken(Quiz.name));
        connection = await module.get(getConnectionToken());
        jest.restoreAllMocks();
        await quizModel.deleteMany({}).exec();
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
        quizModel.countDocuments = jest.fn().mockImplementation(() => 0);
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('start() should not populate the DB when there is some data', async () => {
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        quizModel.countDocuments = jest.fn().mockImplementation(() => 1);
        await service.start();
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });

    it('populateDB() should log the error if mongo query failed', async () => {
        jest.spyOn(quizModel, 'insertMany').mockImplementation(async () => {
            throw new Error('Mock database insertion error');
        });
        await service.populateDB();
        expect(mockLogger.error).toHaveBeenCalledWith(ERROR.QUIZ.FAILED_TO_INSERT, expect.any(Error));
    });

    it('populateDB() should add quizzes', async () => {
        quizModel.insertMany = jest.fn().mockResolvedValue(true);
        await service.populateDB();
        expect(quizModel.insertMany).toHaveBeenCalledWith(expect.any(Array));
        expect(mockLogger.log).toHaveBeenCalledWith(SUCCESS.QUIZ_INSERTION);
    });

    it('getAllQuizzes() return all quizzes in database', async () => {
        const mockQuizzes = [new Quiz(), new Quiz()];

        quizModel.find = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockQuizzes),
        });
        const quizzes = await service.getAllQuizzes();

        expect(quizzes).toEqual(mockQuizzes);
        expect(quizModel.find).toHaveBeenCalled();
    });

    it('getAllQuizzes() should throw an error if fetch failed', async () => {
        quizModel.find = jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new NotFoundException(ERROR.QUIZ.LIST_FAILED_TO_LOAD)),
        });

        await expect(service.getAllQuizzes()).rejects.toThrow(ERROR.QUIZ.LIST_FAILED_TO_LOAD);

        expect(quizModel.find).toHaveBeenCalled();
    });

    it('getQuizById() returns correct question', async () => {
        const mockQuiz = getFakeQuiz();

        quizModel.findById = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ ...mockQuiz }),
        });

        const quiz = await service.getQuizById('id');

        expect(quizModel.findById).toHaveBeenCalledWith('id');
        expect(quiz).toEqual(mockQuiz);
    });
    it('getQuizById() should return an error if quiz is not found', async () => {
        quizModel.findById = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
        });
        await expect(service.getQuizById('nonExistentId')).rejects.toThrow(NotFoundException);
    });

    it('createQuiz() successfully creates a new quiz if it does not already exist', async () => {
        service['findQuizByTitle'] = jest.fn().mockResolvedValue(null);

        const mockCreateQuizDto = getFakeDTOQuiz();
        const mockCreatedQuiz = getFakeQuiz();
        jest.spyOn(quizModel.prototype, 'save').mockResolvedValue(mockCreatedQuiz);

        const result = await service.createQuiz(mockCreateQuizDto);

        expect(result).toEqual(mockCreatedQuiz);
    });

    it('findQuizByTitle() correctly finds the quiz by its title', async () => {
        const mockQuiz = getFakeQuiz();
        quizModel.findOne = jest.fn().mockResolvedValue(mockQuiz);

        const result = await service['findQuizByTitle']('Quiz on HTML');
        expect(result).toEqual(mockQuiz);
        expect(quizModel.findOne).toHaveBeenCalled();
    });

    it('createQuiz() should not create a new question if it already exists', async () => {
        const existingQuiz = getFakeQuiz();
        service['findQuizByTitle'] = jest.fn().mockResolvedValue(existingQuiz);
        const sameQuizDTO = getFakeDTOQuiz();

        await expect(service.createQuiz(sameQuizDTO)).rejects.toThrow(ConflictException);

        jest.spyOn(quizModel, 'create').mockImplementation(async () => Promise.resolve(null));
        expect(quizModel.create).not.toHaveBeenCalled();
    });

    it('verifyAndUpdateQuiz() should correctly update the question if the text is different.', async () => {
        const differentQuiz = getFakeDifferentUpdateQuiz();
        const diffQuizWithID = { ...differentQuiz, _id: new mongoose.Types.ObjectId().toString() };

        service['findQuizByTitle'] = jest.fn().mockResolvedValue(null);

        await expect(service.verifyAndUpdateQuiz(diffQuizWithID._id, diffQuizWithID)).resolves.toBeDefined();
    });

    it('verifyAndUpdateQuiz() should not update the quiz if the title is the same.', async () => {
        const quiz = getFakeQuiz();
        const quizWithId = { ...quiz, _id: new mongoose.Types.ObjectId().toString() };
        service['findQuizByTitle'] = jest.fn().mockResolvedValue(quizWithId);

        const sameQuiz = getFakeSameUpdateQuiz();

        await expect(service.verifyAndUpdateQuiz('same-id', sameQuiz)).rejects.toThrow(ERROR.QUIZ.ALREADY_EXISTS);
    });

    it('should create a new quiz if user tries to update a non-existing one', async () => {
        quizModel.findById = jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(null),
        }));
        jest.spyOn(service, 'createQuiz').mockImplementation();
        const id = 'id-not-in-DB';
        const updateData = getFakeDifferentUpdateQuiz();

        await service['updateQuiz'](id, updateData);
        expect(service.createQuiz).toHaveBeenCalled();
    });

    it('should correctly update the quiz', async () => {
        const fakeQuiz = getFakeQuiz();
        const quizWithId = { ...fakeQuiz, _id: new mongoose.Types.ObjectId().toString() };
        quizModel.findById = jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(quizWithId),
        }));
        const updateData = getFakeSameUpdateQuiz();

        jest.spyOn(quizModel, 'findByIdAndUpdate');

        await service['updateQuiz'](quizWithId._id, updateData);
        expect(quizModel.findByIdAndUpdate).toHaveBeenCalledWith(quizWithId._id, updateData, { new: true });
    });

    it('updateQuiz() should throw an error if findById fails', async () => {
        const fakeQuiz = getFakeQuiz();
        const quizWithId = { ...fakeQuiz, _id: new mongoose.Types.ObjectId().toString() };
        quizModel.findById = jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(quizWithId),
        }));
        quizModel.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockRejectedValue(new Error('Update error')),
        }));
        const updateData = getFakeSameUpdateQuiz();

        await expect(service['updateQuiz'](quizWithId._id, updateData)).rejects.toThrow(NotFoundException);
    });

    it('updateQuiz() should throw an error if create quiz fails during creation of new one', async () => {
        const fakeQuiz = getFakeQuiz();
        const quizWithId = { ...fakeQuiz, _id: new mongoose.Types.ObjectId().toString() };
        quizModel.findById = jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(null),
        }));

        service.createQuiz = jest.fn().mockImplementation(() => {
            throw new Error(ERROR.QUIZ.FAILED_TO_CREATE);
        });

        const updateData = getFakeDTOQuiz();

        await expect(service['updateQuiz'](quizWithId._id, updateData)).rejects.toThrow(ERROR.QUIZ.FAILED_TO_CREATE);
    });

    it('deleteQuizById() should remove the quiz from the collection if it exists.', async () => {
        quizModel.deleteOne = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        });

        await service.deleteQuizById('id-to-delete');

        expect(quizModel.deleteOne).toHaveBeenCalledWith({ _id: 'id-to-delete' });
    });

    it('deleteQuizById() should raise an error if a quiz which does not exist is deleted.', async () => {
        const invalidId = '1234';
        await expect(service.deleteQuizById(invalidId)).rejects.toThrow();
    });

    it('toggleQuizVisibility() successfully toggles visibility', async () => {
        const mockQuiz = getFakeQuiz();
        const fakeID = new mongoose.Types.ObjectId();

        quizModel.findByIdAndUpdate = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
                ...mockQuiz,
                _id: fakeID,
                visibility: true,
            }),
        });

        await service.toggleQuizVisibility(fakeID.toString());

        expect(quizModel.findByIdAndUpdate).toHaveBeenCalledWith(fakeID.toString(), [{ $set: { visibility: { $not: '$visibility' } } }], {
            new: true,
        });
    });
    it('toggleQuizVisibility() throws an error if ID is not found', async () => {
        quizModel.findByIdAndUpdate = jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
        });

        await expect(service.toggleQuizVisibility('nonExistentId')).rejects.toThrow(NotFoundException);
    });

    const getFakeQuiz = () => {
        return MOCK_QUIZZES[0] as Quiz;
    };
    const getFakeDTOQuiz = () => {
        return MOCK_QUIZZES[0] as CreateQuizDto;
    };

    const getFakeSameUpdateQuiz = () => {
        return MOCK_QUIZZES[0] as UpdateQuizDto;
    };

    const getFakeDifferentUpdateQuiz = () => {
        return MOCK_QUIZZES[1] as UpdateQuizDto;
    };
});
