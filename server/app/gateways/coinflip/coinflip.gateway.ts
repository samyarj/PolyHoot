import { CoinFlipEvents } from '@app/constants/enum-classes';
import { WsAuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedSocket } from '@app/interface/authenticated-request';
import { CoinflipManagerService } from '@app/services/coinflip-manager/coinflip-manager.service';
import { Logger, UseGuards } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
@UseGuards(WsAuthGuard)
export class CoinflipGateway implements OnGatewayInit {
    private logger: Logger = new Logger('CoinflipGateway');

    @WebSocketServer()
    server: Server;

    constructor(private coinflipManager: CoinflipManagerService) {}

    afterInit(server: Server) {
        this.logger.log('Initialized');
        this.coinflipManager.setServer(server);
    }

    @SubscribeMessage(CoinFlipEvents.SubmitChoice)
    async handleSubmitChoice(client: AuthenticatedSocket, betChoice: { choice: string; bet: number }) {
        let submitStatus = await this.coinflipManager.submitChoice(client, betChoice);
        this.server.emit(CoinFlipEvents.SendPlayerList, this.coinflipManager.getPlayers());
        return submitStatus;
    }

    @SubscribeMessage(CoinFlipEvents.JoinGame)
    handleJoinGame(client: AuthenticatedSocket) {
        return this.coinflipManager.getGameInfo();
    }
}
