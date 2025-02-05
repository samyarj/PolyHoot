import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionChoiceDocument = QuestionChoice & Document;

export class QuestionChoice {
    text: string;
    isCorrect?: boolean;
    isSelected?: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const QuestionChoiceSchema = SchemaFactory.createForClass(QuestionChoice); // Respecter la convention de nommer les classes en UpperCamelCase
