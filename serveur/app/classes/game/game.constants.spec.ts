import { CLIENT_ERROR } from './game.constants';

describe('CLIENT_ERROR constants', () => {
    it('should have a SHOW property that is true', () => {
        expect(CLIENT_ERROR.SHOW).toBe(true);
    });

    it('should have a HIDE property that is false', () => {
        expect(CLIENT_ERROR.HIDE).toBe(false);
    });
});
