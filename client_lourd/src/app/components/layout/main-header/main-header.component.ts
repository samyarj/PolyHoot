import { Component, OnInit } from '@angular/core';
import { ThemeService } from '@app/services/ui-services/theme/theme.service';

@Component({
    selector: 'app-main-header',
    templateUrl: './main-header.component.html',
    styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent implements OnInit {
    currentTheme: 'dark' | 'light' = 'dark';

    constructor(private themeService: ThemeService) {}

    ngOnInit() {
        this.currentTheme = this.themeService.getTheme();
        this.themeService.setTheme(this.currentTheme);
    }

    toggleTheme() {
        this.themeService.toggleTheme();
        this.currentTheme = this.themeService.getTheme();
    }
}
