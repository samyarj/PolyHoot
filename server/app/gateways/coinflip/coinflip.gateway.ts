import { CoinFlipEvents } from '@app/constants/enum-classes';
import { WsAuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedSocket } from '@app/interface/authenticated-request';
import { CoinflipManagerService } from '@app/services/coinflip-manager/coinflip-manager.service';
import { Logger, UseGuards } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
@UseGuards(WsAuthGuard)
export class CoinflipGateway implements OnGatewayInit, OnGatewayConnection {
    private logger: Logger = new Logger('CoinflipGateway');

    @WebSocketServer()
    server: Server;

    constructor(private coinflipManager: CoinflipManagerService) {}

    afterInit(server: Server) {
        this.logger.log('Initialized');
        this.coinflipManager.setServer(server);
    }

    handleConnection(client: AuthenticatedSocket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);

        // THIS DOESNT WORK HERE ON INITIAL CONNECTION, ISSUE IS WITH THE FACT THAT  THIS IS EXECUTED BEFORE THE GUARDS => no user yet.
        // if (client.user.displayName) {
        //     this.logger.log(`DisplayName of user: ${client.user.displayName}`);
        // }

        // Additional logic for handling new connections can be added here
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
