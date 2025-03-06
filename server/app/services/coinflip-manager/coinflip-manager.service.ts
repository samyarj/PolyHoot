import { CoinFlipGame } from '@app/classes/coinflip/coinflip-game';
import { AuthenticatedSocket } from '@app/interface/authenticated-request';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { UserService } from '../auth/user.service';

@Injectable()
export class CoinflipManagerService {
    game: CoinFlipGame;
    private server: Server;

    constructor(private userService: UserService) {}
    setServer(server: Server) {
        this.server = server;
        this.game = new CoinFlipGame(server, this.userService);
    }

    async submitChoice(client: AuthenticatedSocket, betChoice: { choice: string; bet: number }) {
        return await this.game.submitChoice(client, betChoice);
    }

    getPlayers() {
        return {
            heads: this.game.playerList.heads.map((player) => ({ name: player.name, bet: player.bet })).sort((a, b) => b.bet - a.bet),
            tails: this.game.playerList.tails.map((player) => ({ name: player.name, bet: player.bet })).sort((a, b) => b.bet - a.bet),
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
