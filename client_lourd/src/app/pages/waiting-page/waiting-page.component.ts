import { Location } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { moveDownAnimation, moveUpAnimation, playerJoinAnimation, playerLeftAnimation } from '@app/animations/animation';
import { START_GAME_COUNTDOWN } from '@app/constants/constants';
import { AppRoute, ConfirmationMessage } from '@app/constants/enum-class';
import { User } from '@app/interfaces/user';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { WaitingPageService } from '@app/services/waiting-room-services/waiting-page.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './waiting-page.component.html',
    styleUrls: ['./waiting-page.component.scss'],
    animations: [playerJoinAnimation, playerLeftAnimation, moveUpAnimation, moveDownAnimation],
})
export class WaitingPageComponent implements OnDestroy {
    name: string = '';

    private hasTimerEnded: boolean = false;
    private isorganizerDisconnected: boolean = false;
    private isplayerBanned: boolean = false;

    private bannedSubscription: Subscription;
    private organizorDisconnectedSub: Subscription;
    private timerEndSubscription: Subscription;

    // constructeur a 4 parametres permis selon les charges et le prof, etant donne la nature des attributs
    // eslint-disable-next-line max-params
    constructor(
        private messageHandler: MessageHandlerService,
        private router: Router,
        private waitingPageService: WaitingPageService,
        private location: Location,
    ) {
        this.handleSocketSubscriptions();
        this.waitingPageService.setupSockets();
        this.waitingPageService.playerName.subscribe((value: User | null) => {
            if (value) {
                this.name = value.username;
            }
        });
    }

    get roomId() {
        return this.waitingPageService.roomId;
    }

    get isOrganizer() {
        return this.waitingPageService.isOrganizer;
    }

    get players() {
        return this.waitingPageService.players;
    }

    get gameLocked() {
        return this.waitingPageService.gameLocked;
    }

    get gameTitle() {
        return this.waitingPageService.gameTitle;
    }

    get time(): number | null {
        return this.waitingPageService.time;
    }

    get isPlayersListEmpty(): boolean {
        return this.waitingPageService.isPlayersListEmpty;
    }

    openQrCode() {
        this.waitingPageService.openQrCode();
    }

    ngOnDestroy() {
        this.handleRouteNavigation();
        this.waitingPageService.clearSockets();
        this.organizorDisconnectedSub.unsubscribe();
        this.bannedSubscription.unsubscribe();
        this.timerEndSubscription.unsubscribe();
    }

    trackByPlayer(
        index: number,
        player: {
            name: string;
            avatar: string;
            banner: string;
        },
    ) {
        return player.name;
    }
    onPopOutDone() {
        this.waitingPageService.onPopOutDone();
    }

    toggleGameLock() {
        this.waitingPageService.toggleGameLock();
    }

    startGame() {
        this.waitingPageService.startGameCountdown(START_GAME_COUNTDOWN);
    }

    leaveWaitingPageAsPlayer() {
        this.waitingPageService.leaveWaitingPageAsPlayer();
        console.log('leaving as player');
        this.router.navigate([AppRoute.HOME]);
    }

    leaveWaitingPageAsOrganizor(): void {
        this.waitingPageService.leaveWaitingPageAsOrganizor();
        console.log('leaving as organizer');
        this.router.navigate([AppRoute.HOME]);
    }

    abandonAsOrganizer() {
        this.messageHandler.confirmationDialog(ConfirmationMessage.AbandonLobby, () => {
            this.leaveWaitingPageAsOrganizor();
        });
    }

    banPlayer(playerName: string) {
        this.messageHandler.confirmationDialog(ConfirmationMessage.BanPlayer, () => this.banPlayerCallback(playerName));
    }

    private banPlayerCallback(playerName: string) {
        this.waitingPageService.banPlayer(playerName);
    }

    private handleRouteNavigation() {
        const currentPath = this.location.path();
        if (this.roomId) {
            if (this.handleOrganizerRouteNavigation(currentPath)) {
                this.leaveWaitingPageAsOrganizor();
            } else if (this.handlePlayerRouteNavigation(currentPath)) {
                this.leaveWaitingPageAsPlayer();
            }
        }
    }

    private handleOrganizerRouteNavigation(currentPath: string): boolean {
        const isPathChangedExceptNextPage = currentPath !== AppRoute.ORGANIZER;
        const isPathChangedBeforeGameStart = currentPath === AppRoute.ORGANIZER && !this.hasTimerEnded;
        return this.isOrganizer && (isPathChangedBeforeGameStart || isPathChangedExceptNextPage);
    }

    private handlePlayerRouteNavigation(currentPath: string): boolean {
        const isPathChangedExceptNextPage = currentPath !== AppRoute.GAME;
        const isPathChangedBeforeGameStart = currentPath === AppRoute.GAME && !this.hasTimerEnded;
        const isPlayerAlreadyLeft = this.isorganizerDisconnected || this.isplayerBanned;
        return !this.isOrganizer && (isPathChangedBeforeGameStart || isPathChangedExceptNextPage) && !isPlayerAlreadyLeft;
    }

    private popUpErrorDialog(messageToShow: string, route: string) {
        this.router.navigate([route]);
        this.messageHandler.popUpErrorDialog(messageToShow);
    }

    private handleSocketSubscriptions() {
        this.organizerDisconnectSubscription();
        this.bannedPlayerSubsription();
        this.startGameSubscription();
    }

    private organizerDisconnectSubscription() {
        this.organizorDisconnectedSub = this.waitingPageService.organizorDisconnect$.subscribe((hasDisconnected: boolean) => {
            if (hasDisconnected) {
                this.isorganizerDisconnected = true;
                this.organizorHasDisconnected();
            }
        });
    }
    private bannedPlayerSubsription() {
        this.bannedSubscription = this.waitingPageService.bannedPlayer$.subscribe(() => {
            this.popUpErrorDialog("Vous avez été banni de la salle d'attente", AppRoute.JOINGAME);
            this.isplayerBanned = true;
        });
    }

    private startGameSubscription() {
        this.timerEndSubscription = this.waitingPageService.timerEnd$.subscribe((timerEnd: boolean) => {
            if (timerEnd) {
                this.navigateToGame();
                this.hasTimerEnded = true;
            }
        });
    }

    private organizorHasDisconnected() {
        this.popUpErrorDialog("L'organisateur a quitté la salle d'attente", AppRoute.HOME);
    }

    private navigateToGame() {
        if (this.isOrganizer) {
            this.router.navigate([AppRoute.ORGANIZER]);
        } else {
            this.router.navigate([AppRoute.GAME]);
        }
    }
}
