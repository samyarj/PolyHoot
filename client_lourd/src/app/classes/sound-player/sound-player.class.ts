import { ALERT_SOUND_DECREASE_INTERVAL, ALERT_SOUND_INTENSITY_DECREMENTATION, ALERT_SOUND_PATH } from '@app/constants/constants';

export class SoundPlayer {
    private sound: HTMLAudioElement = new Audio();
    private interval: ReturnType<typeof setInterval>;

    constructor(src: string) {
        this.sound.src = src;
    }

    stop() {
        this.sound.volume = 0;
        this.sound.pause();
        this.sound.currentTime = 0;
        clearInterval(this.interval);
    }

    play() {
        this.sound.src = ALERT_SOUND_PATH;
        this.sound.load();
        this.sound.volume = 0.5;
        this.sound.play();
        this.interval = setInterval(() => {
            this.handleSoundIntensity();
        }, ALERT_SOUND_DECREASE_INTERVAL);
    }

    private handleSoundIntensity() {
        if (this.sound.currentTime > 1) {
            if (this.sound.volume - ALERT_SOUND_INTENSITY_DECREMENTATION < 0) {
                this.stop();
            } else this.sound.volume -= ALERT_SOUND_INTENSITY_DECREMENTATION;
        }
    }
}
