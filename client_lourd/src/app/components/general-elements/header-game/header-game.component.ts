import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoute } from '@app/constants/enum-class';

@Component({
    selector: 'app-header-game',
    templateUrl: './header-game.component.html',
    styleUrls: ['./header-game.component.scss'],
})
export class HeaderGameComponent {
    @Input() title: string;
    @Input() onLogoClick: () => void;
    constructor(private router: Router) {}

    redirectToPage() {
        if (this.onLogoClick) {
            this.onLogoClick();
        } else this.router.navigate([AppRoute.HOME]);
    }
}
