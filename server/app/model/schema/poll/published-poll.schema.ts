/* /* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Poll } from './poll';

export type PublishedPollDocument = PublishedPoll & Document;

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
export class PublishedPoll extends Poll {
    @ApiProperty({ description: 'The publication date of the poll' })
    @Prop({ required: true })
    publicationDate: string;

    @ApiProperty({ description: 'Total votes for each question' })
    @Prop({ type: [[Number]], default: [] })
    totalVotes: { [questionIndex: string]: number[] };
}

export const publishedPollSchema = SchemaFactory.createForClass(PublishedPoll);