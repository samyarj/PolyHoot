import { Injectable } from '@angular/core';
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
    constructor(private authService: AuthService) {
        this.handleUserSockets();
        this.handleGameSockets();
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

    private handleUserSockets() {
        this.handlePlayerLeft();
        this.handleJoinGameSuccess();
        this.handleBanPlayer();
        this.handleOrganizerDisconnect();
    }

    private handleGameSockets() {
        this.handleToggleGameLock();
        this.handleCountdownTimerValue();
        this.handleCountdownEnd();
        this.handleGameTitle();
    }

    private handlePlayerLeft() {
        this.socketService.on<{
            playersInfo: {
                name: string;
                avatar: string;
                banner: string;
            }[];
            roomId: string;
        }>(GameEvents.PlayerLeft, ({ playersInfo }) => {
            this.players = playersInfo;
        });
    }

    private handleJoinGameSuccess() {
        this.socketService.on<{
            playersInfo: {
                name: string;
                avatar: string;
                banner: string;
            }[];
            roomId: string;
        }>(JoinEvents.JoinSuccess, ({ playersInfo }) => {
            this.players = playersInfo;
            this.isPlayersListEmpty = false;
        });
    }

    private handleBanPlayer() {
        this.socketService.on(GameEvents.PlayerBanned, () => {
            this.bannedPlayerSource.next(true);
            this.resetAttributes();
        });
    }

    private handleOrganizerDisconnect() {
        this.socketService.on(DisconnectEvents.OrganizerHasLeft, () => {
            this.organizorDisconnectSource.next(true);
            this.resetAttributes();
        });
    }

    private handleToggleGameLock() {
        this.socketService.on<{ isLocked: boolean; roomId: string }>(GameEvents.AlertLockToggled, ({ isLocked }) => {
            this.gameLocked = isLocked;
        });
    }

    private handleCountdownTimerValue() {
        this.socketService.on(TimerEvents.GameCountdownValue, (time: number) => {
            this.time = time;
        });
    }

    private handleCountdownEnd() {
        this.socketService.on(TimerEvents.GameCountdownEnd, () => {
            this.timerEndSource.next(true);
            if (this.isOrganizer) this.startGame();
            this.resetAttributes();
        });
    }

    private handleGameTitle() {
        this.socketService.on(GameEvents.Title, (title: string) => {
            this.gameTitle = title;
        });
    }

    private resetAttributes() {
        this.players = [];
        this.gameLocked = false;
        this.time = null;
        this.gameTitle = '';
    }
}
