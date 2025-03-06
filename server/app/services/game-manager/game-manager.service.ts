import { Game } from '@app/classes/game/game';
import { Player } from '@app/classes/player/player';
import { SEED_1, SEED_2 } from '@app/constants';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class GameManagerService {
    currentGames: Game[] = [];
    socketRoomsMap: Map<Socket, string>;

    constructor() {
        this.socketRoomsMap = new Map<Socket, string>();
    }

    createGame(quiz: Quiz, @ConnectedSocket() client: Socket): string {
        const roomId = this.generateNewRoomId();
        this.currentGames.push(new Game(roomId, quiz, client));
        return roomId;
    }

    getGameByRoomId(roomId: string): Game | null {
        for (const game of this.currentGames) {
            if (game.roomId === roomId) return game;
        }
        return null;
    }

    generateNewRoomId(): string {
        let roomId: number;
        do {
            roomId = Math.floor(SEED_1 + Math.random() * SEED_2);
        } while (this.getGameByRoomId(roomId.toString()));

        return roomId.toString();
    }

    joinGame(roomId: string, playerName: string, @ConnectedSocket() client: Socket): boolean {
        if (!this.canEnterGame(roomId)) {
            return false;
        }
        const game = this.getGameByRoomId(roomId);
        const trimmedPlayerName = playerName.trim();
        if (!game.validPlayer(trimmedPlayerName)) {
            console.log("Normalement tu me vois pcq le player est pas valid")
            return false;
        }
        const roomToJoin = this.getGameByRoomId(roomId);
        const player = new Player(trimmedPlayerName, false, client);
        roomToJoin.addPlayer(player, client);
        return true;
    }

    canEnterGame(roomId: string): boolean {
        const game = this.getGameByRoomId(roomId);
        return this.validRoom(roomId) && !game.isLocked;
    }

    validRoom(roomId: string): boolean {
        return !!this.getGameByRoomId(roomId);
    }

    removeGame(game: Game) {
        const index = this.currentGames.indexOf(game);
        const GAME_NOT_FOUND = -1;
        if (index !== GAME_NOT_FOUND) {
            this.currentGames.splice(index, 1);
        }
    }

    endGame(roomId: string) {
        const game = this.getGameByRoomId(roomId);
        if (game) {
            game.timer.stopTimer();
            this.removeGame(game);
        }
    }
}
