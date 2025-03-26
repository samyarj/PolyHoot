import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopUpCreationComponent } from '@app/components/general-elements/pop-up-creation/pop-up-creation.component';
import { Lobby } from '@app/interfaces/lobby';
import { Quiz } from '@app/interfaces/quiz';
import { JoinGameService } from '@app/services/game-services/join-game-service/join-game.service';
import { Observer, Subscription } from 'rxjs';

@Component({
    selector: 'app-join-game-page',
    templateUrl: './join-game-page.component.html',
    styleUrls: ['./join-game-page.component.scss'],
})
export class JoinGamePageComponent implements OnDestroy, OnInit {
    @ViewChild('playerNameField') playerNameField: ElementRef<HTMLInputElement>;

    title: string = 'Joindre une partie';
    gameId: string = '';
    playerName: string = '';
    lobbys: Lobby[];
    lobbyObserver: Partial<Observer<Lobby[]>> = {
        next: (lobbys: Lobby[]) => {
            this.lobbys = lobbys;
        },
    };

    private lobbysSubscription: Subscription;
    constructor(
        private joinGameService: JoinGameService,
        private dialog: MatDialog,
    ) {
        this.joinGameService.setUpSockets();
    }

    get popUpMessage() {
        return this.joinGameService.popUpMessage;
    }

    get canAccessGame() {
        return this.joinGameService.canAccessGame;
    }

    get wrongGameId() {
        return this.joinGameService.wrongGameId;
    }

    ngOnInit() {
        this.lobbysSubscription = this.joinGameService.lobbysObservable.subscribe(this.lobbyObserver);
        this.joinGameService.getAllLobbys();
        this.gameId = '';
    }

    ngOnDestroy() {
        this.joinGameService.clearSockets();
        this.joinGameService.resetService();
        if (this.lobbysSubscription) this.lobbysSubscription.unsubscribe();
    }

    validGameId(roomId?: string) {
        if (roomId) {
            this.joinGameService.validGameId(roomId);
        } else {
            this.gameId = roomId || this.gameId;
            this.joinGameService.validGameId(this.gameId);
        }
    }

    redirectToPage(page: string) {
        this.joinGameService.redirectToPage(page);
    }

    openQuizInfoDialog(quiz: Quiz) {
        this.dialog.open(PopUpCreationComponent, {
            width: '50%',
            backdropClass: 'quiz-info-popup',
            panelClass: 'custom-container',
            data: { quiz, isCreate: false },
        });
    }
}
