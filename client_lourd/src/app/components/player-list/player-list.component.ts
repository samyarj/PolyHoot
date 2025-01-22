import { Component } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { PlayerListService } from '@app/services/game-services/player-list/player-list.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
    sortId: number = 1;
    constructor(
        private playerListService: PlayerListService,
        private sortingService: SortingService,
    ) {}

    get sortsOptions() {
        return this.sortingService.sortsOptions;
    }
    get playerList() {
        return this.playerListService.playerList;
    }
    onSortChange(sortId: number, direction: SortDirection) {
        this.sortingService.sortById(sortId, direction, this.playerList);
    }
    changeChatStatus(playerName: string) {
        this.playerListService.changeChatStatus(playerName);
    }
}
