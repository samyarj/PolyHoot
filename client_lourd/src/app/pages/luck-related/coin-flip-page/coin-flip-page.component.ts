import { Component } from '@angular/core';
import { CoinFlipService } from '@app/services/luck-services/coin-flip.service';

@Component({
    selector: 'app-coin-flip-page',
    templateUrl: './coin-flip-page.component.html',
    styleUrls: ['./coin-flip-page.component.scss'],
})
export class CoinFlipPageComponent {
    constructor(private coinFlipService: CoinFlipService) {
        this.coinFlipService.getState();
    }

    get state() {
        return this.coinFlipService.gameState;
    }

    get selectedSide() {
        return this.coinFlipService.selectedSide;
    }

    get winningSide() {
        return this.coinFlipService.winningSide;
    }

    get history() {
        return this.coinFlipService.history;
    }

    get betAmount() {
        return this.coinFlipService.betAmount;
    }

    get submitted() {
        return this.coinFlipService.submitted;
    }
    get time() {
        return this.coinFlipService.time;
    }
    get playerList() {
        return this.coinFlipService.playerList;
    }
    set betAmount(value: number) {
        this.coinFlipService.betAmount = value;
    }

    selectSide(side: string) {
        this.coinFlipService.selectSide(side);
    }

    submitBet() {
        this.coinFlipService.submitBet();
    }

    updateBetAmount(value: number) {
        return this.coinFlipService.updateBetAmount(value);
    }

    increaseBet(amount: number) {
        this.coinFlipService.increaseBet(amount);
    }
}
