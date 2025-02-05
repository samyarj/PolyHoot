import { TimerEvents } from '@app/constants/enum-classes';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TIMER_MODE } from './game-timer.constants';

@Injectable()
export class Timer {
    timerValue: number;
    interval: NodeJS.Timeout | null;
    roomId: string;
    organizerSocket: Socket;
    isPaused = false;
    timerMode: number = TIMER_MODE.NORMAL;

    constructor(roomId: string, @ConnectedSocket() organizerSocket: Socket) {
        this.roomId = roomId;
        this.organizerSocket = organizerSocket;
    }

    stopTimer() {
        clearInterval(this.interval);
    }

    // il y a 4 parametres car le callback est utilise a un seul endroit, dans nextquestioncountdown.
    // faire une autre fonction avec le meme fonctionnement specifique pour nextquestioncountdown
    // serait de la duplication de code, donc on a garde 4 parametres.
    // eslint-disable-next-line max-params
    startTimer(timerValue: number, emitSignal: string, stopSignal: string, callback?: () => void) {
        this.timerMode = TIMER_MODE.NORMAL;
        clearInterval(this.interval);
        this.timerValue = timerValue;
        this.resumeTimer(emitSignal, stopSignal, callback);
    }

    startAlertMode() {
        if (this.timerMode === TIMER_MODE.NORMAL) {
            this.timerMode = TIMER_MODE.ALERT;
            this.stopTimer();
            this.signalToUsers(TimerEvents.AlertModeStarted);
            if (!this.isPaused) {
                this.resumeTimer(TimerEvents.Value, TimerEvents.End);
            }
        }
    }

    pause(emitSignal: string, stopSignal: string) {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.stopTimer();
        } else {
            this.resumeTimer(emitSignal, stopSignal);
        }
        this.organizerSocket.emit(TimerEvents.Paused, this.isPaused);
        this.organizerSocket.to(this.roomId).emit(TimerEvents.Paused, this.isPaused);
    }

    private resumeTimer(emitSignal: string, stopSignal: string, callback?: () => void) {
        this.signalToUsers(emitSignal, this.timerValue);
        this.interval = setInterval(() => {
            if (this.timerValue > 0) {
                this.timerValue--;
                this.signalToUsers(emitSignal, this.timerValue);
                if (this.timerValue === 0) {
                    this.signalToUsers(emitSignal, this.timerValue);
                    this.signalToUsers(stopSignal);
                    this.stopTimer();
                    if (callback) callback();
                }
            }
        }, this.timerMode);
    }

    private signalToUsers(emitSignal: string, timerValue?: number) {
        if (timerValue !== undefined) {
            this.organizerSocket.emit(emitSignal, timerValue);
            this.organizerSocket.to(this.roomId).emit(emitSignal, timerValue);
        } else {
            this.organizerSocket.emit(emitSignal);
            this.organizerSocket.to(this.roomId).emit(emitSignal);
        }
    }
}
