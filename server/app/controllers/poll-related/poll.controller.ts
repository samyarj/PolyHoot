import { ERROR } from '@app/constants/error-messages';
import { CreatePollDto } from '@app/model/dto/poll/create-poll.dto';
import { CreatePublishedPollDto } from '@app/model/dto/poll/create-published-poll.dto';
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
        description: 'Returns all polls',
        type: Poll,
        isArray: true,
    })
    @Get()
    async getAllPolls(@Res() response: Response) {
        try {
            const polls = await this.pollService.getAllPolls();
            const publishedPolls = await this.publishedPollService.getAllPublishedPolls();
            response.status(HttpStatus.OK).json({ polls, publishedPolls });
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

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
            const updatedPolls = await this.pollService.getAllPolls();
            response.status(HttpStatus.CREATED).json(updatedPolls);
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
            await this.pollService.verifyAndUpdatePoll(id, updatePollDto);
            const updatedPolls = await this.pollService.getAllPolls();
            response.status(HttpStatus.OK).json(updatedPolls);
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
        description: 'Poll successfully deleted',
    })
    @ApiNotFoundResponse({
        description: 'Poll not found',
    })
    @Delete('/delete/:id')
    async deletePoll(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.pollService.deletePollById(id);
            const updatedPolls = await this.pollService.getAllPolls();
            response.status(HttpStatus.OK).json(updatedPolls);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
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
    @Patch('publish')
    @Patch('publish')
    async publishPoll(@Body() poll: Poll, @Res() response: Response) {
        try {
            // 2. Construire le DTO de PublishedPoll
            const createPublishedPollDto: CreatePublishedPollDto = {
                ...poll,
                publicationDate: new Date().toISOString(),
                isPublished: true,
                totalVotes: poll.questions.map(() => []), // Initialisation des votes
            };

            // 3. Créer le sondage publié
            const publishedPoll = await this.pollService.createPublishedPoll(createPublishedPollDto);

            // 4. Supprimer l'ancien sondage
            await this.pollService.deletePollById(poll.id);

            // Récupérer la liste de sondages et celle des publiés
            const updatedPolls = await this.pollService.getAllPolls();
            const updatedPublishedPolls = await this.publishedPollService.getAllPublishedPolls();

            // 5. Retourner le sondage publié
            return response.status(HttpStatus.OK).json({ polls: updatedPolls, publishedPolls: updatedPublishedPolls });
        } catch (error) {
            console.error(error);
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
        }
    }
}
