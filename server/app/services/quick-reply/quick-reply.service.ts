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

    async generateQuickReplies(user: string, context: string): Promise<string[]> {
        try {
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
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
                    {
                        role: 'user',
                        content: `1. I am user: ${user}
2. Here is the context:
${context}`,
                    },
                ],
                model: 'mistral-saba-24b',
                temperature: 1,
                max_completion_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null,
            });

            const response = chatCompletion.choices[0]?.message?.content;
            const parsedResponse = JSON.parse(response);
            return parsedResponse.quick_replies;
        } catch (error) {
            console.error('Error generating quick replies:', error);
            throw new Error('Failed to generate quick replies');
        }
    }
}
