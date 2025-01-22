import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ChoiceDto } from './choice-dto';
import { MAX_POINTS, MIN_POINTS } from '@app/constants';

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

    @ApiProperty({ type: [ChoiceDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChoiceDto)
    choices: ChoiceDto[];

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    lastModified: string;
}
