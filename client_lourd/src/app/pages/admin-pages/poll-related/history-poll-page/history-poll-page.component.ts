/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { PublishedPoll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { HistoryPublishedPollService } from '@app/services/poll-services/history-poll.service';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Observer } from 'rxjs';
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
    endDate: '',
    isPublished: true,
    publicationDate: new Date().toISOString(),
    totalVotes: [
        [0, 0, 1],
        [1, 0, 0, 0],
        [0, 1],
    ],
};
/* export const PUBLISHED_POLL_2: PublishedPoll = {
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
    endDate: new Date(2024, 5, 15).toISOString(),
    isPublished: true,
    publicationDate: new Date().toISOString(),
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
}; */

@Component({
    selector: 'app-history-poll-page',
    templateUrl: './history-poll-page.component.html',
    styleUrls: ['./history-poll-page.component.scss'],
})
export class HistoryPollPageComponent {
    currentQuestion: Question | null = null;
    currentQuestionIndex: number;
    labels: string[] = [];
    data: number[] = [];
    publishedPolls: PublishedPoll[] = [];
    backgroundColors: string[] = [
        '#4E5D6C', // muted steel blue-gray
        '#3C3F41', // deep charcoal
        '#505050', // dark slate
        '#2E3A59', // dark indigo-blue
    ];
    currentPoll: PublishedPoll;
    pieChartOptions: ChartConfiguration<'pie'>['options'] = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    pieChartData: ChartData<'pie', number[], string | string[]> = {
        labels: this.labels,
        datasets: [
            {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                data: [25, 35, 20, 20],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            },
        ],
    };

    pieChartType: 'pie' = 'pie';
    private pollsObserver: Partial<Observer<PublishedPoll[]>> = {
        next: (publishedPolls: PublishedPoll[]) => {
            this.publishedPolls = publishedPolls.filter((poll) => poll.expired);
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandler.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    constructor(
        private historyPublishedPollService: HistoryPublishedPollService,
        private messageHandler: MessageHandlerService,
    ) {
        this.historyPublishedPollService.getAllPublishedPolls().subscribe(this.pollsObserver);
    }

    getPublishedPolls() {
        return [PUBLISHED_POLL_1 /* , PUBLISHED_POLL_2, PUBLISHED_POLL_3, PUBLISHED_POLL_4 */];
    }

    show(poll: PublishedPoll) {
        this.currentQuestionIndex = 0;
        this.currentPoll = poll;
        this.showQuestion();
    }

    previousQuestion() {
        if (this.currentQuestionIndex - 1 < 0) {
            return;
        } else {
            this.currentQuestionIndex = this.currentQuestionIndex - 1;
            this.showQuestion();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex + 1 > this.currentPoll.questions.length - 1) {
            return;
        } else {
            this.currentQuestionIndex = this.currentQuestionIndex + 1;
            this.showQuestion();
        }
    }

    showQuestion() {
        this.currentQuestion = this.currentPoll.questions[this.currentQuestionIndex];
        if (this.currentQuestion.choices) {
            this.labels = this.currentQuestion.choices.map((choice) => choice.text);
            this.data = this.currentPoll.totalVotes[this.currentQuestionIndex];
            this.pieChartData = {
                labels: this.labels,
                datasets: [
                    {
                        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                        data: this.data,
                        backgroundColor: this.backgroundColors,
                    },
                ],
            };
        }
    }
}
