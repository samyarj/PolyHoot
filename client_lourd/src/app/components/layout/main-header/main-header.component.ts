import { Component } from '@angular/core';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { HeaderNavigationService } from '@app/services/ui-services/header-navigation.service';

@Component({
    selector: 'app-main-header',
    templateUrl: './main-header.component.html',
    styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
    user: User | null;

    constructor(
        private authService: AuthService,
        private headerService: HeaderNavigationService,
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
        console.log('REAL');
    }
}
