import { ERROR } from '@app/constants/error-messages';
import { PublishedPoll } from '@app/model/schema/poll/published-poll.schema';
import { PublishedPollService } from '@app/services/poll/published-poll.service';
import { Controller, Delete, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
}
