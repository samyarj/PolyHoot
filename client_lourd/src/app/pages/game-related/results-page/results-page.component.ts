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
    constructor(
        private resultsService: ResultsService,
        private router: Router,
        private location: Location,
    ) {}
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
    private onUnload() {
        localStorage.removeItem('navigatedFromUnload');
        this.router.navigate([AppRoute.HOME]);
    }
}
