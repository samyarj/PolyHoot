/* eslint-disable @typescript-eslint/no-magic-numbers */
// Les -1 sont utilisés pour la logique de tri
import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { ASC } from '@app/constants/constants';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { Quiz } from '@app/interfaces/quiz';
import { PartialPlayer } from '@common/partial-player';

@Injectable({
    providedIn: 'root',
})
export class SortingService {
    sortsOptions: { id: number; name: string }[] = [
        { id: 1, name: 'Nom' },
        { id: 2, name: 'Pointage' },
        { id: 3, name: "État d'interaction" },
    ];
    sortId: number = 1;
    sortDirection: SortDirection = 'asc';
    sortQuestionsByLastModified(questions: Question[]): Question[] {
        const sortedQuestions = questions.sort((a, b) => {
            const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
            const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
            return dateA - dateB;
        });
        return sortedQuestions.map((question) => {
            if (!question.lastModified) {
                question.lastModified = new Date().toString();
            }
            return question;
        });
    }

    sortQuizByLastModified(quizzes: Quiz[]): Quiz[] {
        return quizzes.sort((a, b) => {
            const dateA = new Date(a.lastModification).getTime();
            const dateB = new Date(b.lastModification).getTime();
            return dateA - dateB;
        });
    }

    filterQuestionsBySelectedType(questions: Question[], selectedType: string): Question[] {
        if (selectedType !== 'ALL') {
            const selectedQuestions = questions.filter((question) => question.type === selectedType);
            return this.sortQuestionsByLastModified(selectedQuestions);
        }
        return questions;
    }

    sortGamesByColumn(column: keyof Game, direction: SortDirection, games: Game[]): void {
        games.sort((a: Game, b: Game) => {
            const valueA = a[column];
            const valueB = b[column];

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return this.compareValues(valueA, valueB, direction);
            }
            return 0;
        });
    }

    sortById(sortId: number, direction: SortDirection, playerList: PartialPlayer[]) {
        this.sortId = sortId;
        this.sortDirection = direction;

        switch (sortId) {
            case 1: {
                this.sortByName(direction, playerList);

                break;
            }
            case 2: {
                this.sortByPoints(direction, playerList);

                break;
            }
            case 3: {
                this.sortByState(direction, playerList);

                break;
            }
            default: {
                break;
            }
        }
    }
    private sortByName(direction: SortDirection, playerList: PartialPlayer[]) {
        playerList.sort((a, b) => a.name.localeCompare(b.name));
        if (direction === 'desc') {
            playerList.reverse();
        }
    }

    private sortByPoints(direction: SortDirection, playerList: PartialPlayer[]) {
        playerList.sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points; // Tri par points décroissants
            } else {
                return a.name.localeCompare(b.name); // Tri par nom croissant si les points sont égaux
            }
        });
        if (direction === 'desc') {
            playerList.reverse();
        }
    }

    private sortByState(direction: SortDirection, playerList: PartialPlayer[]) {
        playerList.sort((a, b) => {
            if (!a.isInGame && b.isInGame) {
                return 1;
            } else if (a.isInGame && !b.isInGame) {
                return -1;
            }
            if (a.submitted && !b.submitted) {
                return 1;
            } else if (!a.submitted && b.submitted) {
                return -1;
            }
            if (!a.interacted && b.interacted) {
                return -1;
            } else if (a.interacted && !b.interacted) {
                return 1;
            }
            return a.name.localeCompare(b.name);
        });
        if (direction === 'desc') {
            playerList.reverse();
        }
    }
    private compareValues(valueA: string, valueB: string, direction: SortDirection): number {
        // Compare Dates.
        if (this.isDateString(valueA) && this.isDateString(valueB)) {
            const dateA = new Date(valueA as string);
            const dateB = new Date(valueB as string);
            return direction === ASC ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }
        // Compare strings.
        else {
            return direction === ASC ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }
    }

    private isDateString(value: string): boolean {
        return !isNaN(Date.parse(value));
    }
}
