import { Location } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoute, ChoiceFeedback } from '@app/constants/enum-class';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { GameClientService } from '@app/services/game-services/game-client/game-client.service';

@Component({
    selector: 'app-game-page',
    templateUrl: 'game-page.component.html',
    styleUrls: ['game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    readonly MAX_CHARACTERS = 200;
    isKeyAlreadyPressed: boolean = false;
    constructor(
        private router: Router,
        private gameClientService: GameClientService,
        private location: Location,
    ) {
        this.gameClientService.getTitle();
        this.gameClientService.resetInformationFields();
        this.gameClientService.resetAttributes();
        this.gameClientService.playerPoints = 0;
        this.gameClientService.handleSockets();
        this.gameClientService.signalUserConnect();
    }
    get choiceFeedback(): ChoiceFeedback {
        return this.gameClientService.choiceFeedback;
    }
    get time(): number {
        return this.gameClientService.time;
    }

    get currentQuestion(): Question {
        return this.gameClientService.currentQuestion;
    }

    get currentIndex(): number {
        return this.gameClientService.currentQuestionIndex;
    }

    get playerPoints(): number {
        return this.gameClientService.playerPoints;
    }

    get quizReady() {
        return true;
    }

    get gamePaused() {
        return this.gameClientService.gamePaused;
    }
    get submitted() {
        return this.gameClientService.playerInfo.submitted;
    }
    get quizTitle(): string {
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

    get waitingForQuestion(): boolean {
        return this.gameClientService.playerInfo.waitingForQuestion;
    }

    get choiceSelected(): boolean[] {
        return this.gameClientService.playerInfo.choiceSelected;
    }
    get answer(): string {
        return this.gameClientService.answer;
    }
    get qreAnswer(): number {
        return this.gameClientService.qreAnswer;
    }
    set answer(value: string) {
        this.gameClientService.answer = value;
    }
    set qreAnswer(value: number) {
        this.gameClientService.qreAnswer = value;
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
            this.gameClientService.clearShowEndResults();
        } else if (location === AppRoute.RESULTS && this.gameClientService.shouldDisconnect && this.gameClientService.roomId) {
            this.gameClientService.signalUserDisconnect();
            this.router.navigate([AppRoute.HOME]);
        }
        this.gameClientService.clearSockets();
        this.gameClientService.resetAttributes();
    }
    defaultKeyDownHandler(event: KeyboardEvent): void {
        if (this.isKeyAlreadyPressed) {
            return;
        }

        this.isKeyAlreadyPressed = true;

        if (event.key === 'Enter') {
            this.finalizeAnswer();
        }
        if (this.gameClientService.currentQuestion.type === QuestionType.QCM) {
            switch (event.key) {
                case '1':
                    this.selectChoice(0);
                    break;
                case '2':
                    this.selectChoice(1);
                    break;
                case '3':
                    this.selectChoice(2);
                    break;
                case '4':
                    this.selectChoice(3);
                    break;
            }
        }
    }

    defaultKeyUpHandler(event: KeyboardEvent): void {
        if (event.key === 'Enter' || (event.key >= '1' && event.key <= '4')) {
            this.isKeyAlreadyPressed = false;
        }
    }

    selectChoice(indexChoice: number) {
        this.gameClientService.selectChoice(indexChoice);
    }

    finalizeAnswer() {
        if (!this.submitted && this.choiceFeedback === 'idle') {
            this.gameClientService.finalizeAnswer();
            if (this.currentQuestion.type === 'QRL') {
                this.gameClientService.sendAnswerForCorrection(this.gameClientService.answer);
            }
        }
    }

    abandonGame() {
        this.gameClientService.abandonGame();
    }
}
