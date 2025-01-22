/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { Question, questionSchema } from '@app/model/schema/question/question';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type QuizDocument = Quiz & Document;

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            ret.id = ret._id.toHexString();
            delete ret._id;
        },
    },
    toObject: { virtuals: true },
})
export class Quiz {
    @ApiProperty({ description: 'The title of the quiz' })
    @Prop({ required: true })
    title: string;

    @ApiProperty({ description: 'A description of the quiz' })
    @Prop({ required: true })
    description: string;

    @ApiProperty({ description: 'The last modification date of the quiz' })
    @Prop({ required: true, default: new Date().toString() })
    lastModification: string;

    @ApiProperty({ description: 'The duration of the quiz in minutes' })
    @Prop({ required: true })
    duration: number;

    @ApiProperty({ type: [Question], description: 'A list of questions for the quiz' })
    @Prop({ type: [questionSchema], default: [] })
    questions: Types.Array<Question>;

    @ApiProperty({ description: 'The visibility of the quiz', required: false })
    @Prop()
    visibility?: boolean;
}

export const quizSchema = SchemaFactory.createForClass(Quiz);
