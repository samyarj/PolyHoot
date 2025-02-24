import { Component } from '@angular/core';

@Component({
    selector: 'app-daily-free-page',
    templateUrl: './daily-free-page.component.html',
    styleUrls: ['./daily-free-page.component.scss'],
})
export class DailyFreePageComponent {
    isMoved = false;

    toggleMove() {
        this.isMoved = !this.isMoved;
    }
}
