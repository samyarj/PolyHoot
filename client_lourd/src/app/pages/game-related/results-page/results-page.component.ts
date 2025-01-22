import { Location } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoute } from '@app/constants/enum-class';
import { ResultsService } from '@app/services/game-services/results-service/results-service.service';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit, OnDestroy {
    canShowPrevious: boolean;
    canShowNext: boolean;
    constructor(
        private resultsService: ResultsService,
        private router: Router,
        private location: Location,
    ) {
        this.canNavigate();
    }
    get question() {
        return this.resultsService.question;
    }
    get nbAnswersArray() {
        return this.resultsService.nbAnswersArray;
    }
    get correctAnswersArray() {
        return this.resultsService.correctAnswersArray;
    }
    get nbPlayers() {
        return this.resultsService.nbPlayers;
    }
    get sortedPlayersList() {
        return this.resultsService.sortedPlayersList;
    }

    get playerList() {
        return this.resultsService.playerList;
    }

    @HostListener('window:beforeunload')
    handleBeforeUnload() {
        localStorage.setItem('navigatedFromUnload', 'true');
    }

    ngOnInit(): void {
        if (localStorage.getItem('navigatedFromUnload') === 'true') {
            this.onUnload();
            return;
        }
        this.resultsService.sortPlayers();
        this.resultsService.setAnswersArray();
        this.resultsService.setCorrectAnswers();
    }

    navigate(direction: string) {
        if (direction === 'next' && this.resultsService.currentQuestionIndex < this.resultsService.questions.length - 1) {
            this.resultsService.currentQuestionIndex++;
            this.resultsService.question = this.resultsService.questions[this.resultsService.currentQuestionIndex];
        } else if (direction === 'previous' && this.resultsService.currentQuestionIndex > 0) {
            this.resultsService.currentQuestionIndex--;
            this.resultsService.question = this.resultsService.questions[this.resultsService.currentQuestionIndex];
        }
        this.canNavigate();
        this.resultsService.setAnswersArray();
        this.resultsService.setCorrectAnswers();
    }

    returnHome() {
        this.router.navigate([AppRoute.HOME]);
    }

    ngOnDestroy() {
        const location = this.location.path();

        if (location !== AppRoute.RESULTS) {
            if (this.resultsService.roomId) {
                this.resultsService.disconnectUser();
            }
            this.returnHome();
        }
    }
    private canNavigate() {
        if (this.resultsService.questions.length === 1) {
            this.canShowPrevious = false;
            this.canShowNext = false;
        } else if (this.resultsService.currentQuestionIndex === 0) {
            this.canShowPrevious = false;
            this.canShowNext = true;
        } else if (this.resultsService.currentQuestionIndex === this.resultsService.questions.length - 1) {
            this.canShowPrevious = true;
            this.canShowNext = false;
        } else {
            this.canShowPrevious = true;
            this.canShowNext = true;
        }
    }
    private onUnload() {
        localStorage.removeItem('navigatedFromUnload');
        this.router.navigate([AppRoute.HOME]);
    }
}
