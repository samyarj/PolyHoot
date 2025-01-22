import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fadeInStaggerAnimation, slideDownAnimation } from '@app/animations/animation';
import { EMPTY_STRING, NONE } from '@app/constants/constants';
import { ConfirmationMessage } from '@app/constants/enum-class';
import { Game } from '@app/interfaces/game';
import { HistoryService } from '@app/services/back-end-communication-services/history-service/history.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { Observer } from 'rxjs';
@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    animations: [slideDownAnimation, fadeInStaggerAnimation],
})
export class HistoryPageComponent implements OnInit {
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    title: string = 'Historique des parties';
    dataSource: MatTableDataSource<Game> = new MatTableDataSource<Game>([]);
    firstFetch: boolean = false;

    private sortDirection: SortDirection = NONE;
    private sortedColumn: string = EMPTY_STRING;

    private gamesObserver: Partial<Observer<Game[]>> = {
        next: (games: Game[]) => {
            this.dataSource.data = games;
            this.firstFetch = true;
            this.dataSource.paginator = this.paginator;
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };

    constructor(
        private sortingService: SortingService,
        private historyService: HistoryService,
        private messageHandlerService: MessageHandlerService,
    ) {}

    ngOnInit(): void {
        this.historyService.getAllGamesRecords().subscribe(this.gamesObserver);
    }

    sortData(column: keyof Game, direction: SortDirection): void {
        this.sortedColumn = column;
        this.sortDirection = direction;
        this.sortingService.sortGamesByColumn(column, direction, this.dataSource.data);

        this.dataSource.data = [...this.dataSource.data];
    }

    isSorted(column: string, direction: SortDirection): boolean {
        return this.sortedColumn === column && this.sortDirection === direction;
    }

    cleanHistory(): void {
        this.messageHandlerService.confirmationDialog(ConfirmationMessage.CleanHistory, () => this.cleanHistoryCallback());
    }

    private cleanHistoryCallback(): void {
        this.historyService.cleanHistory().subscribe(this.gamesObserver);
    }
}
