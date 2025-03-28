import { Injectable } from '@angular/core';
import { DisconnectEvents, GameEvents } from '@app/constants/enum-class';
import { Reward } from '@app/interfaces/lootbox-related';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';

interface PlayerData {
    name: string;
    points: number;
    noBonusesObtained: number;
    isInGame: boolean;
    reward: Reward | null;
    equippedAvatar: string;
    equippedBanner: string;
}

@Injectable({
    providedIn: 'root',
})
export class ResultsService {
    playerList: PlayerData[];
    nbPlayers: number;
    resultsReady: boolean = false;
    areSocketsInitialized: boolean = false;

    constructor(private socketHandlerService: SocketClientService) {
        this.resetAttributes();
    }

    get roomId() {
        return this.socketHandlerService.roomId;
    }

    setAttributes() {
        this.nbPlayers = this.playerList.length;
    }

    handleResultsSockets() {
        if (!this.areSocketsInitialized) {
            this.socketHandlerService.on(GameEvents.SendResults, (data: PlayerData[]) => {
                this.playerList = data;
                this.setAttributes();
            });
            this.areSocketsInitialized = true;
        }
    }

    clearResultsSockets() {
        this.socketHandlerService.socket.off(GameEvents.SendResults);
        this.areSocketsInitialized = false;
    }

    disconnectUser() {
        this.socketHandlerService.send(DisconnectEvents.UserFromResults, this.socketHandlerService.playerName);
        this.resetAttributes();
    }

    resetAttributes() {
        this.nbPlayers = 0;
        this.resultsReady = false;
    }
}
