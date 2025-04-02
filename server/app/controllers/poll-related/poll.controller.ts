import { ERROR } from '@app/constants/error-messages';
import { CreatePollDto } from '@app/model/dto/poll/create-poll.dto';
import { UpdatePollDto } from '@app/model/dto/poll/update-poll.dto';
import { Poll } from '@app/model/schema/poll/poll';
import { PublishedPoll } from '@app/model/schema/poll/published-poll.schema';
import { PollService } from '@app/services/poll/poll.service';
import { PublishedPollService } from '@app/services/poll/published-poll.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Polls')
@Controller('polls')
export class PollController {
    constructor(
        private readonly pollService: PollService,
        private readonly publishedPollService: PublishedPollService,
    ) {}

    @ApiOkResponse({
        description: 'Get poll by ID',
        type: Poll,
    })
    @Get('/:id')
    async getPollById(@Param('id') id: string, @Res() response: Response) {
        try {
            const poll = await this.pollService.getPollById(id);
            response.status(HttpStatus.OK).json(poll);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiCreatedResponse({
        description: 'Create a new poll',
        type: Poll,
    })
    @Post('/create')
    async createPoll(@Body() createPollDto: CreatePollDto, @Res() response: Response) {
        try {
            await this.pollService.createPoll(createPollDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            if (error.status === HttpStatus.CONFLICT) {
                response.status(HttpStatus.CONFLICT).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({ description: 'Poll successfully updated' })
    @ApiNotFoundResponse({ description: 'Poll not found' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @Patch('/update/:id')
    async updatePoll(@Param('id') id: string, @Body() updatePollDto: UpdatePollDto, @Res() response: Response) {
        try {
            await this.pollService.updatePoll(id, updatePollDto);
            response.status(HttpStatus.OK).send();
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
        description: 'Poll published successfully',
        type: PublishedPoll,
    })
    @ApiNotFoundResponse({
        description: 'Poll not found or could not be published',
    })
    @Patch('/publish')
    async publishPoll(@Body() poll: Poll, @Res() response: Response) {
        try {
            // 1. Construire le DTO de PublishedPoll
            const createPublishedPollDto: PublishedPoll = {
                ...poll,
                publicationDate: new Date().toISOString(),
                isPublished: true,
                totalVotes: poll.questions.reduce(
                    (acc, question, questionIndex) => {
                        acc[questionIndex.toString()] = Array(question.choices?.length).fill(0); // Initialiser les votes pour chaque choix
                        return acc;
                    },
                    {} as { [questionIndex: string]: number[] },
                ),
            };
            // 2. Créer le sondage publié dans Firestore
            await this.publishedPollService.createPublishedPoll(createPublishedPollDto);

            // 3. Supprimer l'ancien sondage de Firestore
            await this.deletePollById(poll.id, response);
            // 5. Retourner le sondage publié et les listes mises à jour
            return response.status(HttpStatus.OK).send();
        } catch (error) {
            console.error('Erreur lors de la publication du sondage :', error);
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
        }
    }

    @ApiOkResponse({
        description: 'Poll deleted successfully',
    })
    @ApiNotFoundResponse({
        description: 'Poll not found',
    })
    @Delete('/:id')
    async deletePollById(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.pollService.deletePollById(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }
}
