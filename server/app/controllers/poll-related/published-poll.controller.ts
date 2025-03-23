import { ERROR } from '@app/constants/error-messages';
import { UpdatePublishedPollDto } from '@app/model/dto/poll/update-published-poll';
import { PublishedPoll } from '@app/model/schema/poll/published-poll.schema';
import { PublishedPollService } from '@app/services/poll/published-poll.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('PublishedPolls')
@Controller('published-polls')
export class PublishedPollController {
    constructor(private readonly publishedPollService: PublishedPollService) {}

    @ApiOkResponse({
        description: 'Returns all published polls',
        type: PublishedPoll,
        isArray: true,
    })
    @Get()
    async getAllPublishedPolls(@Res() response: Response) {
        try {
            const publishedPolls = await this.publishedPollService.getAllPublishedPolls();
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
    async deletePublishedPoll(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.publishedPollService.deletePublishedPollById(id);
            const updatedPublishedPolls = await this.publishedPollService.getAllPublishedPolls();
            response.status(HttpStatus.OK).json(updatedPublishedPolls);
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
            const testSiUpdatedAvecResultats = await this.publishedPollService.getPublishedPollById(id);
            console.log(testSiUpdatedAvecResultats);
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
    @Patch('expire/:id')
async expirePublishedPoll(
    @Param('id') id: string, // Récupérer l'ID du PublishedPoll à mettre à jour
    @Res() response: Response,
) {
    try {
        console.log("Rentre au bon endroit avec id ", id)
        // Appeler le service pour mettre à jour le PublishedPoll
        const updatedPublishedPoll = await this.publishedPollService.expirePublishedPoll(id);
        response.status(HttpStatus.OK).json(updatedPublishedPoll);
    } catch (error) {
        if (error.status === HttpStatus.NOT_FOUND) {
            response.status(HttpStatus.NOT_FOUND).send({ message: error.message });
        } else {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: ERROR.INTERNAL_SERVER_ERROR });
        }
    }
}
}
