import { Location } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PlayingComponent } from '@app/components/playing/playing.component';
import { LAST_MODIFIED_INTERVAL } from '@app/constants/constants';
import { AppRoute } from '@app/constants/enum-class';
import { GameClientService } from '@app/services/game-services/game-client/game-client.service';
import { Subject, Subscription, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: '../../../components/playing/playing.component.html',
    styleUrls: ['../../../components/playing/playing.component.scss'],
})
export class GamePageComponent extends PlayingComponent implements OnDestroy {
    private lastModified = new Subject<void>();
    private subscriptions = new Subscription();
    private unsubscribe$ = new Subject<void>();
    private typingHasStopped = true;
    constructor(
        private router: Router,
        private gameClientService: GameClientService,
        private location: Location,
    ) {
        super();
        this.service = gameClientService;
        // cette fonction est appelee a chaque fois que la page est rechargee
        if (localStorage.getItem('navigatedFromUnload') === 'true') {
            this.onUnload();
            return;
        }
        this.gameClientService.getTitle();
        this.gameClientService.resetInformationFields();
        this.gameClientService.handleSockets();
        this.gameClientService.resetAttributes();
        this.gameClientService.playerPoints = 0;
        this.gameClientService.signalUserConnect();
        this.lastModified.pipe(debounceTime(LAST_MODIFIED_INTERVAL), takeUntil(this.unsubscribe$)).subscribe(() => {
            this.gameClientService.sendModifyUpdate(false);
            this.typingHasStopped = true;
        });
        const resetAnswer = this.gameClientService.clearAnswer.subscribe((clear) => {
            if (clear) {
                this.answer = '';
            }
        });
        this.subscriptions.add(resetAnswer);
    }

    override get isTesting() {
        return false;
    }

    override get quizReady() {
        return true;
    }

    override get gamePaused() {
        return this.gameClientService.gamePaused;
    }
    override get submitted() {
        return this.gameClientService.playerInfo.submitted;
    }
    override get quizTitle(): string {
        return this.gameClientService.quizTitle;
    }

    get showAnswers() {
        return this.gameClientService.showAnswers;
    }

    get pointsReceived() {
        return this.gameClientService.pointsReceived;
    }

    get userFirst() {
        return this.gameClientService.playerInfo.userFirst;
    }

    override get waitingForQuestion(): boolean {
        return this.gameClientService.playerInfo.waitingForQuestion;
    }

    override get choiceSelected(): boolean[] {
        return this.gameClientService.playerInfo.choiceSelected;
    }
    // J'ai remplace le window:unload par window:beforeunload pour que le localStorage soit modifie avant que la page soit dechargee
    @HostListener('window:beforeunload')
    handleBeforeUnload() {
        localStorage.setItem('navigatedFromUnload', 'true');
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        this.defaultKeyUpHandler(event);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        this.defaultKeyDownHandler(event);
    }

    ngOnDestroy() {
        // pour ne pas emettre un signal de deconnexion dans le cas ou on fait un refresh de la page car le serveur va deja
        // nous deconnecter et informer les autres avec la fonction handleDisconnect() dans general.gateway.ts
        const location = this.location.path();
        if (location !== AppRoute.RESULTS && this.gameClientService.roomId) {
            this.gameClientService.signalUserDisconnect();
            this.router.navigate([AppRoute.HOME]);
        } else if (location === AppRoute.RESULTS && this.gameClientService.shouldDisconnect && this.gameClientService.roomId) {
            this.gameClientService.signalUserDisconnect();
            this.router.navigate([AppRoute.HOME]);
        }
        this.gameClientService.resetAttributes();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.subscriptions.unsubscribe();
    }

    selectChoice(indexChoice: number) {
        this.gameClientService.selectChoice(indexChoice);
    }

    finalizeAnswer() {
        if (!this.submitted) {
            this.gameClientService.finalizeAnswer();
            if (this.currentQuestion.type === 'QRL') {
                this.gameClientService.sendAnswerForCorrection(this.answer);
            }
        }
    }

    abandonGame() {
        this.gameClientService.abandonGame();
    }

    textAreaModified(): void {
        if (this.typingHasStopped) {
            this.typingHasStopped = false;
            this.gameClientService.sendModifyUpdate(true);
        }
        this.lastModified.next();
    }

    private onUnload() {
        localStorage.removeItem('navigatedFromUnload');
        this.router.navigate([AppRoute.HOME]);
    }
}
