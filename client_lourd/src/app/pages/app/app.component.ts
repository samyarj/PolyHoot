import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MIN_LOADING_TIME } from '@app/constants/constants';
import { AuthService } from '@app/services/auth/auth.service';
import { EnvironmentService } from '@app/services/environment/environment.service';
import { FirebaseInitService } from '@app/services/environment/firebase-init.service';
import { HeaderNavigationService } from '@app/services/ui-services/header-navigation.service';
import { ThemeService } from '@app/services/ui-services/theme/theme.service';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    showSpinner$ = new BehaviorSubject<boolean>(true);

    constructor(
        public authService: AuthService,
        public themeService: ThemeService,
        private router: Router,
        private headerService: HeaderNavigationService,
        private environmentService: EnvironmentService,
        private firebaseInitService: FirebaseInitService,
    ) {
        if (authService.isAuthenticated()) {
            router.navigate(['/home']);
        }
        combineLatest([this.authService.loadingToken$.pipe(startWith(true)), new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME))])
            .pipe(map(([isLoading]) => isLoading))
            .subscribe((loading) => this.showSpinner$.next(loading));
    }

    ngOnInit(): void {
        // Initialize Firebase with the proper configuration
        this.firebaseInitService.initializeFirebase();

        // Log the current environment
        if (this.environmentService.isElectron) {
            console.log('Running in Electron environment');
            // Set up electron-specific listeners
            this.setupElectronListeners();
        } else {
            console.log('Running in browser environment');
        }
    }

    private setupElectronListeners(): void {
        // Listen for deep links (for OAuth redirects)
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'deep-link') {
                console.log('Received deep link:', event.data.url);
                // Handle OAuth redirects here
            }
        });
    }

    get isOnGamePage() {
        return this.headerService.isGameRelatedRoute;
    }
    get isLoginOrSignUp(): boolean {
        const authRoutes = ['login', 'signup', 'forgot-password'];
        return authRoutes.includes(this.router.url.split('?')[0].split('#')[0].replace('/', ''));
    }
}
