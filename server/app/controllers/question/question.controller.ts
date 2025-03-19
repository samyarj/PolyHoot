import { ERROR } from '@app/constants/error-messages';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { UpdateQuestionDto } from '@app/model/dto/question/update-question.dto';
import { Question } from '@app/model/schema/question/question';
import { QuestionService } from '@app/services/question/question.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @ApiOkResponse({
        description: 'Returns all questions',
        type: Question,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get()
    async getAllQuestions(@Res() response: Response) {
        try {
            const questions = await this.questionService.getAllQuestions();
            response.status(HttpStatus.OK).json(questions);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({
        description: 'Get question by ID',
        type: Question,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:id')
    async getQuestionById(@Param('id') id: string, @Res() response: Response) {
        try {
            const question = await this.questionService.getQuestionById(id);
            response.status(HttpStatus.OK).json(question);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiCreatedResponse({
        description: 'Create a new question',
        type: Question,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/create')
    async createQuestion(@Body() createQuestionDto: CreateQuestionDto, @Res() response: Response) {
        try {
            await this.questionService.createQuestion(createQuestionDto);
            const updatedQuestions = await this.questionService.getAllQuestions();
            console.log(updatedQuestions.filter((question) => question.text === createQuestionDto.text));
            response.status(HttpStatus.CREATED).json(updatedQuestions);
        } catch (error) {
            if (error.status === HttpStatus.CONFLICT) {
                response.status(HttpStatus.CONFLICT).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({ description: 'Question successfully updated' })
    @ApiNotFoundResponse({ description: 'Question not found' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @Patch('/update/:id')
    async updateQuestion(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto, @Res() response: Response) {
        try {
            await this.questionService.verifyAndUpdateQuestion(id, updateQuestionDto);
            const updatedQuestions = await this.questionService.getAllQuestions();
            response.status(HttpStatus.OK).json(updatedQuestions);
        } catch (error) {
            if (error.status === HttpStatus.CONFLICT) {
                response.status(HttpStatus.CONFLICT).send({ message: error.message });
            } else if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({
        description: 'Question successfully deleted',
    })
    @ApiNotFoundResponse({
        description: 'Question not found',
    })
    @Delete('/delete/:id')
    async deleteQuestion(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.questionService.deleteQuestionById(id);
            const updatedQuestions = await this.questionService.getAllQuestions();
            response.status(HttpStatus.OK).json(updatedQuestions);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }
    @Post('/validate-answers')
    async validateQuestionChoices(@Body() question: Question, @Res() response: Response) {
        try {
            const correct = await this.questionService.verifyAnswers(question);
            response.status(HttpStatus.OK).json(correct);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
        }
    }
}
