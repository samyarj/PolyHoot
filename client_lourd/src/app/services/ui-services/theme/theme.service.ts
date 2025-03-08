import { Injectable } from '@angular/core';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { Observer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private defaultThemes: string[] = ['dark', 'light'];
    private ownedThemes: string[] = [];
    private ownedThemesObserver: Partial<Observer<User | null>> = {
        next: (user: User | null) => {
            if (user) {
                if (user?.inventory?.themes) {
                    this.ownedThemes = user?.inventory?.themes;
                }
                if (user?.config?.themeEquipped) {
                    this.setTheme(user?.config?.themeEquipped);
                } else {
                    this.setTheme('dark');
                }
            }
        },
    };
    constructor(private authService: AuthService) {
        this.setTheme('light');
        console.log('setting theme');
        this.authService.user$.subscribe(this.ownedThemesObserver);
    }

    get themes() {
        return [...this.ownedThemes, ...this.defaultThemes];
    }

    setTheme(theme: string) {
        document.documentElement.setAttribute('data-theme', theme);
    }
}
