import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TIMER_VALUE } from '@app/constants/constants';
import { JoinErrors, JoinEvents } from '@app/constants/enum-class';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';

@Injectable({
    providedIn: 'root',
})
export class JoinGameService {
    popUpMessage: string = '';
    gameIdValidated: boolean = false;
    wrongPin: boolean = false;

    constructor(
        private socketService: SocketClientService,
        private router: Router,
    ) {}

    validGameId(gameId: string) {
        this.socketService.send(JoinEvents.ValidateGameId, gameId);
        this.handleIdValidation();
    }

    joinGame(gameId: string, playerName: string) {
        const data = { gameId, playerName };
        this.socketService.send(JoinEvents.Join, data);
        this.handleJoinGame(gameId, playerName);
    }

    redirectToPage(page: string) {
        this.router.navigate([page]);
    }

    updateGameIdValidated(value: boolean) {
        this.gameIdValidated = value;
    }

    resetService() {
        this.popUpMessage = '';
        this.gameIdValidated = false;
        this.wrongPin = false;
    }

    private handleIdValidation() {
        this.handleValidId();
        this.handleInvalidId();
        this.handleRoomLocked();
    }

    private handleJoinGame(gameId: string, playerName: string) {
        this.handleCanJoinGame(gameId, playerName);
        this.handleExistingName();
        this.handleBannedName();
        this.handleOrganizerName();
        this.handleCantJoinGame();
        this.handleRoomLocked();
    }

    private handleValidId() {
        this.socketService.on(JoinEvents.ValidId, () => {
            this.gameIdValidated = true;
            this.wrongPin = false;
            this.popUpMessage = '';
        });
    }

    private handleInvalidId() {
        this.socketService.on(JoinErrors.InvalidId, () => {
            this.gameIdValidated = false;
            this.popUpMessage = "Le code d'accès est invalide. Essayez à nouveau.";
            this.showPopUp();
        });
    }

    private handleRoomLocked() {
        this.socketService.on(JoinErrors.RoomLocked, () => {
            this.gameIdValidated = false;
            this.popUpMessage = "La partie est verrouillée. Veuillez demander l'accès à l'organisateur ou essayez un différent code.";
            this.showPopUp();
        });
    }

    private handleCanJoinGame(gameId: string, playerName: string) {
        this.socketService.on(JoinEvents.CanJoin, () => {
            this.socketService.roomId = gameId;
            this.socketService.playerName = playerName;
            this.socketService.canChat = true;
            this.socketService.isOrganizer = false;
            this.redirectToPage('/waiting');
        });
    }

    private handleExistingName() {
        this.socketService.on(JoinErrors.ExistingName, () => {
            this.popUpMessage = 'Ce nom est déjà utilisé. Veuillez choisir un autre nom.';
            this.showPopUp();
        });
    }

    private handleBannedName() {
        this.socketService.on(JoinErrors.BannedName, () => {
            this.popUpMessage = 'Ce nom est banni. Veuillez choisir un autre nom.';
            this.showPopUp();
        });
    }

    private handleOrganizerName() {
        this.socketService.on(JoinErrors.OrganizerName, () => {
            this.popUpMessage = "Vous ne pouvez pas vous appeler 'organisateur'. Veuillez choisir un autre nom.";
            this.showPopUp();
        });
    }

    private handleCantJoinGame() {
        this.socketService.on(JoinErrors.Generic, () => {
            this.popUpMessage = 'Ce nom est invalide. Veuillez choisir un autre nom.';
            this.showPopUp();
        });
    }

    private showPopUp() {
        this.wrongPin = true;
        setTimeout(() => {
            this.wrongPin = false;
            this.popUpMessage = '';
        }, TIMER_VALUE);
    }
}
