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
    canChat: boolean;
    isOrganizer: boolean;

    constructor() {
        this.connect();
    }

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        if (!this.isSocketAlive()) this.socket = io(environment.serverUrlSocket, { transports: ['websocket'], upgrade: false });
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
