import { QuickReplyService } from '@app/services/quick-reply/quick-reply.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('quick-reply')
export class QuickReplyController {
    constructor(private readonly quickReplyService: QuickReplyService) {}

    @Post('generate')
    async generateQuickReplies(
        @Body('channelId') channelId: string,
        @Body('user') user: string,
        @Body('message') message: string,
        @Body('gameContext') gameContext?: string, // for game chat
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
