import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TIMER_VALUE } from '@app/constants/constants';
import { GameEvents, JoinErrors, JoinEvents } from '@app/constants/enum-class';
import { Lobby } from '@app/interfaces/lobby';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class JoinGameService {
    popUpMessage: string = '';
    canAccessGame: boolean = false;
    wrongGameId: boolean = false;
    gameLocked = false;
    lobbys: Lobby[] = [];
    lobbysSource: Subject<Lobby[]>;
    lobbysObservable: Observable<Lobby[]>;
    user$: Observable<User | null>;
    isJoiningGame: boolean = false;
    private areSocketsInitialized: boolean = false;
    private username: string;
    private socketService: SocketClientService;
    private hasJoinedGame: boolean = false; // Add this variable
    constructor(
        private router: Router,
        private authService: AuthService,
        private toastr: ToastrService,
    ) {
        this.socketService = this.authService.getSocketService();
        this.lobbysSource = new Subject<Lobby[]>();
        this.lobbysObservable = this.lobbysSource.asObservable();
        this.user$ = this.authService.user$;
        this.user$.subscribe((user) => {
            if (user) {
                this.username = user.username;
            }
        });
    }

    validGameId(gameId: string) {
        if (!this.isJoiningGame) {
            this.isJoiningGame = true;
            this.socketService.send(JoinEvents.ValidateGameId, gameId);
        }
    }

    redirectToPage(page: string) {
        this.router.navigate([page]);
    }

    resetService() {
        this.popUpMessage = '';
        this.canAccessGame = false;
        this.wrongGameId = false;
        this.isJoiningGame = false;
    }

    getAllLobbys() {
        this.socketService.send(GameEvents.GetCurrentGames);
    }

    hasJoined(): boolean {
        return this.hasJoinedGame;
    }

    setUpSockets() {
        if (!this.areSocketsInitialized) {
            this.handleLobbys();
            this.handleJoinGame();
            this.handleIdValidation();
            this.areSocketsInitialized = true;
        }
    }

    clearSockets() {
        this.removeLobbys();
        this.removeIdValidation();
        this.removeJoinGame();
        this.areSocketsInitialized = false;
    }

    private handleLobbys() {
        this.handleLobbyCreation();
        this.handleLobbyDeletion();
        this.displayActiveLobbys();
        this.handleLockedLobby();
        this.handleUpdateLobby();
    }

    private removeLobbys() {
        this.removeLobbyCreation();
        this.removeLobbyDeletion();
        this.removeDisplayActiveLobbys();
        this.removeLockedLobby();
        this.removeUpdateLobby();
    }

    private handleIdValidation() {
        this.handleValidId();
        this.handleInvalidId();
        this.handleRoomLocked();
    }

    private removeIdValidation() {
        this.removeValidId();
        this.removeInvalidId();
        this.removeRoomLocked();
    }

    private handleJoinGame() {
        this.handleCanJoinGame();
        this.handleBannedName();
        this.handleCantJoinGame();
        this.handleRoomLocked();
    }

    private removeJoinGame() {
        this.removeCanJoinGame();
        this.removeBannedName();
        this.removeCantJoinGame();
        this.removeRoomLocked();
    }

    private handleValidId() {
        this.socketService.on(JoinEvents.ValidId, (gameId: string) => {
            this.wrongGameId = false;
            this.popUpMessage = '';
            const data = { gameId, playerName: this.username };
            this.socketService.send(JoinEvents.Join, data);
        });
    }

    private removeValidId() {
        this.socketService.socket.off(JoinEvents.ValidId);
    }

    private handleInvalidId() {
        this.socketService.on(JoinErrors.InvalidId, () => {
            this.canAccessGame = false;
            this.popUpMessage = "Le code d'accès est invalide. Essayez à nouveau.";
            this.isJoiningGame = false;
            this.showPopUp();
        });
    }

    private removeInvalidId() {
        this.socketService.socket.off(JoinErrors.InvalidId);
    }

    private handleRoomLocked() {
        this.socketService.on(JoinErrors.RoomLocked, () => {
            this.canAccessGame = false;
            this.popUpMessage = "La partie est verrouillée. Veuillez demander l'accès à l'organisateur ou essayez un différent code.";
            this.showPopUp();
            this.isJoiningGame = false;
        });
    }

    private removeRoomLocked() {
        this.socketService.socket.off(JoinErrors.RoomLocked);
    }

    private handleCanJoinGame() {
        this.socketService.on(JoinEvents.CanJoin, (data: { playerName: string; gameId: string }) => {
            this.socketService.roomId = data.gameId;
            this.socketService.playerName = data.playerName;
            this.socketService.isOrganizer = false;
            this.hasJoinedGame = true; // Set to true when join game is successful
            this.redirectToPage('/waiting');
            this.isJoiningGame = false;
        });
    }

    private removeCanJoinGame() {
        this.socketService.socket.off(JoinEvents.CanJoin);
    }

    private handleBannedName() {
        this.socketService.on(JoinErrors.BannedName, () => {
            this.isJoiningGame = false;
            this.popUpMessage = 'Vous avez été banni de cette partie, vous ne pouvez pas la rejoindre.';
            this.showPopUp();
        });
    }

    private removeBannedName() {
        this.socketService.socket.off(JoinErrors.BannedName);
    }

    private handleCantJoinGame() {
        this.socketService.on(JoinErrors.Generic, () => {
            this.popUpMessage = 'Une erreur fait en sorte que vous ne pouvez pas joindre la partie';
            this.showPopUp();
            this.isJoiningGame = false;
        });
    }

    private removeCantJoinGame() {
        this.socketService.socket.off(JoinErrors.Generic);
    }

    private handleLobbyCreation() {
        this.socketService.on(JoinEvents.LobbyCreated, (lobbyInfos: Lobby) => {
            this.lobbys.push(lobbyInfos);
            this.lobbysSource.next(this.lobbys);
        });
    }

    private removeLobbyCreation() {
        this.socketService.socket.off(JoinEvents.LobbyCreated);
    }

    private handleLobbyDeletion() {
        this.socketService.on(GameEvents.End, (roomId: string) => {
            this.lobbys = this.lobbys.filter((lobby) => lobby.roomId !== roomId);
            this.lobbysSource.next(this.lobbys);
        });
    }

    private removeLobbyDeletion() {
        this.socketService.socket.off(GameEvents.End);
    }

    private displayActiveLobbys() {
        this.socketService.on(GameEvents.GetCurrentGames, (currentGames: []) => {
            this.lobbys = currentGames;
            this.lobbysSource.next(this.lobbys);
        });
    }

    private removeDisplayActiveLobbys() {
        this.socketService.socket.off(GameEvents.GetCurrentGames);
    }

    private handleLockedLobby() {
        this.socketService.on<{ isLocked: boolean; roomId: string }>(GameEvents.LobbyToggledLock, ({ isLocked, roomId }) => {
            this.lobbys = this.lobbys.map((lobby) => (lobby.roomId === roomId ? { ...lobby, isLocked } : lobby));
            this.lobbysSource.next(this.lobbys);
        });
    }

    private removeLockedLobby() {
        this.socketService.socket.off(GameEvents.LobbyToggledLock);
    }

    private handleUpdateLobby() {
        this.socketService.on<string>(JoinEvents.PlayerJoined, (roomId) => {
            this.lobbys = this.lobbys.map((lobby) => (lobby.roomId === roomId ? { ...lobby, nbPlayers: lobby.nbPlayers + 1 } : lobby));
            this.lobbysSource.next(this.lobbys);
        });
        this.socketService.on<string>(GameEvents.PlayerLeftLobby, (roomId) => {
            this.lobbys = this.lobbys.map((lobby) => (lobby.roomId === roomId ? { ...lobby, nbPlayers: lobby.nbPlayers - 1 } : lobby));
            this.lobbysSource.next(this.lobbys);
        });
    }

    private removeUpdateLobby() {
        this.socketService.socket.off(JoinEvents.PlayerJoined);
        this.socketService.socket.off(GameEvents.PlayerLeftLobby);
    }

    private showPopUp() {
        this.toastr.error(this.popUpMessage);
        this.wrongGameId = true;
        setTimeout(() => {
            this.wrongGameId = false;
            this.popUpMessage = '';
        }, TIMER_VALUE);
    }
}
