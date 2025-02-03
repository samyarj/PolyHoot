import { Injectable } from '@angular/core';
import { DisconnectEvents, GameEvents, JoinEvents, TimerEvents } from '@app/constants/enum-class';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WaitingPageService {
    players: string[] = [];
    gameLocked = false;
    isInitialized = false;
    time: number | null;
    gameTitle: string;

    bannedPlayerSource = new Subject<boolean>();
    bannedPlayer$ = this.bannedPlayerSource.asObservable();

    organizorDisconnectSource = new Subject<boolean>();
    organizorDisconnect$ = this.organizorDisconnectSource.asObservable();

    timerEndSource = new Subject<boolean>();
    timerEnd$ = this.timerEndSource.asObservable();

    constructor(private socketService: SocketClientService) {}

    get playerName() {
        return this.socketService.playerName;
    }

    get isOrganizer() {
        return this.socketService.isOrganizer;
    }

    get isRandomMode() {
        return this.socketService.isRandomMode;
    }

    get roomId() {
        return this.socketService.roomId;
    }

    toggleGameLock() {
        this.socketService.send(GameEvents.ToggleLock);
    }

    leaveWaitingPageAsOrganizor() {
        this.socketService.isRandomMode = false;
        this.socketService.send(DisconnectEvents.OrganizerDisconnected);
        this.resetAttributes();
    }

    leaveWaitingPageAsPlayer() {
        this.socketService.isRandomMode = false;
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

    handleSocketEvents() {
        if (!this.isInitialized) {
            this.handleUserSockets();
            this.handleGameSockets();
            this.isInitialized = true;
        }
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
        this.socketService.on<string[]>(GameEvents.PlayerLeft, (playersNames) => {
            this.players = playersNames;
        });
    }

    private handleJoinGameSuccess() {
        this.socketService.on<string[]>(JoinEvents.JoinSuccess, (playersNames) => {
            this.players = playersNames;
        });
    }

    private handleBanPlayer() {
        this.socketService.on(GameEvents.PlayerBanned, () => {
            this.socketService.isRandomMode = false;
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
        this.socketService.on<boolean>(GameEvents.AlertLockToggled, (isLocked) => {
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
            if (this.isOrganizer || this.isRandomMode) this.startGame();
            this.resetAttributes();
        });
    }

    private handleGameTitle() {
        this.socketService.on(GameEvents.Title, (title: string) => {
            this.gameTitle = title;
            if (title === 'Mode aléatoire') {
                this.socketService.isRandomMode = true;
            } else this.socketService.isRandomMode = false;
        });
    }

    private resetAttributes() {
        this.players = [];
        this.gameLocked = false;
        this.time = null;
        this.gameTitle = '';
    }
}
