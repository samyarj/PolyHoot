import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayingComponent } from '@app/components/playing/playing.component';
import { Question } from '@app/interfaces/question';
import { TestClientService } from '@app/services/game-services/test-client/test-client.service';
import { Subscription } from 'rxjs';
import { TIME_TO_NEXT_ANSWER } from '@app/constants/constants';

@Component({
    selector: 'app-test-game-page',
    templateUrl: '../../../components/playing/playing.component.html',
    styleUrls: ['../../../components/playing/playing.component.scss'],
})
export class TestGamePageComponent extends PlayingComponent implements OnInit, OnDestroy {
    abandonSubscription: Subscription = new Subscription();
    textAreaIsDisabled = false;
    receivedCorrection = false;
    pointsReceived = 0;
    waitingForCorrection: boolean = false;
    constructor(
        private router: Router,
        private testClientService: TestClientService,
        private activatedRoute: ActivatedRoute,
    ) {
        super();
        this.service = testClientService;
        this.service.resetAttributes();
    }

    override get gamePaused(): boolean {
        return false;
    }
    override get quizReady(): boolean {
        return this.testClientService.quizReady;
    }
    override get isTesting() {
        return true;
    }
    override get submitted() {
        return this.testClientService.submitted;
    }
    override get choiceSelected(): boolean[] {
        return this.testClientService.choiceSelected;
    }

    override get showAnswers(): boolean {
        return this.testClientService.showAnswers;
    }

    override get quizTitle(): string {
        return this.testClientService.quiz.title;
    }

    override get waitingForQuestion(): boolean {
        return false;
    }

    get questions(): Question[] {
        return this.testClientService.questions;
    }

    get userFirst(): boolean {
        return this.testClientService.answersCorrect;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        this.defaultKeyUpHandler(event);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        this.defaultKeyDownHandler(event);
    }

    ngOnInit(): void {
        const id = this.activatedRoute.snapshot.paramMap.get('id');
        if (id) {
            this.testClientService.fetchQuiz(id);
        }
        this.abandonSubscription = this.testClientService.abandonSourceObservable.subscribe(() => {
            this.router.navigate(['create']);
        });
        this.testClientService.initializeSubscription();
    }

    ngOnDestroy(): void {
        this.testClientService.leavingPage();
    }

    selectChoice(indexChoice: number) {
        this.testClientService.selectChoice(indexChoice);
    }
    override finalizeAnswer(): void {
        if (!this.testClientService.isButtonDisabled) {
            this.testClientService.isButtonDisabled = true;
            this.testClientService.finalizeAnswer();
        }
        setTimeout(() => (this.answer = ''), TIME_TO_NEXT_ANSWER);
        this.testClientService.finalizeAnswer();
    }

    override abandonGame() {
        this.testClientService.abandonGame();
    }

    // car en mode test il y a pas besoin d'envoyer de l'information a l'organisateur
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override textAreaModified(): void {}
}
