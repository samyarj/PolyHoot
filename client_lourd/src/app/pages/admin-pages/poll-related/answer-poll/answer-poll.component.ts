import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY_PUBLISHED_POLL } from '@app/constants/mock-constants';
import { PublishedPoll } from '@app/interfaces/poll';
import { Question } from '@app/interfaces/question';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { HistoryPublishedPollService } from '@app/services/poll-services/history-poll.service';
import { ToastrService } from 'ngx-toastr';
import { map, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';

enum PollState {
    NotStarted = 'not_started',
    Started = 'started',
    Finished = 'finished',
}

const NO_SELECTION = -1;
@Component({
    selector: 'app-answer-poll',
    templateUrl: './answer-poll.component.html',
    styleUrls: ['./answer-poll.component.scss'],
})
export class AnswerPollComponent implements OnInit, OnDestroy {
    state: PollState = PollState.NotStarted;
    currentQuestion: Question;
    currentIndex: number = 0;
    selectedChoice: number = NO_SELECTION;
    errorMessage: string | null = null;
    poll: PublishedPoll = EMPTY_PUBLISHED_POLL;
    playerAnswer: number[] = [];
    user: User | null;

    private destroy$ = new Subject<void>();
    // eslint-disable-next-line max-params
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private historyPublishedPollService: HistoryPublishedPollService,
        private toastr: ToastrService,
        private authService: AuthService,
        private http: HttpClient,
    ) {
        this.user = this.authService.getUser();
    }
    ngOnInit(): void {
        /* this.data.pollStatus$.pipe(takeUntil(this.destroy$)).subscribe((currentPoll) => {
            if (currentPoll?.expired) {
                this.dialogRef.close('expired');
            }
        }); */
        const pollId = this.route.snapshot.paramMap.get('id');
        console.log('pollId: ', pollId);
        this.historyPublishedPollService
            .watchPublishedPolls()
            .pipe(
                takeUntil(this.destroy$),
                map((polls) => polls.find((p) => p.id === pollId)),
            )
            .subscribe((poll) => {
                if (!poll) {
                    this.toastr.error('Sondage introuvable');
                    this.router.navigate(['/']);
                    return;
                }

                if (poll.expired) {
                    this.toastr.error('Ce sondage a expiré');
                    this.router.navigate(['/']);
                    return;
                }
                this.poll = poll;
            });
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    startPoll() {
        this.currentQuestion = this.poll.questions[this.currentIndex];
        this.state = PollState.Started;
    }

    nextQuestion() {
        if (this.selectedChoice !== NO_SELECTION && this.currentIndex < this.poll.questions.length - 1) {
            this.currentIndex++;
            this.playerAnswer.push(this.selectedChoice);
            this.selectedChoice = NO_SELECTION;
            this.currentQuestion = this.poll.questions[this.currentIndex];
        } else {
            this.playerAnswer.push(this.selectedChoice);
            this.selectedChoice = NO_SELECTION;
            this.state = PollState.Finished;
        }
    }

    selectChoice(index: number) {
        if (index === this.selectedChoice) {
            this.selectedChoice = NO_SELECTION;
        } else {
            this.selectedChoice = index;
        }
    }
    onSubmit(): void {
        // this.dialogRef.close(this.playerAnswer);
        if (this.user && this.user.uid && this.poll.id) {
            this.http.patch(`${environment.serverUrl}/published-polls/${this.user.uid}/addPollsAnswered/`, { id: this.poll.id }).subscribe({
                error: (error) => {
                    console.error('Erreur lors de la mise à jour de pollsAnswered:', error);
                },
            });
        }
    }

    onClose(): void {
        this.router.navigate(['/']);
    }
    /*  private updateUserPollsAnswered(id: string | undefined) {
        if (this.user && this.user.uid && id) {
            this.http.patch(`${environment.serverUrl}/published-polls/${this.user.uid}/addPollsAnswered/`, { id }).subscribe({
                error: (error) => {
                    console.error('Erreur lors de la mise à jour de pollsAnswered:', error);
                },
            });
        }
    } */
}
