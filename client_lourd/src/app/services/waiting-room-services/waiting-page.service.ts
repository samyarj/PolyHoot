import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QrCodePopInComponent } from '@app/components/general-elements/qr-code-pop-in/qr-code-pop-in.component';
import { DisconnectEvents, GameEvents, JoinEvents, TimerEvents } from '@app/constants/enum-class';
import { AuthService } from '@app/services/auth/auth.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WaitingPageService {
    players: {
        name: string;
        avatar: string;
        banner: string;
    }[] = [];
    gameLocked = false;
    time: number | null;
    gameTitle: string;

    bannedPlayerSource = new Subject<boolean>();
    bannedPlayer$ = this.bannedPlayerSource.asObservable();

    organizorDisconnectSource = new Subject<boolean>();
    organizorDisconnect$ = this.organizorDisconnectSource.asObservable();

    timerEndSource = new Subject<boolean>();
    timerEnd$ = this.timerEndSource.asObservable();

    isPlayersListEmpty: boolean = true;
    playerNameStr: string = '';

    private areSocketsInitialized: boolean = false;
    constructor(
        private authService: AuthService,
        private dialog: MatDialog,
    ) {
        this.authService.user$.subscribe({
            next: (user) => {
                if (user && user.username) this.playerNameStr = user.username;
                else this.playerNameStr = '';
            },
        });
    }

    get socketService() {
        return this.authService.getSocketService();
    }

    get playerName() {
        return this.authService.user$;
    }

    get isOrganizer() {
        return this.socketService.isOrganizer;
    }

    get roomId() {
        return this.socketService.roomId;
    }

    onPopOutDone() {
        this.isPlayersListEmpty = this.players.length === 0;
    }

    toggleGameLock() {
        this.socketService.send(GameEvents.ToggleLock);
    }

    leaveWaitingPageAsOrganizor() {
        this.socketService.send(DisconnectEvents.OrganizerDisconnected);
        this.resetAttributes();
    }

    leaveWaitingPageAsPlayer() {
        this.socketService.send(DisconnectEvents.Player);
        this.resetAttributes();
    }

    banPlayer(playerName: string) {
        this.socketService.send(GameEvents.PlayerBan, playerName);
    }

    startGame() {
        this.socketService.send(GameEvents.StartGame);
    }

    startGameCountdown(time: number) {
        this.socketService.send(GameEvents.StartGameCountdown, time);
    }

    openQrCode() {
        this.socketService.send(JoinEvents.TitleRequest, (title: string) => {
            this.gameTitle = title;
            this.dialog.open(QrCodePopInComponent, {
                width: '40vw',
                backdropClass: 'quiz-info-popup',
                panelClass: 'custom-container',
                data: {
                    type: 'join-game',
                    roomId: this.roomId,
                    gameName: this.playerNameStr === '' ? "Salle d'attente" : `Salle de ${this.playerNameStr}`,
                },
            });
        });
    }

    setupSockets() {
        if (!this.areSocketsInitialized) {
            this.handleUserSockets();
            this.handleGameSockets();
            this.areSocketsInitialized = true;
        }
    }

    clearSockets() {
        this.removeUserSockets();
        this.removeGameSockets();
        this.areSocketsInitialized = false;
    }

    private handleUserSockets() {
        this.handlePlayerLeft();
        this.handleJoinGameSuccess();
        this.handleBanPlayer();
        this.handleOrganizerDisconnect();
    }

    private removeUserSockets() {
        this.removePlayerLeft();
        this.removeJoinGameSuccess();
        this.removeBanPlayer();
        this.removeOrganizerDisconnect();
    }

    private handleGameSockets() {
        this.handleToggleGameLock();
        this.handleCountdownTimerValue();
        this.handleCountdownEnd();
        this.handleGameTitle();
    }

    private removeGameSockets() {
        this.removeToggleGameLock();
        this.removeCountdownTimerValue();
        this.removeCountdownEnd();
        this.removeGameTitle();
    }

    private handlePlayerLeft() {
        this.socketService.on<
            {
                name: string;
                avatar: string;
                banner: string;
            }[]
        >(GameEvents.PlayerLeft, (playersInfo) => {
            this.players = playersInfo;
        });
    }

    private removePlayerLeft() {
        this.socketService.socket.off(GameEvents.PlayerLeft);
    }

    private handleJoinGameSuccess() {
        this.socketService.on<
            {
                name: string;
                avatar: string;
                banner: string;
            }[]
        >(JoinEvents.JoinSuccess, (playersInfo) => {
            this.players = playersInfo;
            this.isPlayersListEmpty = false;
        });
    }

    private removeJoinGameSuccess() {
        this.socketService.socket.off(JoinEvents.JoinSuccess);
    }

    private handleBanPlayer() {
        this.socketService.on(GameEvents.PlayerBanned, () => {
            this.bannedPlayerSource.next(true);
            this.resetAttributes();
        });
    }

    private removeBanPlayer() {
        this.socketService.socket.off(GameEvents.PlayerBanned);
    }

    private handleOrganizerDisconnect() {
        this.socketService.on(DisconnectEvents.OrganizerHasLeft, () => {
            this.organizorDisconnectSource.next(true);
            this.resetAttributes();
        });
    }

    private removeOrganizerDisconnect() {
        this.socketService.socket.off(DisconnectEvents.OrganizerHasLeft);
    }

    private handleToggleGameLock() {
        this.socketService.on<boolean>(GameEvents.AlertLockToggled, (isLocked) => {
            this.gameLocked = isLocked;
        });
    }

    private removeToggleGameLock() {
        this.socketService.socket.off(GameEvents.AlertLockToggled);
    }

    private handleCountdownTimerValue() {
        this.socketService.on(TimerEvents.GameCountdownValue, (time: number) => {
            this.time = time;
        });
    }

    private removeCountdownTimerValue() {
        this.socketService.socket.off(TimerEvents.GameCountdownValue);
    }

    private handleCountdownEnd() {
        this.socketService.on(TimerEvents.GameCountdownEnd, () => {
            this.timerEndSource.next(true);
            this.startGame();
            this.resetAttributes();
        });
    }

    private removeCountdownEnd() {
        this.socketService.socket.off(TimerEvents.GameCountdownEnd);
    }

    private handleGameTitle() {
        this.socketService.on(GameEvents.Title, (title: string) => {
            this.gameTitle = title;
        });
    }

    private removeGameTitle() {
        this.socketService.socket.off(GameEvents.Title);
    }

    private resetAttributes() {
        this.players = [];
        this.gameLocked = false;
        this.time = null;
        this.gameTitle = '';
    }
}
