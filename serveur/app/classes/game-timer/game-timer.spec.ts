import { TimerEvents } from '@app/constants/enum-classes';
import { Socket } from 'socket.io';
import { Timer } from './game-timer';
import { TIMER_MODE } from './game-timer.constants';

const defaultID = 'defaultID';

jest.useFakeTimers();

const mockSocket = {
    id: 'abc',
    rooms: new Set(['room1', defaultID]),
    emit: jest.fn(),
    join: jest.fn(),
    to: jest.fn().mockReturnThis(),
} as unknown as Socket;

jest.mock('socket.io', () => {
    return {
        // disabled dans le but de mock la classe Socket
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Socket: jest.fn().mockImplementation(() => ({
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
        })),
    };
});

describe('Timer', () => {
    let timer: Timer;
    const roomId = 'testRoom';
    const emitSignal = 'timerTick';
    const stopSignal = 'timerStop';
    const initialTimerValue = 15;

    beforeEach(() => {
        timer = new Timer(roomId, mockSocket);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('callback should be executed when timer reaches 0', () => {
        const mockCallback = jest.fn();
        timer.startTimer(1, emitSignal, stopSignal, mockCallback);

        jest.runAllTimers();
        expect(mockCallback).toHaveBeenCalled();
    });
    it('should start and emit timer values correctly', () => {
        timer.startTimer(initialTimerValue, emitSignal, stopSignal);

        jest.runAllTimers();

        expect(mockSocket.emit).toHaveBeenCalledWith(emitSignal, initialTimerValue);
        expect(mockSocket.to(roomId).emit).toHaveBeenCalledWith(emitSignal, initialTimerValue);

        expect(mockSocket.emit).toHaveBeenCalledWith(stopSignal);
        expect(mockSocket.to(roomId).emit).toHaveBeenCalledWith(stopSignal);
    });

    it('should stop the timer correctly', () => {
        timer.startTimer(initialTimerValue, emitSignal, stopSignal);
        timer.stopTimer();

        expect(mockSocket.emit).toHaveBeenCalledTimes(2);
        expect(mockSocket.to(roomId).emit).toHaveBeenCalledTimes(2);
    });

    it("pause() should call appropriate functions and return the timer's new state", () => {
        timer.isPaused = false;
        timer.stopTimer = jest.fn();
        timer['resumeTimer'] = jest.fn();
        timer.pause(emitSignal, stopSignal);
        expect(mockSocket.emit).toHaveBeenCalledWith(TimerEvents.Paused, true);
        expect(mockSocket.to(roomId).emit).toHaveBeenCalledWith(TimerEvents.Paused, true);
        expect(timer.isPaused).toBe(true);
        expect(timer.stopTimer).toHaveBeenCalled();
        timer.pause(emitSignal, stopSignal);
        expect(timer.isPaused).toBe(false);
        expect(timer['resumeTimer']).toHaveBeenCalled();
    });

    it('startAlertMode() should change TimerMode and call appropriate functions', () => {
        timer.isPaused = false;
        timer.timerMode = TIMER_MODE.NORMAL;
        timer.stopTimer = jest.fn().mockImplementation();
        timer['signalToUsers'] = jest.fn().mockImplementation();
        timer['resumeTimer'] = jest.fn().mockImplementation();
        timer.startAlertMode();
        expect(timer.timerMode).toBe(TIMER_MODE.ALERT);
        expect(timer.stopTimer).toHaveBeenCalled();
        expect(timer['signalToUsers']).toHaveBeenCalled();
        expect(timer['resumeTimer']).toHaveBeenCalled();
    });
});
