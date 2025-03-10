import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class QreAttributes {
    @ApiProperty()
    @IsInt()
    goodAnswer: number;

    @ApiProperty()
    @IsInt()
    minBound: number;

    @ApiProperty()
    @IsInt()
    maxBound: number;

    @ApiProperty()
    @IsInt()
    tolerance: number;
}