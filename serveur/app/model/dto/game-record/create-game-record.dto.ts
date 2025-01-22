import { GameRecord } from '@common/game-record';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateGameRecordDto {
    @ApiProperty({ description: 'The name of the game' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Date and time when the game started (YYYY-MM-DDThh:mm:ss.sssZ)' })
    @IsDateString()
    startingDate: string;

    @ApiProperty({ description: 'Number of players in the game' })
    @IsNumber()
    @IsPositive()
    playersNumber: number;

    @ApiProperty({ description: 'Best score achieved in the game' })
    @IsNumber()
    @Min(0)
    bestScore: number;

    constructor(gameRecord?: GameRecord) {
        if (gameRecord) {
            this.name = gameRecord.name;
            this.startingDate = gameRecord.startingDate;
            this.playersNumber = gameRecord.playersNumber;
            this.bestScore = gameRecord.bestScore;
        }
    }
}
