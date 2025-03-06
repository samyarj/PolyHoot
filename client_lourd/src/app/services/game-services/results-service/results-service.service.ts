import { Injectable } from '@angular/core';
import { DisconnectEvents, GameEvents } from '@app/constants/enum-class';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';

interface PlayerData {
    name: string;
    points: number;
    noBonusesObtained: number;
    isInGame: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class ResultsService {
    playerList: PlayerData[];
    nbPlayers: number;
    sortedPlayersList: PlayerData[] = [];
    resultsReady: boolean = false;

    constructor(private socketHandlerService: SocketClientService) {
        this.resetAttributes();
    }

    get roomId() {
        return this.socketHandlerService.roomId;
    }

    setAttributes() {
        this.nbPlayers = this.playerList.length;
    }

    sortPlayers() {
        const comparePlayers = (a: PlayerData, b: PlayerData) => {
            if (a.points === b.points) {
                return a.name.localeCompare(b.name);
            } else {
                return b.points - a.points;
            }
        };
        const playersInGame = this.playerList.filter((player) => player.isInGame);
        const playersNotInGame = this.playerList.filter((player) => !player.isInGame);
        const sortedPlayersInGame = playersInGame.sort(comparePlayers);
        const sortedPlayersNotInGame = playersNotInGame.sort(comparePlayers);
        this.sortedPlayersList = sortedPlayersInGame.concat(sortedPlayersNotInGame);
    }

    handleResultsSockets() {
        this.socketHandlerService.on(GameEvents.SendResults, (data: PlayerData[]) => {
            this.playerList = data;
            this.setAttributes();
        });
    }

    disconnectUser() {
        this.socketHandlerService.send(DisconnectEvents.UserFromResults, this.socketHandlerService.playerName);
        this.resetAttributes();
    }

    resetAttributes() {
        this.nbPlayers = 0;
        this.sortedPlayersList = [];
        this.resultsReady = false;
    }
}
