import { Injectable } from '@angular/core';
import { NOT_FOUND } from '@app/constants/constants';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { PartialPlayer } from '@common/partial-player';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerListService {
    playerList: PartialPlayer[] = [];
    playerListSource = new Subject<PartialPlayer[]>();
    playerListObservable = this.playerListSource.asObservable();
    noPlayers: number = this.playerList.length;
    constructor(private sortingService: SortingService) {
        this.sortingService.sortById(this.sortingService.sortId, this.sortingService.sortDirection, this.playerList);
    }
    resetPlayerList() {
        this.playerList.forEach((player: PartialPlayer) => {
            if (player.isInGame) {
                player.submitted = false;
                player.interacted = false;
            }
        });
        this.sortingService.sortById(this.sortingService.sortId, this.sortingService.sortDirection, this.playerList);
    }
    updatePlayerPresence(name: string, status: boolean) {
        const playerIndex = this.playerList.findIndex((player) => player.name === name);
        if (playerIndex !== NOT_FOUND) {
            this.playerList[playerIndex].canChat = false;
            this.playerList[playerIndex].isInGame = status;
            this.playerList[playerIndex].interacted = false;
            this.playerList[playerIndex].submitted = false;
        }
        this.sortingService.sortById(this.sortingService.sortId, this.sortingService.sortDirection, this.playerList);
    }
    updatePlayerPoints(name: string, points: number) {
        const playerIndex = this.playerList.findIndex((player) => player.name === name);
        if (playerIndex !== NOT_FOUND) {
            this.playerList[playerIndex].points = points;
        }
        this.sortingService.sortById(this.sortingService.sortId, this.sortingService.sortDirection, this.playerList);
    }
}
