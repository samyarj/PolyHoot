import { Component } from '@angular/core';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { HeaderNavigationService } from '@app/services/ui-services/header-navigation.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-main-header',
    templateUrl: './main-header.component.html',
    styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
    user$: Observable<User | null>;

    constructor(
        private authService: AuthService,
        private headerService: HeaderNavigationService,
    ) {
        this.user$ = this.authService.user$;
    }

    get isOnGamePage() {
        return this.headerService.isGameRelatedRoute;
    }
}
