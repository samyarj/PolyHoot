import { QuickReplyService } from '@app/services/quick-reply/quick-reply.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('quick-reply')
export class QuickReplyController {
    constructor(private readonly quickReplyService: QuickReplyService) {}

    @Post('generate')
    async generateQuickReplies(
        @Body('channelId') channelId: string, // if "global" or roomid if chat is not a in a channel
        @Body('user') user: string, // the user that the quick reply is generated for
        @Body('message') message: string, // all conversation history in a particular chat
        @Body('gameContext') gameContext?: string, // for game chat only- add rankings for players & validity of the current question
    ) {
        try {
            const quickReplies = await this.quickReplyService.generateQuickReplies(channelId, user, message, gameContext);
            return { quickReplies };
        } catch (error) {
            return { error: error.message };
        }
    }

    @Post('reset')
    async resetConversationContext(@Body('channelId') channelId: string) {
        try {
            this.quickReplyService.resetConversationContext(channelId);
            return { message: 'Conversation context reset successfully' };
        } catch (error) {
            return { error: error.message };
        }
    }
}
