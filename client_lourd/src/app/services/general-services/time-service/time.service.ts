import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    timeSource = new Subject<number>();
    timeSourceObservable = this.timeSource.asObservable();

    private interval: number | undefined;
    private readonly tick = 1000;

    private counter = 0;

    get time() {
        this.timeSource.next(this.counter);
        return this.counter;
    }

    private set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(startValue: number) {
        if (this.interval) return;
        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                this.stopTimer();
            }
        }, this.tick);
    }

    resetTimer(startValue: number) {
        this.stopTimer();
        this.startTimer(startValue);
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
