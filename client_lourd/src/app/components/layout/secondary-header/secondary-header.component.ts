import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HeaderNavigationService } from '@app/services/ui-services/header-navigation.service';

@Component({
    selector: 'app-secondary-header',
    templateUrl: './secondary-header.component.html',
    styleUrls: ['./secondary-header.component.scss'],
})
export class SecondaryHeaderComponent {
    @Input() buttonData: { nameofButton: string; address: string; endCategory: boolean }[] = [];

    constructor(
        private router: Router,
        public dialog: MatDialog,
        private headerService: HeaderNavigationService,
    ) {}

    get isOnGame() {
        return this.headerService.isGameRelatedRoute;
    }

    navigate(route: string): void {
        this.router.navigate([route]);
    }
}
