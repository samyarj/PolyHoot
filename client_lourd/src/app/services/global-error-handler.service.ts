import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { AuthService } from '@app/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class GlobalErrorHandlerService extends ErrorHandler {
    constructor(private injector: Injector) {
        super();
    }

    handleError(error: unknown): void {
        const toastr = this.injector.get(ToastrService);
        const authService = this.injector.get(AuthService);

        error = (error as any)?.rejection ?? error; // <--- 👈 important

        if (error instanceof HttpErrorResponse) {
            return;
        }
        if (error instanceof FirebaseError) {
            const message = this.getFirebaseErrorMessage(error);
            if (message && error.code !== 'permission-denied') {
                toastr.error(message, 'Erreur Firebase');
            }

            if (error.code === 'permission-denied') {
                return;
            }

            console.error('Erreur Firebase :', error);
        } else if (error instanceof Error) {
            // Gérer les erreurs JavaScript générales
            toastr.error(error.message || "Une erreur inattendue s'est produite.", "Erreur d'application");

            // Déconnexion en cas d'erreur critique
            if (error.message === 'Erreur critique') {
                authService.logout();
            }

            console.error('Erreur globale non liée à HTTP :', error);
        } else {
            // Gérer les autres types d'erreurs inconnues
            toastr.error("Une erreur inconnue s'est produite.", "Erreur d'application");
            console.error("Type d'erreur inconnu :", error);
        }

        // Appeler le gestionnaire d'erreurs Angular par défaut
        // super.handleError(error);
    }

    private getFirebaseErrorMessage(error: FirebaseError): string {
        switch (error.code) {
            case 'auth/user-not-found':
                return "Cet utilisateur n'existe pas.";
            case 'auth/invalid-credential':
                return 'Email/Pseudonyme ou mot de passe invalide.';
            case 'auth/email-already-in-use':
                return 'Cet email est déjà utilisé.';
            case 'auth/wrong-password':
                return 'Le mot de passe est incorrect.';
            case 'auth/network-request-failed':
                return 'Une erreur réseau est survenue. Veuillez réessayer.';
            case 'auth/popup-closed-by-user':
                return '';
            default:
                return error.message || 'Une erreur est survenue avec Firebase.';
        }
    }
}
