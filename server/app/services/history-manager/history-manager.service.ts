import { CreateGameRecordDto } from '@app/model/dto/game-record/create-game-record.dto';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { GameRecord } from '@common/game-record';
import { PlayerResult } from '@common/partial-player';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HistoryManagerService {
    private history: GameRecord[] = [];
    private map: Map<string, GameRecord> = new Map();

    constructor(private gameRecordService: GameRecordService) {}

    addGameRecord(gameTitle: string, roomId: string) {
        const gameRecordExists = this.map.has(roomId);
        if (!gameRecordExists) {
            const gameRecord = this.intializeGameRecord(gameTitle);
            this.history.push(gameRecord);
            this.map.set(roomId, gameRecord);
        }
    }

    async saveGameRecordToDB(roomId: string, players: PlayerResult[]) {
        const gameRecord = this.map.get(roomId);
        if (gameRecord) {
            gameRecord.playersNumber = players.length;
            gameRecord.bestScore = Math.max(...players.map((player) => player.points));
        }
        const gameRecordDto = new CreateGameRecordDto(gameRecord);
        await this.gameRecordService.createGameRecord(gameRecordDto);
        this.removeGameRecord(roomId);
    }

    removeGameRecord(roomId: string) {
        const gameRecord = this.map.get(roomId);
        if (gameRecord) {
            this.history = this.history.filter((record) => record !== gameRecord);
            this.map.delete(roomId);
        }
    }

    private intializeGameRecord(gameTitle: string): GameRecord {
        return {
            name: gameTitle,
            startingDate: new Date().toString(),
            playersNumber: 0,
            bestScore: 0,
        };
    }
}
