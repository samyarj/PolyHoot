import { AfterContentChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Lobby } from '@app/interfaces/lobby';
import { JoinGameService } from '@app/services/game-services/join-game-service/join-game.service';
import { Observer, Subscription } from 'rxjs';

@Component({
    selector: 'app-join-game-page',
    templateUrl: './join-game-page.component.html',
    styleUrls: ['./join-game-page.component.scss'],
})
export class JoinGamePageComponent implements OnDestroy, OnInit, AfterContentChecked {
    @ViewChild('playerNameField') playerNameField: ElementRef<HTMLInputElement>;

    title: string = 'Joindre une partie';
    gameId: string = '';
    playerName: string = '';
    lobbys: Lobby[];
    lobbyObserver: Partial<Observer<Lobby[]>> = {
        next: (lobbys: Lobby[]) => {
            console.log(lobbys);
            this.lobbys = lobbys;
        },
    };
    private lobbysSubscription: Subscription;
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

    ngOnInit() {
        this.lobbysSubscription = this.joinGameService.lobbysObservable.subscribe(this.lobbyObserver);
        this.joinGameService.getAllLobbys();
    }

    ngOnDestroy() {
        this.joinGameService.resetService();
        if (this.lobbysSubscription) this.lobbysSubscription.unsubscribe();
    }

    ngAfterContentChecked() {
        if (this.gameIdValidated) {
            this.focusPlayerNameField();
        }
    }

    validGameId(roomId?: string) {
        this.gameId = roomId || this.gameId;
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
        this.gameId = '';
    }

    private focusPlayerNameField() {
        if (this.playerNameField && this.playerNameField.nativeElement) {
            this.playerNameField.nativeElement.focus();
        }
    }
}
