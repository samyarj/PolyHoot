import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PollPlayerPopInComponent } from '@app/components/general-elements/poll-player-pop-in/poll-player-pop-in.component';
import { Poll, PublishedPoll } from '@app/interfaces/poll';
import { QuestionType } from '@app/interfaces/question-type';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { HeaderNavigationService } from '@app/services/ui-services/header-navigation.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-main-header',
    templateUrl: './main-header.component.html',
    styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
    user: User | null;
    poll: Poll = {
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
        expired: false,
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        endDate: '',
        isPublished: false,
    };

    constructor(
        private authService: AuthService,
        private headerService: HeaderNavigationService,
        private dialog: MatDialog,
        private toastr: ToastrService,
        private http: HttpClient,
    ) {
        this.authService.user$.subscribe({
            next: (user: User | null) => {
                this.user = user;
            },
        });
    }

    get isOnGamePage() {
        return this.headerService.isGameRelatedRoute;
    }

    openPollAnswer() {
        const dialogRef = this.dialog.open(PollPlayerPopInComponent, {
            // width: '40%',
            backdropClass: 'quiz-info-popup',
            panelClass: 'custom-container',
            data: { poll: this.poll, isAdmin: false },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.toastr.success('Sondage complete, voir console pour les reponses retournees!');
                this.http.patch<PublishedPoll[]>(`${environment.serverUrl}/published-polls/${this.poll.id}`, result);
                console.log('Resultat du sondage envoye:');
                console.log(result);
            } else {
                this.toastr.warning('Complétion de sondage annulé');
            }
        });
    }
}
