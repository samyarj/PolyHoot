import { ChatChannelsService } from '@app/services/chat-channels/chat-channels.service';
import { Controller, Delete, HttpStatus, Logger, Param, Res } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('chat-channels')
export class ChatChannelsController {
    constructor(private readonly chatChannelsService: ChatChannelsService,
        private readonly logger: Logger,
    ) {}

    @ApiOkResponse({ description: 'Chat channel successfully deleted' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiParam({ name: 'channelName', required: true, description: 'The name of the chat channel to delete' })
    @Delete(':channelName')
    async deleteChatChannel(@Param('channelName') channelName: string, @Res() response: Response) {
        this.logger.log(`Deleting chat channel: ${channelName}`);
        try {
            await this.chatChannelsService.deleteChatChannel(channelName);
            response.status(HttpStatus.OK).send({ message: 'Chat channel successfully deleted' });
        } catch (error) {
            this.logger.error(`Error deleting chat channel: ${error.message}`);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }
}