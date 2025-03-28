import { Injectable } from '@angular/core';
import { ChildActivationEnd, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HeaderNavigationService {
    isGameRelatedRoute = false;
    isOnResultsPage = false;
    private readonly gameRoutes = ['/game', '/waiting', '/organizer'];

    constructor(private router: Router) {
        this.router.events
            .pipe(
                filter((event): event is NavigationEnd | ChildActivationEnd => event instanceof NavigationEnd || event instanceof ChildActivationEnd),
            )
            .subscribe(() => {
                const currentUrl = this.router.url;
                this.isGameRelatedRoute = this.gameRoutes.includes(currentUrl);
                this.isOnResultsPage = currentUrl === '/results';
            });
    }
}
