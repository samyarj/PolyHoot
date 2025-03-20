import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreatePollDto } from './create-poll.dto';

export class CreatePublishedPollDto extends CreatePollDto {
    @ApiProperty({ description: 'The publication date of the poll' })
    @IsNotEmpty()
    @IsDateString()
    publicationDate: string;

    @ApiProperty({ description: 'The end date of the poll' })
    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @ApiProperty({ description: 'Total votes for each question' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Number)
    totalVotes: number[][];
}
