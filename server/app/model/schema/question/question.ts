/* eslint-disable no-underscore-dangle */ // Attributs de Mongo utilisent un underscore
import { QuestionChoice } from '@app/model/schema/question-choice/question-choice';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            ret.id = ret._id.toHexString();
            delete ret._id;
            delete ret.__v;

            if (ret.choices) {
                ret.choices.forEach((choice) => {
                    delete choice._id;
                    delete choice.id;
                });
            }
        },
    },
    toObject: { virtuals: true },
})
export class Question {
    @ApiProperty()
    @Prop({ required: true })
    type: string;

    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty()
    @Prop({
        type: [
            {
                text: String,
                isCorrect: { type: Boolean, default: false },
            },
        ],
        default: [],
    })
    choices: Types.Array<QuestionChoice>;

    @ApiProperty({ description: 'The last modification date of the question' })
    @Prop({ required: false, default: new Date().toString() })
    lastModified: string;
}

export const questionSchema = SchemaFactory.createForClass(Question);
