import { ERROR } from '@app/constants/error-messages';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { UpdateQuestionDto } from '@app/model/dto/question/update-question.dto';
import { Question } from '@app/model/schema/question/question';
import { QuestionService } from '@app/services/question/question.service';
import { ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { QuestionController } from './question.controller';

describe('QuestionController', () => {
    let controller: QuestionController;
    let questionService: SinonStubbedInstance<QuestionService>;

    beforeEach(async () => {
        questionService = createStubInstance(QuestionService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionController],
            providers: [{ provide: QuestionService, useValue: questionService }],
        }).compile();

        controller = module.get<QuestionController>(QuestionController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getAllQuestions() should return all questions in the bank', async () => {
        const fakeQuestions = [new Question(), new Question()];
        questionService.getAllQuestions.resolves(fakeQuestions);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (questions) => {
            expect(questions).toEqual(fakeQuestions);
            return res;
        };

        await controller.getAllQuestions(res);
    });

    it('getAllQuestions() should return NOT_FOUND when service unable to fetch questions', async () => {
        questionService.getAllQuestions.rejects(new NotFoundException(ERROR.QUESTION.LIST_FAILED_TO_LOAD));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUESTION.LIST_FAILED_TO_LOAD });
            return res;
        };
        await controller.getAllQuestions(res);
    });
    it('getAllQuestions() should return INTERNAL_SERVER_ERROR when server cannot treat request', async () => {
        questionService.getAllQuestions.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.INTERNAL_SERVER_ERROR });
            return res;
        };
        await controller.getAllQuestions(res);
    });

    it('getQuestionById() should return a question by its ID', async () => {
        const fakeQuestion = new Question();
        questionService.getQuestionById.resolves(fakeQuestion);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (question) => {
            expect(question).toEqual(fakeQuestion);
            return res;
        };

        await controller.getQuestionById('', res);
    });

    it('getQuestionById() should return NOT_FOUND when service unable to fetch the given question', async () => {
        questionService.getQuestionById.rejects(new NotFoundException(ERROR.QUESTION.ID_NOT_FOUND));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUESTION.ID_NOT_FOUND });
            return res;
        };
        await controller.getQuestionById('', res);
    });
    it('getQuestionById() should return INTERNAL_SERVER_ERROR when service unable to treat request', async () => {
        questionService.getQuestionById.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.INTERNAL_SERVER_ERROR });
            return res;
        };
        await controller.getQuestionById('', res);
    });

    it('createQuestion() should succeed if service able to add the question', async () => {
        const createdQuestion = new Question();

        const updatedQuestions = [createdQuestion];
        questionService.getAllQuestions.resolves(updatedQuestions);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.json = (question) => {
            expect(question).toEqual(updatedQuestions);
            return res;
        };

        await controller.createQuestion(new CreateQuestionDto(), res);
    });

    it('createQuestion() should return NOT_FOUND when service can not add the question', async () => {
        questionService.createQuestion.rejects(new ConflictException(ERROR.QUESTION.ALREADY_EXISTS));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CONFLICT);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUESTION.ALREADY_EXISTS });
            return res;
        };

        await controller.createQuestion(new CreateQuestionDto(), res);
    });
    it('createQuestion() should return INTERNAL_SERVER_ERROR when service can not treat request', async () => {
        questionService.createQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.INTERNAL_SERVER_ERROR });
            return res;
        };

        await controller.createQuestion(new CreateQuestionDto(), res);
    });

    it('updateQuestion() should succeed if service is able to modify the question', async () => {
        const fakeQuestion = new Question();

        const updatedQuestions = [fakeQuestion];
        questionService.getAllQuestions.resolves(updatedQuestions);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (question) => {
            expect(question).toEqual(updatedQuestions);
            return res;
        };

        await controller.updateQuestion('some-id', new UpdateQuestionDto(), res);
    });

    it('updateQuestion() should return NOT_FOUND when service can not find the question', async () => {
        questionService.verifyAndUpdateQuestion.rejects(new NotFoundException(ERROR.QUESTION.ID_NOT_FOUND));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUESTION.ID_NOT_FOUND });
            return res;
        };

        await controller.updateQuestion('some-id', new UpdateQuestionDto(), res);
    });

    it('updateQuestion() should return CONFLICT when question with the same text already exists', async () => {
        questionService.verifyAndUpdateQuestion.rejects(new ConflictException(ERROR.QUESTION.ALREADY_EXISTS));

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CONFLICT);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.QUESTION.ALREADY_EXISTS });
            return res;
        };

        await controller.updateQuestion('some-id', new UpdateQuestionDto(), res);
    });
    it('updateQuestion() should return INTERNAL_SERVER_ERROR when server cannot treat request', async () => {
        questionService.verifyAndUpdateQuestion.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = (response) => {
            expect(response).toEqual({ message: ERROR.INTERNAL_SERVER_ERROR });
            return res;
        };

        await controller.updateQuestion('some-id', new UpdateQuestionDto(), res);
    });

    it('deleteQuestion() should delete the question if service is able to process the request', async () => {
        questionService.deleteQuestionById.resolves();

        const updatedQuestions = [new Question()];
        questionService.getAllQuestions.resolves(updatedQuestions);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual(updatedQuestions);
            return res;
        };
        await controller.deleteQuestion('some-id', res);
    });

    it('deleteQuestion() should return NOT_FOUND when service can not find the question', async () => {
        questionService.deleteQuestionById.rejects({ status: HttpStatus.NOT_FOUND });

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.deleteQuestion('some-id', res);
    });

    it('deleteQuestion() should return INTERNAL_SERVER_ERROR when service fails to process the request', async () => {
        questionService.deleteQuestionById.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;
        await controller.deleteQuestion('some-id', res);
    });

    it('validateQuestionChoices() should return true if verifyAnswers does', async () => {
        const fakeQuiz = new Question();
        questionService.verifyAnswers.resolves(true);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual(true);
            return res;
        };

        await controller.validateQuestionChoices(fakeQuiz, res);
    });
    it('validateQuestionChoices() should return false if verifyAnswers does', async () => {
        const fakeQuiz = new Question();
        questionService.verifyAnswers.resolves(false);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual(false);
            return res;
        };

        await controller.validateQuestionChoices(fakeQuiz, res);
    });
    it('validateQuestionChoices() should return INTERNAL_SERVER_ERROR if server cannot rreat request', async () => {
        const fakeQuiz = new Question();
        questionService.verifyAnswers.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => res;

        await controller.validateQuestionChoices(fakeQuiz, res);
    });
});
