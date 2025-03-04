import { CoinFlipGameState } from '@app/constants/enum-classes';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CoinFlipTimer } from './coinflip-timer';

@Injectable()
export class CoinFlipGame {
    gameState: CoinFlipGameState = CoinFlipGameState.Uninitialized;
    timer: CoinFlipTimer;
    history: string[] = [];
    winningSide: string = '';
    playerList: {
        heads: { name: string; socket: Socket; bet: number }[];
        tails: { name: string; socket: Socket; bet: number }[];
    } = { heads: [], tails: [] };
    constructor(private server: Server) {
        this.timer = new CoinFlipTimer(server);
        this.startGame();
    }

    initializeGame() {
        this.winningSide = '';
        this.gameState = CoinFlipGameState.BettingPhase;
        this.playerList = { heads: [], tails: [] };
        this.server.emit('SendPlayerList', this.playerList);
    }

    submitChoice(client: Socket, betChoice: { choice: string; bet: number }) {
        if (this.gameState !== CoinFlipGameState.BettingPhase) {
            return;
        }
        const isAlreadyInList =
            this.playerList.heads.some((player) => player.socket.id === client.id) ||
            this.playerList.tails.some((player) => player.socket.id === client.id);

        if (!isAlreadyInList) {
            // Add player to the correct list
            if (betChoice.choice === 'heads') {
                this.playerList.heads.push({ name: 'player', socket: client, bet: betChoice.bet });
                return true;
            } else if (betChoice.choice === 'tails') {
                this.playerList.tails.push({ name: 'player', socket: client, bet: betChoice.bet });
                return true;
            }
        }

        return false;

        // substract the bet from their balance
    }

    flipCoin(): string {
        let result = Math.random() > 0.5 ? 'heads' : 'tails';
        this.history.push(result);
        if (this.history.length > 10) {
            this.history.shift();
        }
        return result;
    }

    adjustBalances(winningSide: string) {
        let winningPlayers = winningSide === 'heads' ? this.playerList.heads : this.playerList.tails;
        let losingPlayers = winningSide === 'heads' ? this.playerList.tails : this.playerList.heads;

        // winning players balances adjusted
    }

    startGame(): void {
        this.initializeGame();
        this.server.emit('coinflip-start-game');
        this.timer.startTimer(10, 'coinflip-timer', () => {
            console.log('BETTING PHASE FINISHED');
            this.timer.stopTimer();
            this.startPreFlippingPhase();
        });
    }

    startPreFlippingPhase() {
        this.gameState = CoinFlipGameState.PreFlippingPhase;
        this.server.emit('coinflip-pre-flipping');
        this.timer.startTimer(3, 'coinflip-timer', () => {
            console.log('PRE-FLIPPING PHASE FINISHED');
            this.timer.stopTimer();
            this.startFlippingPhase();
        });
    }

    startFlippingPhase() {
        this.gameState = CoinFlipGameState.FlippingPhase;
        this.server.emit('coinflip-flipping');
        this.timer.startTimer(3, 'coinflip-timer', () => {
            console.log('FLIPPED!');
            this.timer.stopTimer();
            this.startResultsPhase();
        });
    }

    startResultsPhase() {
        this.gameState = CoinFlipGameState.ResultsPhase;
        let result = this.flipCoin();
        this.adjustBalances(result);
        this.server.emit('coinflip-results', {
            result,
            playerList: {
                heads: this.playerList.heads.map((player) => ({ name: player.name, bet: player.bet })),
                tails: this.playerList.tails.map((player) => ({ name: player.name, bet: player.bet })),
            },
            history: this.history,
        });
        this.timer.startTimer(3, 'coinflip-timer', () => {
            console.log('RESULTS FINISHED! - STARTING NEW GAME');
            this.timer.stopTimer();
            this.startGame();
        });
    }
}
