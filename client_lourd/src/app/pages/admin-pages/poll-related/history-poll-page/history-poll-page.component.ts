/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublishedPoll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { HistoryPublishedPollService } from '@app/services/poll-services/history-poll.service';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
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
    math = Math;
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
    private routeSub: Subscription; // Nouvelle subscription pour les changements de route
    private publishedPollsSubscription: Subscription;
    private deletedPollsSubscription: Subscription;

    constructor(
        private historyPublishedPollService: HistoryPublishedPollService,
        private route: ActivatedRoute,
        private router: Router, // Ajouter Router
        private toastr: ToastrService,
    ) {
        console.log('CurrentPoll:', this.currentPoll?.title);
    }

    ngOnInit(): void {
        // S'abonner aux changements dans les sondages publiés
        this.publishedPollsSubscription = this.historyPublishedPollService.watchPublishedPolls().subscribe((publishedPolls) => {
            this.publishedPolls = publishedPolls.filter((poll) => poll.expired);
            this.initRouteListener();
        });

        this.deletedPollsSubscription = this.historyPublishedPollService.watchDeletedExpiredPolls().subscribe(() => {
            this.toastr.success("Supprimé l'historique des sondages expirés avec succès.");
        });
    }

    ngOnDestroy(): void {
        // Se désabonner des observables
        if (this.publishedPollsSubscription) this.publishedPollsSubscription.unsubscribe();
        if (this.deletedPollsSubscription) this.deletedPollsSubscription.unsubscribe();
        if (this.routeSub) this.routeSub.unsubscribe(); // N'oubliez pas de désabonner
    }

    getMaxValue(): number {
        return Math.max(...this.data);
    }

    show(poll: PublishedPoll) {
        console.log('rentré avec poll', poll.title, 'currentPoll', this.currentPoll?.title);
        this.currentQuestionIndex = 0;
        this.currentPoll = poll;
        this.updateUrl(poll.id); // Mettre à jour l'URL quand on change de poll
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
        if (this.currentQuestionIndex + 1 > this.currentPoll.questions.length - 1) return;
        else {
            this.currentQuestionIndex++;
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
            console.log(this.data);
        }
    }
    deleteAllExpiredPolls() {
        this.historyPublishedPollService.deleteAllExpiredPolls();
    }
    private updateUrl(pollId?: string): void {
        console.log("L'url il a changé, dans updateUrl");
        this.router.navigate(['/polls/history/', pollId], {
            replaceUrl: true, // Empêche l'accumulation d'historique
        });
    }

    private initRouteListener() {
        console.log('entré dans le listener ngoninit');
        const initialPollId = this.route.snapshot.paramMap.get('id');
        if (!initialPollId) return;
        console.log(initialPollId);
        const existingPoll = this.publishedPolls.find((p) => p.id === initialPollId);
        console.log(this.publishedPolls);
        if (existingPoll) {
            console.log('Bah le poll existe logique');
            this.show(existingPoll);
        }

        this.routeSub = this.route.paramMap.subscribe((params) => {
            console.log('LIstener actif pcq url a changé ');
            const pollId = params.get('id');
            if (!pollId) return;

            // Vérifie si le poll est déjà chargé (même référence)
            const pollInArray = this.publishedPolls.find((p) => p.id === pollId);
            if (this.currentPoll === pollInArray) {
                console.log('Les ref sont identiques');
            } else {
                console.log('Le poll existe');
                if (pollInArray) this.show(pollInArray);
            }
        });
    }
}
