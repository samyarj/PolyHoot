import { ERROR } from '@app/constants/error-messages';
import { CreateQuizDto } from '@app/model/dto/quiz/create-quiz.dto';
import { UpdateQuizDto } from '@app/model/dto/quiz/update-quiz.dto';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @ApiOkResponse({
        description: 'Returns all quizzes',
        type: Quiz,
        isArray: true,
    })
    @Get()
    async getAllQuizzes(@Res() response: Response) {
        try {
            const quizzes = await this.quizService.getAllQuizzes();
            response.status(HttpStatus.OK).json(quizzes);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({
        description: 'Get quiz by ID',
        type: Quiz,
    })
    @Get('/:id')
    async getQuizById(@Param('id') id: string, @Res() response: Response) {
        try {
            const quiz = await this.quizService.getQuizById(id);
            response.status(HttpStatus.OK).json(quiz);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiCreatedResponse({
        description: 'Create a new quiz',
        type: Quiz,
    })
    @Post('/create')
    async createQuiz(@Body() createQuizDto: CreateQuizDto, @Res() response: Response) {
        try {
            await this.quizService.createQuiz(createQuizDto);
            const updatedQuizzes = await this.quizService.getAllQuizzes();
            response.status(HttpStatus.CREATED).json(updatedQuizzes);
        } catch (error) {
            if (error.status === HttpStatus.CONFLICT) {
                response.status(HttpStatus.CONFLICT).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({ description: 'Quiz successfully updated' })
    @ApiNotFoundResponse({ description: 'Quiz not found' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @Patch('/update/:id')
    async updateQuiz(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto, @Res() response: Response) {
        try {
            await this.quizService.verifyAndUpdateQuiz(id, updateQuizDto);
            const updatedQuizzes = await this.quizService.getAllQuizzes();
            response.status(HttpStatus.OK).json(updatedQuizzes);
        } catch (error) {
            if (error.status === HttpStatus.CONFLICT) {
                response.status(HttpStatus.CONFLICT).send({ message: error.message });
            } else if (error.status === HttpStatus.BAD_REQUEST) {
                response.status(HttpStatus.BAD_REQUEST).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({
        description: 'Quiz successfully deleted',
    })
    @ApiNotFoundResponse({
        description: 'Quiz not found',
    })
    @Delete('/delete/:id')
    async deleteQuiz(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.quizService.deleteQuizById(id);
            const updatedQuizzes = await this.quizService.getAllQuizzes();
            response.status(HttpStatus.OK).json(updatedQuizzes);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({ description: 'Quiz visibility toggled' })
    @ApiNotFoundResponse({ description: 'Quiz not found' })
    @Patch('/toggle-visibility/:id')
    async toggleQuizVisibility(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.quizService.toggleQuizVisibility(id);
            const updatedQuizzes = await this.quizService.getAllQuizzes();
            response.status(HttpStatus.OK).json(updatedQuizzes);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }
}
