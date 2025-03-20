import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNotEmptyObject, IsOptional, IsPositive, ValidateNested } from 'class-validator';

export class CreatePollDto {
    @ApiProperty({ description: 'The title of the poll' })
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'A description of the poll' })
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsNotEmpty()
    expired: boolean;

    @ApiProperty()
    @IsNotEmpty()
    expireDate: Date;

    @ApiProperty()
    @IsOptional()
    isPublished?: boolean;

    @ApiProperty({ description: 'A list of questions for the poll', type: [CreateQuestionDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions: CreateQuestionDto[];
}
