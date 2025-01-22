// comment redirect : https://stackoverflow.com/questions/47010159/how-to-redirect-to-a-new-page-in-angular-4-through-button-click

import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppRoute } from '@app/constants/enum-class';
import { AuthentificationService } from '@app/services/admin-services/authentification-service/authentification.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
    password = new FormControl('');
    passwordVisible: boolean = false;

    passwordObserver: Partial<Observer<boolean>> = {
        next: (isPasswordOk: boolean) => {
            if (isPasswordOk) {
                const route = this.route.snapshot.queryParams['returnUrl'] || AppRoute.ADMIN;
                this.authentification.authorize();
                this.router.navigate([route]);
            } else {
                this.messageHandlerService.popUpErrorDialog('Mauvais mot de passe: accès refusé');
            }
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    // lint disable car le constructeur a 4 paramètres plutôt que 3
    // 1 fichier = 1 responsabilité d'où les 4 paramètres
    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private authentification: AuthentificationService,
        private messageHandlerService: MessageHandlerService,
        private route: ActivatedRoute,
    ) {}

    onClick() {
        if (this.password.value) this.authentification.verifyPassword(this.password.value).subscribe(this.passwordObserver);
    }

    home() {
        this.router.navigate([AppRoute.HOME]);
    }

    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }
}
