import { MOCK_QUESTIONS } from '@app/constants/mock-questions';
import { Question } from '@app/model/schema/question/question';
import { Socket } from 'socket.io';
import { Player } from './player';

const defaultID = 'defaultID';

const BONUS_MULTIPLIER = 1.2;

const mockSocket = {
    id: 'abc',
    rooms: new Set(['room1', defaultID]),
    emit: jest.fn(),
    join: jest.fn(),
    to: jest.fn().mockReturnThis(),
} as unknown as Socket;

describe('Player', () => {
    const playerName = 'Test Player';
    const isOrganizer = true;
    let player: Player;

    beforeEach(() => {
        player = new Player(playerName, isOrganizer, mockSocket);
    });

    it('should be properly initialized', () => {
        expect(player.name).toEqual(playerName);
        expect(player.isOrganizer).toBe(isOrganizer);
        expect(player.points).toBe(0);
    });

    it('prepareForNextQuestion() should reset the next question correctly', () => {
        player.isFirst = true;
        player.submitted = true;
        player.currentChoices = [true, false, true, false];

        player.prepareForNextQuestion();

        expect(player.isFirst).toBe(false);
        expect(player.submitted).toBe(false);
        expect(player.currentChoices).toEqual([false, false, false, false]);
    });

    it('updatePlayerPoints() should update player points correctly when answers are correct', () => {
        const mockQuestion: Partial<Question> = {
            points: 10,
        };
        player.isFirst = true;
        jest.spyOn(player, 'verifyIfAnswersCorrect').mockReturnValue(true);

        player.updatePlayerPoints(mockQuestion as never);

        expect(player.points).toBe(mockQuestion.points * BONUS_MULTIPLIER);
        player.points = 0;
        player.isFirst = false;

        player.updatePlayerPoints(mockQuestion as never);

        expect(player.points).toBe(mockQuestion.points);
    });
    it('verifyIfAnswersCorrect() should return true when all answers are correct', () => {
        const mockQuestion = MOCK_QUESTIONS[0];
        player.currentChoices = [false, true, false, false];
        expect(player.verifyIfAnswersCorrect(mockQuestion as Question)).toBe(true);
    });

    it('verifyIfAnswersCorrect() should return false when at least one answer is incorrect', () => {
        const mockQuestion = MOCK_QUESTIONS[0];
        player.currentChoices = [true, true, true, false];
        expect(player.verifyIfAnswersCorrect(mockQuestion as Question)).toBe(false);
    });
});
