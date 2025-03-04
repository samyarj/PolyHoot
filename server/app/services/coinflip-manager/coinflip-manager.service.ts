import { CoinFlipGame } from '@app/classes/coinflip/coinflip-game';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class CoinflipManagerService {
    game: CoinFlipGame;
    private server: Server;

    setServer(server: Server) {
        this.server = server;
        this.game = new CoinFlipGame(server);
    }

    submitChoice(client: Socket, betChoice: { choice: string; bet: number }) {
        return this.game.submitChoice(client, betChoice);
    }

    getPlayers() {
        return {
            heads: this.game.playerList.heads.map((player) => ({ name: player.name, bet: player.bet })),
            tails: this.game.playerList.tails.map((player) => ({ name: player.name, bet: player.bet })),
        };
    }

    getGameInfo() {
        return {
            playerList: {
                heads: this.game.playerList.heads.map((player) => ({ name: player.name, bet: player.bet })),
                tails: this.game.playerList.tails.map((player) => ({ name: player.name, bet: player.bet })),
            },
            history: this.game.history,
            state: this.game.gameState,
        };
    }
}
