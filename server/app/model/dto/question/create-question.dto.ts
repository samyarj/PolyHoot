import { MAX_POINTS, MIN_POINTS } from '@app/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, isURL, Max, Min, ValidateNested } from 'class-validator';
import { ChoiceDto } from './choice-dto';
import { QreAttributes } from './qre-attributes-dto';

export class CreateQuestionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty()
    @IsInt()
    @Min(MIN_POINTS)
    @Max(MAX_POINTS)
    points: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    creator?: string;

    @ApiProperty({ type: [ChoiceDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChoiceDto)
    choices?: ChoiceDto[];

    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => QreAttributes)
    qreAttributes?: QreAttributes;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    image?: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    lastModified: string;
}
