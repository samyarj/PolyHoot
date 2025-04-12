import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
const Groq = require('groq-sdk');
dotenv.config({ path: '../../../.env' });

@Injectable()
export class QuickReplyService {
    private groq: any;

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not set in the environment variables');
        }
        this.groq = new Groq({ apiKey });
    }

    private initializeContext(): { role: string; content: string }[] {
        // Return the system prompt as the initial context
        return [
            {
                role: 'system',
                content: `You are a quick reply generator for a chat application. Your client is a user in that chat.
Input Requirements:
1. The user will provide their name.
2. The user will describe the context of the conversation, including who said what and any relevant emotions or tones (e.g., happy, frustrated, casual).

Expected Output:
1. Generate 3 quick replies consisting of 1-3 words that are contextually appropriate.
2. Ensure the replies reflect the tone of the conversation.
3. Aim for responses that are engaging and relevant to the conversation.
4. If the context suggests multiple emotions, provide a variety of responses to choose from.
5. All quick replies must be in french
6. Your output must follow this JSON format:
{
  "quick_replies": ["answer1", "answer2", "answer3"]
}
7. If you are not sure what to do, give this default output:
{
  "quick_replies": ["Wow!", "Bien joué!", "Intéressant!"]
}`,
            },
        ];
    }

    private validateQuickRepliesSchema(response: any): boolean {
        try {
            if (typeof response === 'string') {
                response = JSON.parse(response);
            }
            return (
                response &&
                typeof response === 'object' &&
                Array.isArray(response.quick_replies) &&
                response.quick_replies.length === 3 &&
                response.quick_replies.every((reply) => typeof reply === 'string')
            );
        } catch (error) {
            console.error('Invalid JSON format:', error);
            return false;
        }
    }

    async generateQuickReplies(channelId: string, user: string, message: string, gameContext?: string): Promise<string[]> {
        try {
            // Initialize the context
            const context = this.initializeContext();

            // Add the user's message to the conversation context
            let userContent = `1. I am user: ${user}
2. Here is the context:
${message}`;

            if (gameContext) {
                userContent += `\n3. Game context: ${gameContext}`;
            }

            context.push({
                role: 'user',
                content: userContent,
            });

            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
                try {
                    // Send the conversation context to the LLM
                    const chatCompletion = await this.groq.chat.completions.create({
                        messages: context,
                        model: 'llama3-70b-8192',
                        temperature: 1,
                        max_completion_tokens: 1024,
                        top_p: 1,
                        stream: false,
                        response_format: {
                            type: 'json_object',
                        },
                        stop: null,
                    });

                    const response = chatCompletion.choices[0]?.message?.content;
                    const parsedResponse = JSON.parse(response);

                    if (this.validateQuickRepliesSchema(parsedResponse)) {
                        return parsedResponse.quick_replies;
                    }
                } catch (error) {
                    console.error(`Attempt ${attempts + 1} failed:`, error);
                }

                attempts++;
            }

            return ['Wow!', 'Bien joué!', 'Intéressant!'];
        } catch (error) {
            console.error('Error generating quick replies:', error);
            return ['Wow!', 'Bien joué!', 'Intéressant!'];
        }
    }
}
