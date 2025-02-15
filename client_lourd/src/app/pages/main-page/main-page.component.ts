import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(
        private router: Router,
        public dialog: MatDialog,
    ) {}

    navigate(route: string): void {
        this.router.navigate([route]);
    }
}
