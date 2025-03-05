import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TIMER_VALUE } from '@app/constants/constants';
import { GameEvents, JoinErrors, JoinEvents } from '@app/constants/enum-class';
import { Lobby } from '@app/interfaces/lobby';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class JoinGameService {
    popUpMessage: string = '';
    gameIdValidated: boolean = false;
    wrongPin: boolean = false;
    gameLocked = false;
    lobbys: Lobby[] = [];
    lobbysSource: Subject<Lobby[]>;
    lobbysObservable: Observable<Lobby[]>;
    user$: Observable<User | null>;
    private username: string;
    private socketService: SocketClientService;

    constructor(
        private router: Router,
        private authService: AuthService,
    ) {
        this.socketService = this.authService.getSocketService();
        this.lobbysSource = new Subject<Lobby[]>();
        this.lobbysObservable = this.lobbysSource.asObservable();
        this.handleLobbys();
        this.user$ = this.authService.user$;
        this.user$.subscribe((user) => {
            if (user) {
                this.username = user.username;
            }
        });
    }

    validGameId(gameId: string) {
        this.socketService.send(JoinEvents.ValidateGameId, gameId);
        this.handleIdValidation(gameId);
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
    getAllLobbys() {
        this.socketService.send(GameEvents.GetCurrentGames);
    }
    private handleLobbys() {
        this.handleLobbyCreation();
        this.handleLobbyDeletion();
        this.displayActiveLobbys();
        this.handleLockedLobby();
        this.handleUpdateLobby();
    }
    private handleIdValidation(gameId: string) {
        this.handleValidId(gameId);
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

    private handleValidId(gameId: string) {
        this.socketService.on(JoinEvents.ValidId, () => {
            this.gameIdValidated = true;
            this.wrongPin = false;
            this.popUpMessage = '';
            this.joinGame(gameId, this.username);
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

    private handleLobbyCreation() {
        this.socketService.on(JoinEvents.LobbyCreated, (lobbyInfos: Lobby) => {
            this.lobbys.push(lobbyInfos);
            this.lobbysSource.next(this.lobbys);
        });
    }

    private handleLobbyDeletion() {
        this.socketService.on(GameEvents.End, (roomId: string) => {
            this.lobbys = this.lobbys.filter((lobby) => lobby.roomId !== roomId);
            this.lobbysSource.next(this.lobbys);
        });
    }

    private displayActiveLobbys() {
        this.socketService.on(GameEvents.GetCurrentGames, (currentGames: []) => {
            this.lobbys = currentGames;
            this.lobbysSource.next(this.lobbys);
        });
    }

    private handleLockedLobby() {
        this.socketService.on<{ isLocked: boolean; roomId: string }>(GameEvents.AlertLockToggled, ({ isLocked, roomId }) => {
            this.lobbys = this.lobbys.map((lobby) => (lobby.roomId === roomId ? { ...lobby, isLocked } : lobby));
            this.lobbysSource.next(this.lobbys);
        });
    }

    private handleUpdateLobby() {
        this.socketService.on<{ playerNames: string[]; roomId: string }>(JoinEvents.JoinSuccess, ({ roomId }) => {
            this.lobbys = this.lobbys.map((lobby) => (lobby.roomId === roomId ? { ...lobby, nbPlayers: lobby.nbPlayers + 1 } : lobby));
            this.lobbysSource.next(this.lobbys);
        });
        this.socketService.on<{ playerNames: string[]; roomId: string }>(GameEvents.PlayerLeft, ({ roomId }) => {
            this.lobbys = this.lobbys.map((lobby) => (lobby.roomId === roomId ? { ...lobby, nbPlayers: lobby.nbPlayers - 1 } : lobby));
            this.lobbysSource.next(this.lobbys);
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
