import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsPositive, ValidateNested } from 'class-validator';

export class CreateQuizDto {
    @ApiProperty({ description: 'The title of the quiz' })
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'A description of the quiz' })
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'The duration of the quiz in minutes' })
    @IsPositive()
    duration: number;

    @ApiProperty({ description: 'The last modification date of the quiz', type: String })
    @IsNotEmpty()
    lastModification: string;

    @ApiProperty({ description: 'A list of questions for the quiz', type: [CreateQuestionDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions: CreateQuestionDto[];
}
