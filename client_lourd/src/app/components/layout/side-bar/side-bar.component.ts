import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-side-bar',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
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
