import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
@Injectable()
export class CoinFlipTimer {
    timerValue: number;
    interval: NodeJS.Timeout | null;
    timerMode: number = 100;
    constructor(private server: Server) {}

    startTimer(timerValue: number, emitSignal: string, callback?: () => void) {
        clearInterval(this.interval);
        this.timerValue = timerValue;
        this.resumeTimer(emitSignal, callback);
    }

    stopTimer() {
        clearInterval(this.interval);
    }

    private resumeTimer(emitSignal: string, callback?: () => void) {
        this.server.emit(emitSignal, this.timerValue);
        this.interval = setInterval(() => {
            if (this.timerValue > 0) {
                this.timerValue--;
                this.server.emit(emitSignal, this.timerValue);
                if (this.timerValue === 0) {
                    if (callback) callback();
                }
            }
        }, this.timerMode);
    }
}
