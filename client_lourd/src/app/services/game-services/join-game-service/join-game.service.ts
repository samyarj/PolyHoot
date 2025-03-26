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
        this.handleLobbys();
        this.handleJoinGame();
        this.handleIdValidation();
        this.user$ = this.authService.user$;
        this.user$.subscribe((user) => {
            if (user) {
                this.username = user.username;
            }
        });
    }

    validGameId(gameId: string) {
        this.socketService.send(JoinEvents.ValidateGameId, gameId);
    }

    redirectToPage(page: string) {
        this.router.navigate([page]);
    }

    resetService() {
        this.popUpMessage = '';
        this.canAccessGame = false;
        this.wrongGameId = false;
    }

    getAllLobbys() {
        this.socketService.send(GameEvents.GetCurrentGames);
    }

    hasJoined(): boolean {
        return this.hasJoinedGame;
    }

    private handleLobbys() {
        this.handleLobbyCreation();
        this.handleLobbyDeletion();
        this.displayActiveLobbys();
        this.handleLockedLobby();
        this.handleUpdateLobby();
    }

    private handleIdValidation() {
        this.handleValidId();
        this.handleInvalidId();
        this.handleRoomLocked();
    }

    private handleJoinGame() {
        this.handleCanJoinGame();
        this.handleBannedName();
        this.handleCantJoinGame();
        this.handleRoomLocked();
    }

    private handleValidId() {
        this.socketService.on(JoinEvents.ValidId, (gameId: string) => {
            this.wrongGameId = false;
            this.popUpMessage = '';
            const data = { gameId, playerName: this.username };
            this.socketService.send(JoinEvents.Join, data);
        });
    }

    private handleInvalidId() {
        this.socketService.on(JoinErrors.InvalidId, () => {
            this.canAccessGame = false;
            this.popUpMessage = "Le code d'accès est invalide. Essayez à nouveau.";
            this.showPopUp();
        });
    }

    private handleRoomLocked() {
        this.socketService.on(JoinErrors.RoomLocked, () => {
            this.canAccessGame = false;
            this.popUpMessage = "La partie est verrouillée. Veuillez demander l'accès à l'organisateur ou essayez un différent code.";
            this.showPopUp();
        });
    }

    private handleCanJoinGame() {
        this.socketService.on(JoinEvents.CanJoin, (data: { playerName: string; gameId: string }) => {
            this.socketService.roomId = data.gameId;
            this.socketService.playerName = data.playerName;
            this.socketService.isOrganizer = false;
            this.hasJoinedGame = true; // Set to true when join game is successful
            this.redirectToPage('/waiting');
        });
    }

    private handleBannedName() {
        this.socketService.on(JoinErrors.BannedName, () => {
            this.popUpMessage = 'Vous avez été banni de cette partie, vous ne pouvez pas la rejoindre.';
            this.showPopUp();
        });
    }

    private handleCantJoinGame() {
        this.socketService.on(JoinErrors.Generic, () => {
            this.popUpMessage = 'Une erreur fait en sorte que vous ne pouvez pas joindre la partie';
            this.showPopUp();
        });
    }

    private handleLobbyCreation() {
        this.socketService.on(JoinEvents.LobbyCreated, (lobbyInfos: Lobby) => {
            console.log('created');
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
        this.socketService.on<string>(JoinEvents.PlayerJoined, (roomId) => {
            console.log('123', roomId);
            this.lobbys = this.lobbys.map((lobby) => (lobby.roomId === roomId ? { ...lobby, nbPlayers: lobby.nbPlayers + 1 } : lobby));
            this.lobbysSource.next(this.lobbys);
        });
        this.socketService.on<{ playerNames: string[]; roomId: string }>(GameEvents.PlayerLeft, ({ roomId }) => {
            this.lobbys = this.lobbys.map((lobby) => (lobby.roomId === roomId ? { ...lobby, nbPlayers: lobby.nbPlayers - 1 } : lobby));
            this.lobbysSource.next(this.lobbys);
        });
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
