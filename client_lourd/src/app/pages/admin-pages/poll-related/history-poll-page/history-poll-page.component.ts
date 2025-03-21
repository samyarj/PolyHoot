import { Component } from '@angular/core';
import { PublishedPoll } from '@app/interfaces/poll';
import { QuestionType } from '@app/interfaces/question-type';
import { ChartConfiguration, ChartData } from 'chart.js';
export const PUBLISHED_POLL_1: PublishedPoll = {
    title: 'Premier sondage',
    description: 'Sondage portant sur les items par défaut de la boutique',
    questions: [
        {
            type: QuestionType.QCM,
            text: 'Quel est votre avatar préféré ?',
            points: 0,
            choices: [{ text: 'Wonder Woman' }, { text: 'Superman' }, { text: 'Spider-man' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quel est votre thème préféré ?',
            points: 0,
            choices: [{ text: 'vice' }, { text: 'celstial' }, { text: 'dark' }, { text: 'sunset' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quel est votre banner préférée ?',
            points: 0,
            choices: [{ text: 'league of legends' }, { text: 'le cercle jaune là' }],
        },
    ],
    expired: true,
    endDate: new Date(2024, 4, 1).toISOString(),
    isPublished: true,
    publicationDate: new Date().toISOString(),
    totalVotes: [
        [0, 0, 1],
        [1, 0, 0, 0],
        [0, 1],
    ],
};
export const PUBLISHED_POLL_2: PublishedPoll = {
    title: 'Préférences alimentaires',
    description: 'Sondage pour découvrir les plats préférés des utilisateurs',
    questions: [
        {
            type: QuestionType.QCM,
            text: 'Quel est votre plat préféré ?',
            points: 0,
            choices: [{ text: 'Pizza' }, { text: 'Sushi' }, { text: 'Tacos' }, { text: 'Pâtes' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quel est votre dessert préféré ?',
            points: 0,
            choices: [{ text: 'Gâteau au chocolat' }, { text: 'Crème brûlée' }, { text: 'Tarte aux pommes' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quelle est votre boisson préférée ?',
            points: 0,
            choices: [{ text: 'Café' }, { text: 'Thé' }, { text: "Jus d'orange" }, { text: 'Eau' }],
        },
    ],
    expired: true,
    endDate: new Date(2024, 5, 15),
    isPublished: true,
    publicationDate: new Date(),
    totalVotes: [
        [2, 3, 1, 4], // Votes pour les plats
        [5, 2, 3], // Votes pour les desserts
        [7, 6, 4, 3], // Votes pour les boissons
    ],
};
export const PUBLISHED_POLL_3: PublishedPoll = {
    title: 'Loisirs préférés',
    description: 'Sondage pour connaître les activités préférées des utilisateurs',
    questions: [
        {
            type: QuestionType.QCM,
            text: 'Quel est votre loisir préféré ?',
            points: 0,
            choices: [{ text: 'Lire' }, { text: 'Jouer aux jeux vidéo' }, { text: 'Faire du sport' }, { text: 'Regarder des films' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quel est votre sport préféré ?',
            points: 0,
            choices: [{ text: 'Football' }, { text: 'Basketball' }, { text: 'Tennis' }, { text: 'Natation' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quel est votre genre de film préféré ?',
            points: 0,
            choices: [{ text: 'Action' }, { text: 'Comédie' }, { text: 'Science-fiction' }, { text: 'Drame' }],
        },
    ],
    expired: false,
    endDate: new Date(2024, 6, 20),
    isPublished: true,
    publicationDate: new Date(),
    totalVotes: [
        [10, 5, 8, 7], // Votes pour les loisirs
        [6, 9, 4, 5], // Votes pour les sports
        [12, 8, 6, 9], // Votes pour les genres de films
    ],
};
export const PUBLISHED_POLL_4: PublishedPoll = {
    title: 'Destinations de voyage',
    description: 'Sondage pour découvrir les destinations de voyage préférées des utilisateurs',
    questions: [
        {
            type: QuestionType.QCM,
            text: 'Quelle est votre destination de voyage préférée ?',
            points: 0,
            choices: [{ text: 'Paris' }, { text: 'Tokyo' }, { text: 'New York' }, { text: 'Bali' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quel type de voyage préférez-vous ?',
            points: 0,
            choices: [{ text: 'Aventure' }, { text: 'Détente' }, { text: 'Culturel' }, { text: 'Gastronomique' }],
        },
        {
            type: QuestionType.QCM,
            text: 'Quel est votre moyen de transport préféré pour voyager ?',
            points: 0,
            choices: [{ text: 'Avion' }, { text: 'Train' }, { text: 'Voiture' }, { text: 'Bateau' }],
        },
    ],
    expired: false,
    endDate: new Date(2024, 7, 10),
    isPublished: true,
    publicationDate: new Date(),
    totalVotes: [
        [15, 10, 12, 8], // Votes pour les destinations
        [9, 14, 11, 6], // Votes pour les types de voyage
        [20, 8, 5, 7], // Votes pour les moyens de transport
    ],
};
@Component({
    selector: 'app-history-poll-page',
    templateUrl: './history-poll-page.component.html',
    styleUrls: ['./history-poll-page.component.scss'],
})
export class HistoryPollPageComponent {
    isShown: boolean = false;

    pieChartOptions: ChartConfiguration<'pie'>['options'] = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    pieChartData: ChartData<'pie', number[], string | string[]> = {
        labels: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        datasets: [
            {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                data: [25, 35, 20, 20],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            },
        ],
    };

    pieChartType: 'pie' = 'pie';

    show() {
        this.isShown = !this.isShown;
        console.log(this.isShown);
    }
}
