import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
const Groq = require('groq-sdk');
dotenv.config({ path: '../../../.env' });

@Injectable()
export class QuickReplyService {
    private groq: any;
    private conversationContexts: Map<string, { role: string; content: string }[]> = new Map(); // Store contexts for multiple channels

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not set in the environment variables');
        }
        this.groq = new Groq({ apiKey });
    }

    private initializeContext(channelId: string) {
        if (!this.conversationContexts.has(channelId)) {
            // Initialize the conversation context with the system prompt for the channel
            this.conversationContexts.set(channelId, [
                {
                    role: 'system',
                    content: `You are a quick reply generator for a chat application. Your client is a user in that chat.
Input Requirements:
1. The user will provide their name.
2. The user will describe the context of the conversation, including who said what and any relevant emotions or tones (e.g., happy, frustrated, casual).

Expected Output:
1. Generate 3 quick replies consisting of 1-3 words and 1 emoji that are contextually appropriate.
2. Ensure the replies reflect the tone of the conversation.
3. Aim for responses that are engaging and relevant to the conversation.
4. If the context suggests multiple emotions, provide a variety of responses to choose from.
5. Your output must follow this JSON format, and it should never contain any strings.
{
  "quick_replies": ["answer1 😊", "answer2 👍", "answer3 🤔"]
}
6. If you are not sure what to do, give this default output
{
  "quick_replies": ["Hello! 👋", "Nice to meet you! 😊", "How are you? 🤔"]
}`,
                },
            ]);
        }
    }

    async generateQuickReplies(channelId: string, user: string, message: string): Promise<string[]> {
        try {
            // Initialize the context for the channel if it doesn't exist
            this.initializeContext(channelId);

            // Get the conversation context for the channel
            const context = this.conversationContexts.get(channelId);

            // Add the user's message to the conversation context
            context?.push({
                role: 'user',
                content: `1. I am user: ${user}
2. Here is the context:
${message}`,
            });

            // Send the conversation context to the LLM
            const chatCompletion = await this.groq.chat.completions.create({
                messages: context,
                model: 'mistral-saba-24b',
                temperature: 1,
                max_completion_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null,
            });

            const response = chatCompletion.choices[0]?.message?.content;
            const parsedResponse = JSON.parse(response);

            // Add the assistant's reply to the conversation context
            context?.push({
                role: 'assistant',
                content: response,
            });

            return parsedResponse.quick_replies;
        } catch (error) {
            console.error('Error generating quick replies:', error);
            throw new Error('Failed to generate quick replies');
        }
    }

    resetConversationContext(channelId: string) {
        // Reset the context for a specific channel
        if (this.conversationContexts.has(channelId)) {
            const context = this.conversationContexts.get(channelId);
            if (context) {
                this.conversationContexts.set(channelId, context.slice(0, 1)); // Keep only the system prompt
            }
        }
    }
}
