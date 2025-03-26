/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { Question, questionSchema } from '@app/model/schema/question/question';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type PollDocument = Poll & Document;

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
export class Poll {
    @ApiProperty({ description: 'The id of the poll' })
    @Prop({ required: false })
    id: string;
    
    @ApiProperty({ description: 'The title of the poll' })
    @Prop({ required: true })
    title: string;

    @ApiProperty({ description: 'A description of the poll' })
    @Prop({ required: true })
    description: string;

    @ApiProperty({ description: 'The expire date of the poll' })
    @Prop({ required: false })
    endDate?: string;

    @ApiProperty({ description: 'The duration of the poll in minutes' })
    @Prop({ required: true })
    expired: boolean;

    @ApiProperty({ type: [Question], description: 'A list of questions for the poll' })
    @Prop({ type: [questionSchema], default: [] })
    questions: CreateQuestionDto[];

    @ApiProperty({ required: false })
    @Prop()
    isPublished?: boolean;
}

export const pollSchema = SchemaFactory.createForClass(Poll);
