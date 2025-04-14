/* eslint-disable no-restricted-imports */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/general-elements/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '@app/components/general-elements/error-dialog/error-dialog.component';
import { WIDTH_SIZE } from '@app/constants/constants';
import { CoinFlipEvents, CoinFlipGameState } from '@app/constants/enum-class';
import { SocketClientService } from 'src/app/services/websocket-services/general/socket-client-manager.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class CoinFlipService {
    gameState: CoinFlipGameState = CoinFlipGameState.BettingPhase;
    selectedSide: string;
    winningSide: string;
    betAmount: number = 0;
    submitted: boolean = false;
    time: number = 0;
    name: string = '';
    playerList: {
        heads: { name: string; bet: number }[];
        tails: { name: string; bet: number }[];
    } = { heads: [], tails: [] };
    history: string[] = [];

    constructor(
        private socketService: SocketClientService,
        private matdialog: MatDialog,
        private authService: AuthService,
    ) {
        this.resetAttributes();
        this.initializeEventListeners();
        this.subscribeToName();
    }

    subscribeToName(): void {
        this.authService.user$.subscribe((user) => {
            if (user) {
                this.name = user.username;
            }
        });
    }

    selectSide(side: string) {
        this.selectedSide = side;
    }

    resetAttributes() {
        this.gameState = CoinFlipGameState.BettingPhase;
        this.selectedSide = '';
        this.winningSide = '';
        this.betAmount = 0;
        this.time = 0;
        this.submitted = false;
    }

    getState() {
        this.socketService.send(
            CoinFlipEvents.JoinGame,
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
                const allPlayers = [...answer.playerList.heads, ...answer.playerList.tails];
                const isMePlaying = allPlayers.some((player) => player.name === this.name);

                if (!isMePlaying && this.gameState === CoinFlipGameState.BettingPhase) {
                    this.resetAttributes();
                }
            },
        );
    }

    removeEventListeners() {
        this.socketService.socket.off(CoinFlipEvents.StartGame);
        this.socketService.socket.off(CoinFlipEvents.PreFlippingPhase);
        this.socketService.socket.off(CoinFlipEvents.FlippingPhase);
        this.socketService.socket.off(CoinFlipEvents.Results);
        this.socketService.socket.off(CoinFlipEvents.SendPlayerList);
        this.socketService.socket.off(CoinFlipEvents.BetTimeCountdown);
    }

    initializeEventListeners() {
        this.removeEventListeners();
        this.socketService.on(CoinFlipEvents.StartGame, () => {
            this.resetAttributes();
        });

        this.socketService.on(CoinFlipEvents.PreFlippingPhase, () => {
            this.gameState = CoinFlipGameState.PreFlippingPhase;
        });

        this.socketService.on(CoinFlipEvents.FlippingPhase, () => {
            this.gameState = CoinFlipGameState.FlippingPhase;
        });

        this.socketService.on(
            CoinFlipEvents.Results,
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

        this.socketService.on(
            CoinFlipEvents.SendPlayerList,
            (playerList: { heads: { name: string; bet: number }[]; tails: { name: string; bet: number }[] }) => {
                this.playerList = playerList;
            },
        );

        this.socketService.on(CoinFlipEvents.BetTimeCountdown, (time: number) => {
            // turning seconds into ms. no need for const.
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.time = time / 10;
        });
    }

    submitBet() {
        const dialogRef = this.matdialog.open(ConfirmationDialogComponent, {
            width: WIDTH_SIZE,
            panelClass: 'custom-container',
            data: `Voulez vous miser la somme de : ${this.betAmount} pièces?`,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (this.betAmount > 0 && this.betAmount % 1 === 0 && this.gameState === CoinFlipGameState.BettingPhase) {
                    this.socketService.send(
                        CoinFlipEvents.SubmitChoice,
                        { choice: this.selectedSide, bet: this.betAmount },
                        (submitStatus: boolean) => {
                            if (submitStatus) {
                                this.submitted = true;
                            } else {
                                this.matdialog.open(ErrorDialogComponent, {
                                    width: WIDTH_SIZE,
                                    panelClass: 'custom-container',
                                    data: {
                                        message:
                                            'Vous ne pouvez pas parier plus de pièces que celles détenues ou bien parier en dehors de la phase de mise!',
                                        reloadOnClose: false,
                                    },
                                });
                            }
                        },
                    );
                } else if (this.betAmount === 0 || this.betAmount % 1 !== 0) {
                    this.matdialog.open(ErrorDialogComponent, {
                        width: WIDTH_SIZE,
                        panelClass: 'custom-container',
                        data: { message: 'Vous ne pouvez pas parier 0 pièces.', reloadOnClose: false },
                    });
                } else if (this.gameState !== CoinFlipGameState.BettingPhase) {
                    this.errorOutsideBettingPhase();
                }
            }
        });
    }

    errorOutsideBettingPhase() {
        this.matdialog.open(ErrorDialogComponent, {
            width: WIDTH_SIZE,
            panelClass: 'custom-container',
            data: { message: 'Vous ne pouvez pas parier en dehors de la phase de mise.', reloadOnClose: false },
        });
    }

    updateBetAmount(value: number) {
        if (value < 0 || typeof value !== 'number') {
            return Number(0);
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
