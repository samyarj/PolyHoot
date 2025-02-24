import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

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
    ) {}

    navigate(route: string): void {
        this.router.navigate([route]);
    }
}
