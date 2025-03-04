import { CoinFlipGameState } from '@app/constants/enum-classes';
import { AuthenticatedSocket } from '@app/interface/authenticated-request';
import { UserService } from '@app/services/auth/user.service';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { CoinFlipTimer } from './coinflip-timer';

@Injectable()
export class CoinFlipGame {
    gameState: CoinFlipGameState = CoinFlipGameState.Uninitialized;
    timer: CoinFlipTimer;
    history: string[] = [];
    winningSide: string = '';
    playerList: {
        heads: { name: string; socket: AuthenticatedSocket; bet: number }[];
        tails: { name: string; socket: AuthenticatedSocket; bet: number }[];
    } = { heads: [], tails: [] };

    constructor(
        private server: Server,
        private userService: UserService,
    ) {
        this.server = server;
        this.timer = new CoinFlipTimer(server);
        this.startGame();
    }

    initializeGame() {
        this.winningSide = '';
        this.gameState = CoinFlipGameState.BettingPhase;
        this.playerList = { heads: [], tails: [] };
        this.server.emit('SendPlayerList', this.playerList);
    }

    isUserAlreadyInList(client: AuthenticatedSocket) {
        return (
            this.playerList.heads.some((player) => player.socket.id === client.id) ||
            this.playerList.tails.some((player) => player.socket.id === client.id)
        );
    }

    addUserToList(client: AuthenticatedSocket, betChoice: { choice: string; bet: number }) {
        if (betChoice.choice === 'heads') {
            this.playerList.heads.push({ name: 'player', socket: client, bet: betChoice.bet });
        } else if (betChoice.choice === 'tails') {
            this.playerList.tails.push({ name: 'player', socket: client, bet: betChoice.bet });
        }
    }

    flipCoin(): string {
        let result = Math.random() > 0.5 ? 'heads' : 'tails';
        this.history.push(result);
        if (this.history.length > 10) {
            this.history.shift();
        }
        return result;
    }

    async submitChoice(client: AuthenticatedSocket, betChoice: { choice: string; bet: number }) {
        const isUserAlreadyInList = this.isUserAlreadyInList(client);
        if (!isUserAlreadyInList) {
            const submitStatus = await this.userService.updateUserCoins(client.user.uid, -1 * betChoice.bet);
            if (submitStatus) {
                this.addUserToList(client, betChoice);
                return true;
            }
        }
        return false;
    }

    async adjustBalances(winningSide: string) {
        let winningPlayers = winningSide === 'heads' ? this.playerList.heads : this.playerList.tails;
        winningPlayers.forEach(async (player) => {
            await this.userService.updateUserCoins(player.socket.user.uid, player.bet * 2);
        });
    }

    startGame(): void {
        this.initializeGame();
        this.server.emit('coinflip-start-game');
        //console.log('START-GAME');
        this.timer.startTimer(10, 'coinflip-timer', () => {
            this.timer.stopTimer();
            this.startPreFlippingPhase();
        });
    }

    startPreFlippingPhase() {
        this.gameState = CoinFlipGameState.PreFlippingPhase;
        this.server.emit('coinflip-pre-flipping');
        //console.log('START-PRE-GAME');
        this.timer.startTimer(3, 'coinflip-timer', () => {
            this.timer.stopTimer();
            this.startFlippingPhase();
        });
    }

    startFlippingPhase() {
        this.gameState = CoinFlipGameState.FlippingPhase;
        this.server.emit('coinflip-flipping');
        //console.log('START-FLIP');
        this.timer.startTimer(3, 'coinflip-timer', () => {
            this.timer.stopTimer();
            this.startResultsPhase();
        });
    }

    startResultsPhase() {
        this.gameState = CoinFlipGameState.ResultsPhase;
        let result = this.flipCoin();
        this.adjustBalances(result);
        //console.log('START-RESULTS');
        this.server.emit('coinflip-results', {
            result,
            playerList: {
                heads: this.playerList.heads.map((player) => ({ name: player.name, bet: player.bet })),
                tails: this.playerList.tails.map((player) => ({ name: player.name, bet: player.bet })),
            },
            history: this.history,
        });
        this.timer.startTimer(3, 'coinflip-timer', () => {
            this.timer.stopTimer();
            this.startGame();
        });
    }
}
