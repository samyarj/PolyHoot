import { ERROR } from '@app/constants/error-messages';
import { PublishedPoll } from '@app/model/schema/poll/published-poll.schema';
import { UserService } from '@app/services/auth/user.service';
import { PublishedPollService } from '@app/services/poll/published-poll.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('PublishedPolls')
@Controller('published-polls')
export class PublishedPollController {
    constructor(
        private readonly publishedPollService: PublishedPollService,
        private readonly userService: UserService,
    ) {}

    @ApiOkResponse({
        description: 'Returns all published polls',
        type: PublishedPoll,
        isArray: true,
    })
    @Get()
    async getAllPublishedPolls(@Res() response: Response) {
        try {
            const publishedPolls = await this.publishedPollService.getAllPublishedPolls();
            console.log('Doit lui retourner ces polls: ', publishedPolls);
            response.status(HttpStatus.OK).json(publishedPolls);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({
        description: 'Get published poll by ID',
        type: PublishedPoll,
    })
    @Get('/:id')
    async getPublishedPollById(@Param('id') id: string, @Res() response: Response) {
        try {
            console.log('Ouais avec ', id);
            const publishedPoll = await this.publishedPollService.getPublishedPollById(id);
            response.status(HttpStatus.OK).json(publishedPoll);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }

    @ApiOkResponse({
        description: 'Published poll successfully deleted',
    })
    @ApiNotFoundResponse({
        description: 'Published poll not found',
    })
    @Delete('/delete/:id')
    async deleteExpiredPolls(@Res() response: Response) {
        try {
            await this.publishedPollService.deleteExpiredPolls();
            //const updatedPublishedPolls = await this.publishedPollService.getAllPublishedPolls();
            response.status(HttpStatus.OK).send(); //json(updatedPublishedPolls);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }
    @ApiOkResponse({ description: 'Published poll votes successfully updated' })
    @ApiNotFoundResponse({ description: 'Published poll not found' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @Patch('/:id')
    async updatePublishedPollVotes(@Param('id') id: string, @Body() results: number[], @Res() response: Response) {
        try {
            const updatedPublishedPoll = await this.publishedPollService.updatePublishedPollVotes(id, results);
            response.status(HttpStatus.OK).json(updatedPublishedPoll);
        } catch (error) {
            if (error.status === HttpStatus.NOT_FOUND) {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else if (error.status === HttpStatus.BAD_REQUEST) {
                response.status(HttpStatus.BAD_REQUEST).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
            }
        }
    }
    @ApiOkResponse({ description: 'Published poll votes successfully added to pollsAnswered' })
    @ApiNotFoundResponse({ description: 'Published poll not found' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @Patch('/:uid/addPollsAnswered/')
    async updatePollsAnswered(@Param('uid') uid: string, @Body('id') id: string, @Res() response: Response) {
        try {
            console.log('uid:', uid, 'pollid: ', id);
            await this.userService.addPollAnswered(uid, id);
            response.status(HttpStatus.OK).json({ message: 'Poll ID ajouté à pollsAnswered avec succès' });
        } catch (error) {
            if (error.message === "L'utilisateur n'existe pas.") {
                response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
            } else if (error.message === "Les données de l'utilisateur sont indisponibles.") {
                response.status(HttpStatus.BAD_REQUEST).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Erreur interne du serveur' });
            }
        }
    }
}
