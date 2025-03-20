import { Location } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoute, QRLGrade } from '@app/constants/enum-class';
import { OrganizerService } from '@app/services/game-services/organizer/organizer.service';

@Component({
    selector: 'app-organizer-page',
    templateUrl: './organizer-page.component.html',
    styleUrls: ['./organizer-page.component.scss'],
})
export class OrganizerPageComponent implements OnDestroy {
    sortId: number = 1;
    constructor(
        private organizerService: OrganizerService,
        private router: Router,
        private location: Location,
    ) {
        // cette fonction est appelee a chaque fois que la page est rechargee
        // correction d'un bug car on veut pas que signalUserConnect soit appeler si on ne fait
        // que reload la page
        if (localStorage.getItem('navigatedFromUnload') === 'true') {
            this.onUnload();
            return;
        }
        this.organizerService.initializeAttributes();
        this.organizerService.handleSockets();
        this.organizerService.signalUserConnect();
    }
    get currentQuestionIndex() {
        return this.organizerService.gameInfo.currentQuestionIndex;
    }
    get gameStatus() {
        return this.organizerService.gameStatus;
    }
    get answersArray() {
        return this.organizerService.answersQRL;
    }
    get currentIndex() {
        return this.organizerService.gameInfo.currentIndex;
    }
    get playerBeingCorrected() {
        if (this.answersArray[this.currentIndex]) {
            return this.answersArray[this.currentIndex].playerName;
        }
        return '';
    }
    get answerBeingCorrected() {
        if (this.answersArray[this.currentIndex]) {
            return this.answersArray[this.currentIndex].playerAnswer;
        }
        return '';
    }

    get alertMode() {
        return this.organizerService.gameModifiers.alertMode;
    }
    get question() {
        return this.organizerService.currentQuestion;
    }

    get timeLeft() {
        return this.organizerService.gameInfo.time;
    }

    get gamePaused(): boolean {
        return this.organizerService.gameModifiers.paused;
    }

    get questionType(): string {
        return this.organizerService.currentQuestion.type;
    }
    get playersInGame() {
        return this.organizerService.gameInfo.playersInGame;
    }

    get sentResults(): boolean {
        return this.organizerService.sentResults;
    }

    // J'ai mis window:beforeunload pour que le localStorage soit modifie avant que la page soit dechargee
    @HostListener('window:beforeunload')
    handleBeforeUnload() {
        localStorage.setItem('navigatedFromUnload', 'true');
    }

    ngOnDestroy() {
        const location = this.location.path();
        const shouldGoHome = this.organizerService.shouldDisconnect && this.organizerService.roomId;

        if (location !== AppRoute.RESULTS || shouldGoHome) {
            this.organizerService.signalUserDisconnect();
            this.router.navigate([AppRoute.HOME]);
        }
    }

    showResults() {
        if (!this.sentResults) {
            this.organizerService.showResults();
        }
    }

    nextQuestion() {
        this.organizerService.nextQuestion();
    }

    gradeAnswer(value: QRLGrade) {
        this.organizerService.gradeAnswer(value);
    }
    pauseGame() {
        this.organizerService.pauseGame();
    }

    startAlertMode() {
        this.organizerService.startAlertMode();
    }

    abandonGame() {
        this.organizerService.abandonGame();
    }

    private onUnload() {
        localStorage.removeItem('navigatedFromUnload');
        this.router.navigate([AppRoute.HOME]);
        this.organizerService.alertSoundPlayer.stop();
    }
}
