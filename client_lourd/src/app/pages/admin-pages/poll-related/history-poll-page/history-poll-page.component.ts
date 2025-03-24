/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PublishedPoll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { HistoryPublishedPollService } from '@app/services/poll-services/history-poll.service';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-history-poll-page',
    templateUrl: './history-poll-page.component.html',
    styleUrls: ['./history-poll-page.component.scss'],
})
export class HistoryPollPageComponent implements OnInit, OnDestroy {
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
    private publishedPollsSubscription: Subscription;
    constructor(private historyPublishedPollService: HistoryPublishedPollService) {}

    ngOnInit(): void {
        // S'abonner aux changements dans les sondages publiés
        this.publishedPollsSubscription = this.historyPublishedPollService.watchPublishedPolls().subscribe((publishedPolls) => {
            console.log('Dans le watchPublishedPolls du component');
            this.publishedPolls = publishedPolls.filter((poll) => poll.expired);
        });
    }

    ngOnDestroy(): void {
        // Se désabonner des observables
        if (this.publishedPollsSubscription) this.publishedPollsSubscription.unsubscribe();
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
    deleteAllExpiredPolls(){
        this.historyPublishedPollService.deleteAllExpiredPolls();
    }
}
