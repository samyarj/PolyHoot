import { CoinflipManagerService } from '@app/services/coinflip-manager/coinflip-manager.service';
import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class CoinflipGateway implements OnGatewayInit, OnGatewayConnection {
    private logger: Logger = new Logger('CoinflipGateway');

    @WebSocketServer()
    server: Server;

    constructor(private coinflipManager: CoinflipManagerService) {}

    afterInit(server: Server) {
        this.logger.log('Initialized');
        this.coinflipManager.setServer(server);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
        // Additional logic for handling new connections can be added here
    }

    @SubscribeMessage('SubmitChoice')
    handleSubmitChoice(client: Socket, betChoice: { choice: string; bet: number }) {
        let submitStatus = this.coinflipManager.submitChoice(client, betChoice);
        this.server.emit('SendPlayerList', this.coinflipManager.getPlayers());
        return submitStatus;
    }

    @SubscribeMessage('JoinGame')
    handleJoinGame(client: Socket) {
        return this.coinflipManager.getGameInfo();
    }
}
