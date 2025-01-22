import { AfterContentChecked, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { JoinGameService } from '@app/services/game-services/join-game-service/join-game.service';

@Component({
    selector: 'app-join-game-page',
    templateUrl: './join-game-page.component.html',
    styleUrls: ['./join-game-page.component.scss'],
})
export class JoinGamePageComponent implements OnDestroy, AfterContentChecked {
    @ViewChild('playerNameField') playerNameField: ElementRef<HTMLInputElement>;

    title: string = 'Joindre une partie';
    gameId: string = '';
    playerName: string = '';

    constructor(private joinGameService: JoinGameService) {}

    get popUpMessage() {
        return this.joinGameService.popUpMessage;
    }

    get gameIdValidated() {
        return this.joinGameService.gameIdValidated;
    }

    get wrongPin() {
        return this.joinGameService.wrongPin;
    }

    ngOnDestroy() {
        this.joinGameService.resetService();
    }

    ngAfterContentChecked() {
        if (this.gameIdValidated) {
            this.focusPlayerNameField();
        }
    }

    validGameId() {
        this.joinGameService.validGameId(this.gameId);
    }

    joinGame() {
        this.joinGameService.joinGame(this.gameId, this.playerName);
    }

    redirectToPage(page: string) {
        this.joinGameService.redirectToPage(page);
    }

    redirectToGameAcces() {
        this.joinGameService.updateGameIdValidated(false);
        this.playerName = '';
    }

    private focusPlayerNameField() {
        if (this.playerNameField && this.playerNameField.nativeElement) {
            this.playerNameField.nativeElement.focus();
        }
    }
}
