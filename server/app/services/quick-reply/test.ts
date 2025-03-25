import { QuickReplyService } from './quick-reply.service'; // Adjust the path if necessary

async function testGenerateQuickReplies() {
    const quickReplyService = new QuickReplyService();

    const user = 'John';
    const context = 'Jane: Hi Hohn! How are you? 😊';

    console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY);

    try {
        const quickReplies = await quickReplyService.generateQuickReplies(user, context);
        console.log('Generated Quick Replies:', quickReplies);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testGenerateQuickReplies();
