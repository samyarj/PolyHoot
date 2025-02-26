import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private currentTheme = 'dark';

    setTheme(theme: 'dark' | 'light') {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme); // Save theme preference
    }

    getTheme(): 'dark' | 'light' {
        return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}
