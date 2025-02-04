/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@app/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private toastr: ToastrService,
        private authService: AuthService,
    ) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(req).pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            console.error('Erreur coté client:', error.error.message);
            this.toastr.error('Une erreur réseau est survenue. Veuillez réessayer.", "Erreur réseau');
        } else {
            // Backend error
            console.error('Erreur Back-end:', error);

            const message = error.error?.message || "Une erreur inattendue s'est produite.";
            switch (error.status) {
                case 400:
                    this.toastr.error(message || 'Requête invalide. Veuillez vérifier les informations saisies.', 'Erreur');
                    break;
                case 401:
                    this.toastr.warning(message || 'Votre session a expiré. Veuillez vous reconnecter.', 'Non autorisé');
                    this.authService.logout();
                    break;
                case 403:
                    this.toastr.error(message || "Vous n'avez pas l'autorisation d'effectuer cette action.", 'Accès refusé');
                    break;
                case 404:
                    this.toastr.error(message || 'La ressource demandée est introuvable.', 'Erreur 404');
                    break;
                case 500:
                    this.toastr.error(message || 'Une erreur interne du serveur est survenue. Veuillez réessayer plus tard.', 'Erreur serveur');
                    break;
                default:
                    this.toastr.error(message || "Une erreur s'est produite. Veuillez réessayer.", 'Erreur');
            }
        }

        // Re-throw the error so it can be handled further if needed
        return throwError(() => error);
    }
}
