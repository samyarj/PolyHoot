import { ERROR } from '@app/constants/error-messages';
import { CreateQuizDto } from '@app/model/dto/quiz/create-quiz.dto';
import { UpdateQuizDto } from '@app/model/dto/quiz/update-quiz.dto';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { QuizService } from '@app/services/quiz/quiz.service';
import { BadRequestException, ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { QuizController } from './quiz.controller';

describe('QuizController', () => {
    let controller: QuizController;
    let quizService: SinonStubbedInstance<QuizService>;

    beforeEach(async () => {
        quizService = createStubInstance(QuizService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuizController],
            providers: [{ provide: QuizService, useValue: quizService }],
        }).compile();

        controller = module.get<QuizController>(QuizController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getAllQuizzes() should return all quizzes', async () => {
        const fakeQuizzes = [new Quiz(), new Quiz()];
        quizService.getAllQuizzes.resolves(fakeQuizzes);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (questions) => {
            expect(questions).toEqual(fakeQuizzes);
            return res;
        };

        await controller.getAllQuizzes(res);
    });

    it('getAllQuizzes() should return NOT_FOUND when service is unable to fetch quizzes', async () => {
        quizService.getAllQuizzes.rejects(new NotFoundException(ERROR.QUIZ.LIST_FAILED_TO_LOAD));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUIZ.LIST_FAILED_TO_LOAD });
            return res;
        };
        await controller.getAllQuizzes(res);
    });
    it('getAllQuizzes() should return INTERNAL_SERVER_ERROR when service could not treat request', async () => {
        quizService.getAllQuizzes.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.INTERNAL_SERVER_ERROR });
            return res;
        };
        await controller.getAllQuizzes(res);
    });

    it('getQuizById() should return a quiz by its ID', async () => {
        const fakeQuestion = new Quiz();
        quizService.getQuizById.resolves(fakeQuestion);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (question) => {
            expect(question).toEqual(fakeQuestion);
            return res;
        };

        await controller.getQuizById('', res);
    });

    it('getQuizById() should return NOT_FOUND when service unable to fetch the given quiz', async () => {
        quizService.getQuizById.rejects(new NotFoundException(ERROR.QUIZ.ID_NOT_FOUND));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUIZ.ID_NOT_FOUND });
            return res;
        };
        await controller.getQuizById('', res);
    });

    it('getQuizById() should return INTERNAL_SERVER_ERROR when service could not treat the request', async () => {
        quizService.getQuizById.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.INTERNAL_SERVER_ERROR });
            return res;
        };
        await controller.getQuizById('', res);
    });

    it('createQuiz() should succeed if service able to add the quiz', async () => {
        const createdQuiz = new Quiz();
        quizService.createQuiz.resolves(createdQuiz);

        const updatedQuizzes = [createdQuiz];
        quizService.getAllQuizzes.resolves(updatedQuizzes);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.json = (question) => {
            expect(question).toEqual(updatedQuizzes);
            return res;
        };

        await controller.createQuiz(new CreateQuizDto(), res);
    });

    it('createQuiz() should return CONFLICT when quiz with same title already exists', async () => {
        quizService.createQuiz.rejects(new ConflictException(ERROR.QUIZ.ALREADY_EXISTS));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CONFLICT);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUIZ.ALREADY_EXISTS });
            return res;
        };

        await controller.createQuiz(new CreateQuizDto(), res);
    });
    it('createQuiz() should return INTERNAL_SERVER_ERROR when server could not treat request', async () => {
        quizService.createQuiz.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.INTERNAL_SERVER_ERROR });
            return res;
        };

        await controller.createQuiz(new CreateQuizDto(), res);
    });

    it('updateQuiz() should succeed if service is able to modify the quiz', async () => {
        const createdQuiz = new Quiz();
        quizService.verifyAndUpdateQuiz.resolves(createdQuiz);

        const updatedQuizzes = [createdQuiz];
        quizService.getAllQuizzes.resolves(updatedQuizzes);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (question) => {
            expect(question).toEqual(updatedQuizzes);
            return res;
        };

        await controller.updateQuiz('some-id', new UpdateQuizDto(), res);
    });

    it('updateQuiz() should create quiz if it does not exist and return all quizzes', async () => {
        quizService.verifyAndUpdateQuiz.resolves();

        const updatedQuizzes = [new Quiz(), new Quiz()];
        quizService.getAllQuizzes.resolves(updatedQuizzes);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (quiz) => {
            expect(quiz).toEqual(updatedQuizzes);
            return res;
        };

        await controller.updateQuiz('some-id', new UpdateQuizDto(), res);
    });

    it('updateQuiz() should return CONFLICT when quiz with the same title already exists', async () => {
        quizService.verifyAndUpdateQuiz.rejects(new ConflictException(ERROR.QUIZ.ALREADY_EXISTS));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CONFLICT);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUIZ.ALREADY_EXISTS });
            return res;
        };

        await controller.updateQuiz('some-id', new UpdateQuizDto(), res);
    });
    it('updateQuiz() should return BAD_REQUEST when there was an error creating the new quiz', async () => {
        quizService.verifyAndUpdateQuiz.rejects(new BadRequestException(ERROR.QUIZ.ALREADY_EXISTS));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUIZ.ALREADY_EXISTS });
            return res;
        };

        await controller.updateQuiz('some-id', new UpdateQuizDto(), res);
    });

    it('updateQuiz() should return INTERNAL_SERVER_ERROR if server could not treat the request', async () => {
        quizService.verifyAndUpdateQuiz.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.updateQuiz('some-id', new UpdateQuizDto(), res);
    });

    it('deleteQuiz() should delete the question if service is able to process the request', async () => {
        quizService.deleteQuizById.resolves();

        const updatedQuizzes = [new Quiz()];
        quizService.getAllQuizzes.resolves(updatedQuizzes);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual(updatedQuizzes);
            return res;
        };
        await controller.deleteQuiz('some-id', res);
    });

    it('deleteQuiz() should return NOT_FOUND when service can not find the quiz', async () => {
        quizService.deleteQuizById.rejects({ status: HttpStatus.NOT_FOUND });

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.deleteQuiz('some-id', res);
    });

    it('deleteQuiz() should return INTERNAL_SERVER_ERROR when service fails to process the request', async () => {
        quizService.deleteQuizById.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;
        await controller.deleteQuiz('some-id', res);
    });
    it('toggleQuizVisibility() should successfully toggle visibility and return updated quizzes', async () => {
        quizService.toggleQuizVisibility.resolves();

        const updatedQuizzes = [new Quiz(), new Quiz()];
        quizService.getAllQuizzes.resolves(updatedQuizzes);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual(updatedQuizzes);
            return res;
        };

        await controller.toggleQuizVisibility('some-id', res);
    });
    it('toggleQuizVisibility() should return NOT_FOUND if quiz is not found in database', async () => {
        quizService.toggleQuizVisibility.rejects({ status: HttpStatus.NOT_FOUND });

        const updatedQuizzes = [new Quiz(), new Quiz()];
        quizService.getAllQuizzes.resolves(updatedQuizzes);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.toggleQuizVisibility('some-id', res);
    });
    it('toggleQuizVisibility() should return INTERNAL_SERVER_ERROR if server can not treat request', async () => {
        quizService.toggleQuizVisibility.rejects();

        const updatedQuizzes = [new Quiz(), new Quiz()];
        quizService.getAllQuizzes.resolves(updatedQuizzes);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.toggleQuizVisibility('some-id', res);
    });
});
