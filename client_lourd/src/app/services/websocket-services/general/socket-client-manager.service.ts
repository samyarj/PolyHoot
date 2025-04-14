import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    roomId: string;
    playerName: string;
    isOrganizer: boolean;

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect(token: string) {
        if (!this.isSocketAlive() && token !== null) {
            console.log('Connecting to socket server...');
            this.socket = io(environment.serverUrlSocket, {
                transports: ['websocket'],
                upgrade: false,
                query: { token },
            });
        }
    }

    disconnect() {
        if (this.isSocketAlive()) this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T, callback?: (...args: never[]) => void): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }
}
