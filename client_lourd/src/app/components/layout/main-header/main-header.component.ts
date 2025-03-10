import { Component } from '@angular/core';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-main-header',
    templateUrl: './main-header.component.html',
    styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
    user$: Observable<User | null>;

    constructor(private authService: AuthService) {
        this.user$ = this.authService.user$;
    }
}
