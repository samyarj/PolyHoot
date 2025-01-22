/* eslint-disable no-underscore-dangle */ // car _id de mongo, il faut disable.
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameRecordDocument = GameRecordSchema & Document;

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
export class GameRecordSchema {
    @ApiProperty({ description: 'The name of the game' })
    @Prop({ required: true })
    name: string;

    @ApiProperty({ description: 'Date and time when the game started (YYYY-MM-DD hh:mm:ss)' })
    @Prop({ required: true })
    startingDate: string;

    @ApiProperty({ description: 'Number of players in the game' })
    @Prop({ required: true })
    playersNumber: number;

    @ApiProperty({ description: 'Best score achieved in the game' })
    @Prop({ required: true })
    bestScore: number;
}

export const gameRecordSchema = SchemaFactory.createForClass(GameRecordSchema);
