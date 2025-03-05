import { Component, OnInit } from '@angular/core';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { ThemeService } from '@app/services/ui-services/theme/theme.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-main-header',
    templateUrl: './main-header.component.html',
    styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent implements OnInit {
    currentTheme: 'dark' | 'light' = 'dark';
    user$: Observable<User | null>;

    constructor(
        private themeService: ThemeService,
        private authService: AuthService,
    ) {
        this.user$ = this.authService.user$;
    }

    ngOnInit() {
        this.currentTheme = this.themeService.getTheme();
        this.themeService.setTheme(this.currentTheme);
    }

    toggleTheme() {
        this.themeService.toggleTheme();
        this.currentTheme = this.themeService.getTheme();
    }
}
