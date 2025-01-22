import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-menu-bar',
    templateUrl: './menu-bar.component.html',
    styleUrls: ['./menu-bar.component.scss'],
})
export class MenuBarComponent {
    user$: Observable<User | null>;

    constructor(
        private authService: AuthService,
        private router: Router,
    ) {
        this.user$ = this.authService.user$;
    }

    logout(): void {
        this.authService.logout(); // Call the logout method from AuthService
        this.router.navigateByUrl('/login');
    }
}
