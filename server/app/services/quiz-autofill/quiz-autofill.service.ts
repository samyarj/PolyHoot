import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
const Groq = require('groq-sdk');
dotenv.config({ path: '../../../.env' });

@Injectable()
export class QuizAutofillService {
    private groq: any;

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not set in the environment variables');
        }
        this.groq = new Groq({ apiKey });
    }

    private initializeContext(): { role: string; content: string }[] {
        return [
            {
                role: 'system',
                content: `Vous êtes un concepteur professionnel de questions de quiz. Vous pouvez créer des questions de quiz difficiles avec un taux de réussite inférieur à 10 %. J'ai besoin de votre aide pour mon WebApp.

1. Je veux que vous générez une question Kahoot dans le format désiré par le client. 
2. Le client te donneras le format, et vous devez lui créer un quiz dans ce format, et lui fournir la réponse si nécessaire.
3. Les questions doivent être en français.
4. Veuillez fournir uniquement le JSON, et rien d'autre.`,
            },
        ];
    }

    private validateQuizSchema(response: any): boolean {
        try {
            // Parse if response is a string
            if (typeof response === 'string') {
                response = JSON.parse(response);
            }

            // Basic JSON validation
            if (typeof response !== 'object' || response === null) {
                return false;
            }

            // Validate common fields
            if (!response.Question || typeof response.Question !== 'string') {
                return false;
            }

            // Type-specific validation
            if (response.Choix) {
                // QCM validation
                if (
                    typeof response.Choix !== 'object' ||
                    Object.keys(response.Choix).length !== 4 ||
                    !response.Réponse ||
                    typeof response.Réponse !== 'string'
                ) {
                    return false;
                }
            } else if (response['Bonne réponse'] !== undefined) {
                // QRE validation
                const bonneReponse = response['Bonne réponse'];
                const borneMin = response['Borne minimale'];
                const borneMax = response['Borne maximale'];
                const marge = response['Marge de tolérance'];

                if (
                    typeof bonneReponse !== 'number' ||
                    !Number.isInteger(bonneReponse) ||
                    typeof borneMin !== 'number' ||
                    !Number.isInteger(borneMin) ||
                    typeof borneMax !== 'number' ||
                    !Number.isInteger(borneMax) ||
                    typeof marge !== 'number' ||
                    !Number.isInteger(marge) ||
                    borneMin >= borneMax ||
                    bonneReponse < borneMin ||
                    bonneReponse > borneMax ||
                    marge <= 0 ||
                    marge > (borneMax - borneMin) / 4
                ) {
                    return false;
                }
            } else {
                // QRL validation - only requires the Question field
                if (Object.keys(response).length !== 1) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Invalid JSON format:', error);
            return false;
        }
    }

    private selectQuestionType(type: string) {
        switch (type) {
            case 'QCM':
                return `{
  "Question": "[insérer la question]",
  "Choix": {
    "1": "voici la première réponse",
    "2": "voici la deuxième réponse",
    "3": "voici la troisième réponse",
    "4": "voici la quatrième réponse"
  },
  "Réponse": "[clé de la réponse correcte]"
}`;
            case 'QRL':
                return `{ "Question": "[insérer la question à réponse longue]" }`;
            case 'QRE':
                return `{
  "Question": "[insérer la question]",
  "Bonne réponse": [un entier],
  "Borne minimale": [doit être un entier inférieur à la borne maximale et à la bonne réponse],
  "Borne maximale": [doit être supérieure à la borne minimale et à la bonne réponse],
  "Marge de tolérance": [doit être un entier supérieure à 0 et ne peut dépasser 1/4 de l'intervalle entre la borne minimale et la borne maximale.]
}`;
            default:
                throw new Error(`Type de question non supporté: ${type}`);
        }
    }

    async generateQuestion(type: string): Promise<any[]> {
        try {
            const initialContext = this.initializeContext();
            let userContent = this.selectQuestionType(type);

            initialContext.push({
                role: 'user',
                content: userContent,
            });

            const chatCompletion = await this.groq.chat.completions.create({
                messages: initialContext,
                model: 'mistral-saba-24b',
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

            if (this.validateQuizSchema(parsedResponse)) {
                return parsedResponse;
            } else {
                return [
                    {
                        question: 'What is the capital of France?',
                        options: ['Paris', 'London', 'Berlin', 'Madrid'],
                        correct_answer: 'Paris',
                    },
                ];
            }
        } catch (error) {
            console.error('Error generating quiz questions:', error);
            return [
                {
                    question: 'What is the capital of France?',
                    options: ['Paris', 'London', 'Berlin', 'Madrid'],
                    correct_answer: 'Paris',
                },
            ];
        }
    }

    async reformulateQuestion(question: string): Promise<string> {
        try {
            const messages = [
                {
                    role: 'system',
                    content: `Vous êtes un expert en reformulation de questions. 
1. Votre tâche est de reformuler des questions en gardant le même sens mais en utilisant un style différent. 
2. Assurez-vous de reformuler la question qu'une seule fois.
3. Assurez-vous de retouner la reformulation seulement, sans tout autres messages`,
                },
                {
                    role: 'user',
                    content: `Voici la question: ${question}`,
                },
            ];

            const chatCompletion = await this.groq.chat.completions.create({
                messages: messages,
                model: 'mistral-saba-24b',
                temperature: 1,
                max_completion_tokens: 200,
                top_p: 0.9,
                stream: false,
                stop: null,
            });

            return chatCompletion.choices[0]?.message?.content || question;
        } catch (error) {
            console.error('Error reformulating question:', error);
            return question;
        }
    }
}
