import { Injectable } from '@angular/core';
import { CoinFlipGameState } from '@app/constants/enum-class';
import { SocketClientService } from 'src/app/services/websocket-services/general/socket-client-manager.service';

@Injectable({
    providedIn: 'root',
})
export class CoinFlipService {
    gameState: CoinFlipGameState = CoinFlipGameState.BettingPhase;
    selectedSide: string;
    winningSide: string;
    betAmount: number = 0;
    playerList: {
        heads: { name: string; bet: number }[];
        tails: { name: string; bet: number }[];
    } = { heads: [], tails: [] };
    history: string[] = [];

    constructor(private socketService: SocketClientService) {
        this.resetAttributes();
        this.initializeEventListeners();
    }

    selectSide(side: string) {
        this.selectedSide = side;
    }

    resetAttributes() {
        this.gameState = CoinFlipGameState.BettingPhase;
        this.selectedSide = '';
        this.winningSide = '';
        this.betAmount = 0;
    }

    getState() {
        this.socketService.send(
            'JoinGame',
            (answer: {
                playerList: {
                    heads: { name: string; bet: number }[];
                    tails: { name: string; bet: number }[];
                };
                history: string[];
                state: CoinFlipGameState;
            }) => {
                this.playerList = answer.playerList;
                this.history = answer.history;
                this.gameState = answer.state;
            },
        );
    }

    initializeEventListeners() {
        this.socketService.on('coinflip-start-game', () => {
            this.resetAttributes();
        });

        this.socketService.on('coinflip-pre-flipping', () => {
            this.gameState = CoinFlipGameState.PreFlippingPhase;
        });

        this.socketService.on('coinflip-flipping', () => {
            this.gameState = CoinFlipGameState.FlippingPhase;
        });

        this.socketService.on(
            'coinflip-results',
            (answer: {
                result: string;
                playerList: {
                    heads: { name: string; bet: number }[];
                    tails: { name: string; bet: number }[];
                };
                history: string[];
            }) => {
                this.playerList = answer.playerList;
                this.history = answer.history;
                this.gameState = CoinFlipGameState.ResultsPhase;
                this.winningSide = answer.result;
            },
        );

        this.socketService.on('SendPlayerList', (playerList: { heads: { name: string; bet: number }[]; tails: { name: string; bet: number }[] }) => {
            this.playerList = playerList;
        });
    }

    submitBet() {
        if (this.betAmount > 0 && this.betAmount % 1 === 0) {
            this.socketService.send('SubmitChoice', { choice: this.selectedSide, bet: this.betAmount }, (submitStatus: boolean) => {
                if (submitStatus) {
                    this.gameState = CoinFlipGameState.PreFlippingPhase;
                }
            });
        }
    }

    updateBetAmount(value: number) {
        if (value < 0) {
            return 0;
        }
        if (value % 1 !== 0) {
            return Math.ceil(Number(value));
        }
        return Number(value);
    }

    increaseBet(amount: number) {
        if (!this.betAmount) {
            this.betAmount = 0;
        }
        this.betAmount += amount;
    }
}
