import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppRoute } from '@app/constants/enum-class';
import { AuthentificationService } from '@app/services/admin-services/authentification-service/authentification.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(
        private router: Router,
        private authService: AuthentificationService,
        public dialog: MatDialog,
    ) {}

    navigate(route: string): void {
        this.router.navigate([route]);
    }

    navigateToAdmin() {
        if (this.authService.getStatus()) {
            this.router.navigate([AppRoute.ADMIN]);
        } else {
            this.router.navigate([AppRoute.LOGIN]);
        }
    }
}
