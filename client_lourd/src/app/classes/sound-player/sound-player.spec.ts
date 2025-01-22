import { ALERT_SOUND_DECREASE_INTERVAL, ALERT_SOUND_INTENSITY_DECREMENTATION, BASE_VOLUME } from '@app/constants/constants';
import { SoundPlayer } from './sound-player.class';

describe('SoundPlayer', () => {
    let soundPlayer: SoundPlayer;

    beforeEach(() => {
        soundPlayer = new SoundPlayer('123');
    });
    it('should create an instance', () => {
        expect(new SoundPlayer('123')).toBeTruthy();
    });
    it('stop should initialize everything properly', () => {
        soundPlayer['sound'].pause = jasmine.createSpy('pause').and.stub();
        soundPlayer.stop();
        expect(soundPlayer['sound'].volume).toBe(0);
        expect(soundPlayer['sound'].currentTime).toBe(0);
        expect(soundPlayer['sound'].pause).toHaveBeenCalled();
    });
    it('playAlertModeSound should initialize variables properly', () => {
        jasmine.clock().install();
        soundPlayer['sound'].load = jasmine.createSpy('load').and.stub();
        soundPlayer['sound'].play = jasmine.createSpy('play').and.stub();
        soundPlayer['handleSoundIntensity'] = jasmine.createSpy('handleSoundIntensity').and.stub();
        soundPlayer['play']();
        expect(soundPlayer['sound'].volume).toBe(BASE_VOLUME);
        expect(soundPlayer['sound'].load).toHaveBeenCalled();
        expect(soundPlayer['sound'].play).toHaveBeenCalled();
        jasmine.clock().tick(ALERT_SOUND_DECREASE_INTERVAL + 1);
        expect(soundPlayer['handleSoundIntensity']).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });
    it('handleSoundIntensity should not change volume if currentTime is below 1', () => {
        soundPlayer['sound'].currentTime = 0.5;
        soundPlayer['sound'].volume = 1;
        soundPlayer['handleSoundIntensity']();
        expect(soundPlayer['sound'].volume).toEqual(1);
    });
    it('handleSoundIntensity should change volume or call appropriate functions', () => {
        soundPlayer['sound'].currentTime = 2;
        soundPlayer['sound'].volume = 0.000001;
        soundPlayer.stop = jasmine.createSpy('stop').and.stub();
        soundPlayer['handleSoundIntensity']();
        expect(soundPlayer.stop).toHaveBeenCalled();
        const beginningVolume = 0.02;
        soundPlayer['sound'].currentTime = 2;
        soundPlayer['sound'].volume = beginningVolume;
        soundPlayer['handleSoundIntensity']();
        expect(soundPlayer['sound'].volume).toEqual(beginningVolume - ALERT_SOUND_INTENSITY_DECREMENTATION);
    });
});
