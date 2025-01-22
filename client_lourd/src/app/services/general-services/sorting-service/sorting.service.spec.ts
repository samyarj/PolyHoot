/* eslint-disable @typescript-eslint/no-explicit-any */
// utilise pour les fonctions privees
import { TestBed } from '@angular/core/testing';
import { MOCK_SORTED_QUIZZES, MOCK_UNSORTED_QUIZZES } from '@app/constants/mock-sorted-unsorted-quizzes';
import { MOCK_MIXED_QUESTIONS } from '@app/constants/mock-validation-constants';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { SortingService } from './sorting.service';

describe('SortingService', () => {
    let service: SortingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SortingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should sort questions by lastModified in descending order', () => {
        const unsortedQuestions: Question[] = [
            {
                type: QuestionType.QCM,
                text: 'Question 2?',
                points: 20,
                choices: [{ text: 'Answer 1', isCorrect: true }],
                lastModified: '2023-11-15T18:40:10',
            },
            {
                type: QuestionType.QCM,
                text: 'Question 1?',
                points: 10,
                choices: [{ text: 'Answer 1', isCorrect: true }],
                lastModified: '2023-11-15T11:30:20',
            },
        ];
        const sortedQuestions: Question[] = [
            {
                type: QuestionType.QCM,
                text: 'Question 1?',
                points: 10,
                choices: [{ text: 'Answer 1', isCorrect: true }],
                lastModified: '2023-11-15T11:30:20',
            },
            {
                type: QuestionType.QCM,
                text: 'Question 2?',
                points: 20,
                choices: [{ text: 'Answer 1', isCorrect: true }],
                lastModified: '2023-11-15T18:40:10',
            },
        ];
        const result = service.sortQuestionsByLastModified(unsortedQuestions);
        expect(result).toEqual(sortedQuestions);
    });

    it('should handle questions with no lastModified property', () => {
        const unsortedQuestions: Question[] = [
            {
                type: QuestionType.QCM,
                text: 'Question 1?',
                points: 10,
                choices: [{ text: 'Answer 1', isCorrect: true }],
            },
            {
                type: QuestionType.QCM,
                text: 'Question 2?',
                points: 20,
                choices: [{ text: 'Answer 1', isCorrect: true }],
            },
        ];
        const sortedQuestions: Question[] = [
            {
                type: QuestionType.QCM,
                text: 'Question 1?',
                points: 10,
                choices: [{ text: 'Answer 1', isCorrect: true }],
                lastModified: new Date().toString(),
            },
            {
                type: QuestionType.QCM,
                text: 'Question 2?',
                points: 20,
                choices: [{ text: 'Answer 1', isCorrect: true }],
                lastModified: new Date().toString(),
            },
        ];
        const result = service.sortQuestionsByLastModified(unsortedQuestions);
        expect(result).toEqual(sortedQuestions);
    });

    it('sortQuizByLastModified should sort quizzes in ascending order', () => {
        const sortedQuizzes = service.sortQuizByLastModified(JSON.parse(JSON.stringify(MOCK_UNSORTED_QUIZZES)));
        expect(sortedQuizzes).toEqual(MOCK_SORTED_QUIZZES);
    });

    it('should sort games by name in ascending order', () => {
        const games: Game[] = [
            { name: 'Zelda', startingDate: '2021-03-07', playersNumber: 10, bestScore: 200 },
            { name: 'Mario', startingDate: '2021-03-05', playersNumber: 8, bestScore: 150 },
            { name: 'Donkey Kong', startingDate: '2021-03-06', playersNumber: 5, bestScore: 120 },
        ];
        const sortedGames: Game[] = [
            { name: 'Donkey Kong', startingDate: '2021-03-06', playersNumber: 5, bestScore: 120 },
            { name: 'Mario', startingDate: '2021-03-05', playersNumber: 8, bestScore: 150 },
            { name: 'Zelda', startingDate: '2021-03-07', playersNumber: 10, bestScore: 200 },
        ];
        service.sortGamesByColumn('name', 'asc', games);
        expect(games).toEqual(sortedGames);
    });

    it('should sort games by name in descending order', () => {
        const games: Game[] = [
            { name: 'Zelda', startingDate: '2021-03-07', playersNumber: 10, bestScore: 200 },
            { name: 'Mario', startingDate: '2021-03-05', playersNumber: 8, bestScore: 150 },
            { name: 'Donkey Kong', startingDate: '2021-03-06', playersNumber: 5, bestScore: 120 },
        ];
        const sortedGames: Game[] = [
            { name: 'Zelda', startingDate: '2021-03-07', playersNumber: 10, bestScore: 200 },
            { name: 'Mario', startingDate: '2021-03-05', playersNumber: 8, bestScore: 150 },
            { name: 'Donkey Kong', startingDate: '2021-03-06', playersNumber: 5, bestScore: 120 },
        ];
        service.sortGamesByColumn('name', 'desc', games);
        expect(games).toEqual(sortedGames);
    });

    it('should sort games by startingDate in ascending order', () => {
        const games: Game[] = [
            { name: 'Zelda', startingDate: '2021-03-07', playersNumber: 10, bestScore: 200 },
            { name: 'Mario', startingDate: '2021-03-05', playersNumber: 8, bestScore: 150 },
            { name: 'Donkey Kong', startingDate: '2021-03-06', playersNumber: 5, bestScore: 120 },
        ];
        const sortedGames: Game[] = [
            { name: 'Mario', startingDate: '2021-03-05', playersNumber: 8, bestScore: 150 },
            { name: 'Donkey Kong', startingDate: '2021-03-06', playersNumber: 5, bestScore: 120 },
            { name: 'Zelda', startingDate: '2021-03-07', playersNumber: 10, bestScore: 200 },
        ];
        service.sortGamesByColumn('startingDate', 'asc', games);
        expect(games).toEqual(sortedGames);
    });

    it('should sort games by startingDate in descending order', () => {
        const games: Game[] = [
            { name: 'Zelda', startingDate: '2021-03-07', playersNumber: 10, bestScore: 200 },
            { name: 'Mario', startingDate: '2021-03-05', playersNumber: 8, bestScore: 150 },
            { name: 'Donkey Kong', startingDate: '2021-03-06', playersNumber: 5, bestScore: 120 },
        ];
        const sortedGames: Game[] = [
            { name: 'Zelda', startingDate: '2021-03-07', playersNumber: 10, bestScore: 200 },
            { name: 'Donkey Kong', startingDate: '2021-03-06', playersNumber: 5, bestScore: 120 },
            { name: 'Mario', startingDate: '2021-03-05', playersNumber: 8, bestScore: 150 },
        ];
        service.sortGamesByColumn('startingDate', 'desc', games);
        expect(games).toEqual(sortedGames);
    });

    it('should not sort games when passing a column different from name or startingDate', () => {
        const games: Game[] = [
            { name: 'Zelda', startingDate: '2021-03-07', playersNumber: 10, bestScore: 200 },
            { name: 'Mario', startingDate: '2021-03-05', playersNumber: 8, bestScore: 150 },
            { name: 'Donkey Kong', startingDate: '2021-03-06', playersNumber: 5, bestScore: 120 },
        ];
        service.sortGamesByColumn('playersNumber', 'desc', games);
        expect(games).toEqual(games);
    });

    it('should compare string values', () => {
        const valueA = 'a';
        const valueB = 'b';
        const expected = -1;
        const direction = 'asc';
        const result = service['compareValues'](valueA, valueB, direction);
        expect(result).toBe(expected);
    });

    it('should compare date values and call isDateString()', () => {
        const isDateStringSpy = spyOn<any>(service, 'isDateString');
        const dateA = '2024-03-26 00:13:43';
        const dateB = '2024-03-27 00:13:43';
        const direction = 'asc';
        const expected = -1;
        const result = service['compareValues'](dateA, dateB, direction);
        expect(isDateStringSpy).toHaveBeenCalled();
        expect(result).toBe(expected);
    });

    it('filterQuestionsBySelectedType should return only the selectedType and should call sortQuestionsByLastModified', () => {
        const sortSpy = spyOn(service, 'sortQuestionsByLastModified').and.callThrough();
        const result = service.filterQuestionsBySelectedType(MOCK_MIXED_QUESTIONS, QuestionType.QRL);
        expect(result).toEqual([MOCK_MIXED_QUESTIONS[0], MOCK_MIXED_QUESTIONS[2]]);
        expect(sortSpy).toHaveBeenCalledWith([MOCK_MIXED_QUESTIONS[0], MOCK_MIXED_QUESTIONS[2]]);
    });

    it('filterQuestionBySelectedType should return original array if selected type is ALL and should not call sortQuestionByLastModified', () => {
        const sortSpy = spyOn(service, 'sortQuestionsByLastModified');
        const result = service.filterQuestionsBySelectedType(MOCK_MIXED_QUESTIONS, 'ALL');
        expect(result).toEqual(MOCK_MIXED_QUESTIONS);
        expect(sortSpy).not.toHaveBeenCalled();
    });
    it('sortById should call sortByName if id=1', () => {
        const playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        service['sortByName'] = jasmine.createSpy('sortByName').and.stub();
        service.sortId = 1;
        service.sortById(service.sortId, 'asc', playerList);
        expect(service['sortByName']).toHaveBeenCalledWith('asc', playerList);
    });
    it('sortById should call sortByPoints if id=2', () => {
        const playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        service['sortByPoints'] = jasmine.createSpy('sortByPoints').and.stub();
        service.sortId = 2;
        service.sortById(service.sortId, 'asc', playerList);
        expect(service['sortByPoints']).toHaveBeenCalledWith('asc', playerList);
    });
    it('sortById should call sortByState if id=3', () => {
        const playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        service['sortByState'] = jasmine.createSpy('sortByState').and.stub();
        service.sortId = 3;
        service.sortById(service.sortId, 'asc', playerList);
        expect(service['sortByState']).toHaveBeenCalledWith('asc', playerList);
    });
    it('sortById should not call anything if id is not between 1 and 3', () => {
        const playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        service['sortByState'] = jasmine.createSpy('sortByState').and.stub();
        service.sortId = 4;
        service.sortById(service.sortId, 'asc', playerList);
        expect(service['sortByState']).not.toHaveBeenCalledWith('asc', playerList);
    });
    it('sortByName should sort the player list by alphabetic name', () => {
        const playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        service['sortByName']('asc', playerList);
        expect(playerList.map((player) => player.name)).toEqual(['Bob', 'Frank']);
    });

    it('sortByName should sort the player list by alphabetic name in reverse', () => {
        const playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        service['sortByName']('desc', playerList);
        expect(playerList.map((player) => player.name)).toEqual(['Frank', 'Bob']);
    });

    it('sortByPoints should sort the player list by points', () => {
        const playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        service['sortByPoints']('asc', playerList);
        expect(playerList.map((player) => player.name)).toEqual(['Frank', 'Bob']);
    });
    it('sortByPoints should sort the player list by points in reverse', () => {
        const playerList = [
            { name: 'Bob', points: 10, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        service['sortByPoints']('desc', playerList);
        expect(playerList.map((player) => player.name)).toEqual(['Bob', 'Frank']);
    });
    it('sortByPoints should sort the player list by name if points are equal', () => {
        const playerList = [
            { name: 'Bob', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Frank', points: 20, isInGame: true, interacted: false, submitted: false, canChat: true },
        ];
        service['sortByPoints']('asc', playerList);
        expect(playerList.map((player) => player.name)).toEqual(['Bob', 'Frank']);
    });

    it('sortByState should sort the player list by state in ascending order', () => {
        const playerList = [
            { name: 'Zekaria', points: 15, isInGame: false, interacted: false, submitted: false, canChat: true },
            { name: 'Mina', points: 15, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Gabriel', points: 15, isInGame: false, interacted: false, submitted: false, canChat: true },
            { name: 'Nour', points: 15, isInGame: true, interacted: true, submitted: false, canChat: true },
            { name: 'Amélie', points: 15, isInGame: true, interacted: true, submitted: true, canChat: true },
            { name: 'Elias', points: 15, isInGame: true, interacted: true, submitted: false, canChat: true },
            { name: 'Huguette', points: 15, isInGame: true, interacted: false, submitted: true, canChat: true },
            { name: 'Gisèle', points: 15, isInGame: true, interacted: true, submitted: false, canChat: true },
            { name: 'Nicole', points: 15, isInGame: true, interacted: false, submitted: true, canChat: true },
        ];
        service['sortByState']('asc', playerList);
        expect(playerList.map((player) => player.name)).toEqual([
            'Mina',
            'Elias',
            'Gisèle',
            'Nour',
            'Huguette',
            'Nicole',
            'Amélie',
            'Gabriel',
            'Zekaria',
        ]);
    });
    it('sortByState should sort the player list by state in descending order', () => {
        const playerList = [
            { name: 'Zekaria', points: 15, isInGame: false, interacted: false, submitted: false, canChat: true },
            { name: 'Mina', points: 15, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Gabriel', points: 15, isInGame: false, interacted: false, submitted: false, canChat: true },
            { name: 'Nour', points: 15, isInGame: true, interacted: true, submitted: false, canChat: true },
            { name: 'Amélie', points: 15, isInGame: true, interacted: true, submitted: true, canChat: true },
            { name: 'Elias', points: 15, isInGame: true, interacted: true, submitted: false, canChat: true },
            { name: 'Huguette', points: 15, isInGame: true, interacted: false, submitted: true, canChat: true },
            { name: 'Gisèle', points: 15, isInGame: true, interacted: true, submitted: false, canChat: true },
            { name: 'Nicole', points: 15, isInGame: true, interacted: false, submitted: true, canChat: true },
        ];
        service['sortByState']('desc', playerList);
        expect(playerList.map((player) => player.name)).toEqual([
            'Zekaria',
            'Gabriel',
            'Amélie',
            'Nicole',
            'Huguette',
            'Nour',
            'Gisèle',
            'Elias',
            'Mina',
        ]);
    });
});
