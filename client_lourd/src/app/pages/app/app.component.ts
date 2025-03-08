import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MIN_LOADING_TIME } from '@app/constants/constants';
import { AuthService } from '@app/services/auth/auth.service';
import { ThemeService } from '@app/services/ui-services/theme/theme.service';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    showSpinner$ = new BehaviorSubject<boolean>(true);

    constructor(
        public authService: AuthService,
        public themeService: ThemeService,
        private router: Router,
    ) {
        combineLatest([this.authService.loadingToken$.pipe(startWith(true)), new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME))])
            .pipe(map(([isLoading]) => isLoading))
            .subscribe((loading) => this.showSpinner$.next(loading));
    }

    get isLoginOrSignUp(): boolean {
        const authRoutes = ['login', 'signup', 'forgot-password'];
        return authRoutes.includes(this.router.url.split('?')[0].split('#')[0].replace('/', ''));
    }
}
